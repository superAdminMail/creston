import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import {
  isDiditActiveStatus,
  isDiditRetryableStatus,
  isDiditResumableStatus,
  isDiditSessionStale,
  retrieveDiditSession,
  resolveDiditKycFinalState,
} from "@/lib/kyc/didit";

export async function getLatestKycVerificationSession(
  investorProfileId: string,
) {
  return prisma.kycVerificationSession.findFirst({
    where: { investorProfileId },
    orderBy: { createdAt: "desc" },
  });
}

function toJsonValue(
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (value === null) {
    return Prisma.JsonNull;
  }

  return value as Prisma.InputJsonValue;
}

function toOptionalJsonValue(
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) {
    return undefined;
  }

  return toJsonValue(value);
}

export async function createLocalKycVerificationSession(params: {
  investorProfileId: string;
  providerSessionId: string;
  sessionUrl?: string | null;
  callbackUrl?: string | null;
  status?: string;
  rawPayload?: unknown;
}) {
  return prisma.kycVerificationSession.create({
    data: {
      investorProfileId: params.investorProfileId,
      provider: "DIDIT",
      providerSessionId: params.providerSessionId,
      sessionUrl: params.sessionUrl ?? null,
      callbackUrl: params.callbackUrl ?? null,
      status: params.status ?? "Not Started",
      startedAt: new Date(),
      rawPayload: toOptionalJsonValue(params.rawPayload),
      attemptCount: 1,
      lastSyncedAt: new Date(),
    },
  });
}

export async function markKycVerificationSessionStatus(params: {
  providerSessionId: string;
  status: string;
  rawPayload?: unknown;
}) {
  const normalized = resolveDiditKycFinalState(params.status);
  const now = new Date();

  const currentSession = await prisma.kycVerificationSession.findUnique({
    where: { providerSessionId: params.providerSessionId },
    include: {
      investorProfile: {
        select: {
          id: true,
          kycStatus: true,
          isVerified: true,
          userId: true,
        },
      },
    },
  });

  if (!currentSession) {
    throw new Error(
      `KYC verification session not found: ${params.providerSessionId}`,
    );
  }

  const shouldSetCompletedAt =
    normalized.providerStatus === "Approved" ||
    normalized.providerStatus === "Declined";
  const shouldSetAbandonedAt = normalized.providerStatus === "Abandoned";
  const shouldSetExpiredAt = normalized.providerStatus === "Expired";

  const currentAppStatus = currentSession.investorProfile?.kycStatus ?? null;
  const currentVerified = currentSession.investorProfile?.isVerified ?? false;
  const sessionStatusChanged =
    currentSession.status !== normalized.providerStatus;
  const profileChanged =
    currentAppStatus !== normalized.appStatus ||
    currentVerified !== normalized.isVerified;
  const changed = sessionStatusChanged || profileChanged;

  await prisma.$transaction(async (tx) => {
    await tx.kycVerificationSession.update({
      where: { id: currentSession.id },
      data: {
        status: normalized.providerStatus ?? currentSession.status,
        lastSyncedAt: now,
        rawPayload:
          params.rawPayload === undefined
            ? undefined
            : toOptionalJsonValue(params.rawPayload),
        completedAt: shouldSetCompletedAt
          ? currentSession.completedAt ?? now
          : currentSession.completedAt,
        abandonedAt: shouldSetAbandonedAt
          ? currentSession.abandonedAt ?? now
          : currentSession.abandonedAt,
        expiredAt: shouldSetExpiredAt
          ? currentSession.expiredAt ?? now
          : currentSession.expiredAt,
      },
    });

    if (profileChanged) {
      await tx.investorProfile.update({
        where: { id: currentSession.investorProfileId },
        data: {
          kycStatus: normalized.appStatus,
          isVerified: normalized.isVerified,
        },
      });
    }
  });

  const session = await prisma.kycVerificationSession.findUnique({
    where: { id: currentSession.id },
    include: {
      investorProfile: {
        select: {
          id: true,
          userId: true,
          kycStatus: true,
          isVerified: true,
        },
      },
    },
  });

  if (!session) {
    throw new Error(
      `KYC verification session not found after update: ${params.providerSessionId}`,
    );
  }

  console.log("[KYC_FINALIZED]", {
    providerSessionId: params.providerSessionId,
    providerStatus: normalized.providerStatus,
    appStatus: normalized.appStatus,
    sessionUpdated: true,
    profileUpdated: profileChanged,
    changed,
  });

  return {
    changed,
    session,
    sessionUpdated: true,
    profileUpdated: profileChanged,
    appStatus: normalized.appStatus,
    providerStatus: normalized.providerStatus,
  };
}

function canRemoteReconcileDiditStatus(status: string | null | undefined) {
  return isDiditResumableStatus(status) || status === "In Review";
}

export async function syncLatestKycSessionIfNeeded(
  investorProfileId: string,
  options: { forceRemote?: boolean } = {},
) {
  const session = await getLatestKycVerificationSession(investorProfileId);
  if (!session) return null;

  const sessionAgeAnchor = session.lastSyncedAt ?? session.updatedAt;
  const finalState = resolveDiditKycFinalState(session.status);
  const profile = await prisma.investorProfile.findUnique({
    where: { id: investorProfileId },
    select: {
      kycStatus: true,
      isVerified: true,
    },
  });

  const profileNeedsSync =
    !!profile &&
    (profile.kycStatus !== finalState.appStatus ||
      profile.isVerified !== finalState.isVerified);
  const shouldAttemptRemoteSync =
    canRemoteReconcileDiditStatus(session.status) &&
    (options.forceRemote || isDiditSessionStale(sessionAgeAnchor));

  if (shouldAttemptRemoteSync) {
    try {
      const diditSession = await retrieveDiditSession(session.providerSessionId);
      const remoteStatus =
        typeof diditSession?.status === "string" ? diditSession.status : session.status;

      const refreshed = await markKycVerificationSessionStatus({
        providerSessionId: session.providerSessionId,
        status: remoteStatus,
        rawPayload: diditSession,
      });

      console.log("[KYC_SESSION_SYNC]", {
        providerSessionId: session.providerSessionId,
        remoteStatus,
        appStatus: refreshed.appStatus,
        profileUpdated: refreshed.profileUpdated,
        sessionUpdated: refreshed.sessionUpdated,
        changed: refreshed.changed,
      });

      return refreshed.session;
    } catch (error) {
      console.error("[KYC_SESSION_SYNC_ERROR]", error);
    }
  }

  if (
    profileNeedsSync &&
    finalState.appStatus !== "NOT_STARTED" &&
    !canRemoteReconcileDiditStatus(session.status)
  ) {
    try {
      const refreshed = await markKycVerificationSessionStatus({
        providerSessionId: session.providerSessionId,
        status: session.status,
        rawPayload: session.rawPayload ?? undefined,
      });

      console.log("[KYC_SESSION_PROFILE_SYNC]", {
        providerSessionId: session.providerSessionId,
        providerStatus: session.status,
        appStatus: refreshed.appStatus,
        profileUpdated: refreshed.profileUpdated,
        sessionUpdated: refreshed.sessionUpdated,
        changed: refreshed.changed,
      });

      return refreshed.session;
    } catch (error) {
      console.error("[KYC_SESSION_PROFILE_SYNC_ERROR]", error);
    }
  }

  return session;
}

export async function getLatestKycSessionState(
  investorProfileId: string,
  options: { forceRemote?: boolean } = {},
) {
  const session = await syncLatestKycSessionIfNeeded(
    investorProfileId,
    options,
  );
  if (!session) return null;

  const sessionAgeAnchor = session.lastSyncedAt ?? session.updatedAt;

  return {
    session,
    canRetry:
      isDiditRetryableStatus(session.status) ||
      (isDiditResumableStatus(session.status) &&
        isDiditSessionStale(sessionAgeAnchor)),
    canContinue:
      isDiditResumableStatus(session.status) &&
      !isDiditSessionStale(sessionAgeAnchor),
    isActive:
      isDiditActiveStatus(session.status) &&
      !isDiditSessionStale(sessionAgeAnchor),
    isStale:
      isDiditResumableStatus(session.status) &&
      isDiditSessionStale(sessionAgeAnchor),
  };
}
