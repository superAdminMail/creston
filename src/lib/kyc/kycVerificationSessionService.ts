import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import {
  isDiditActiveStatus,
  isDiditInactiveStatus,
  isDiditRetryableStatus,
  isDiditResumableStatus,
  isDiditSessionStale,
  mapDiditStatusToAppKycStatus,
  retrieveDiditSession,
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
  const currentSession = await prisma.kycVerificationSession.findUnique({
    where: { providerSessionId: params.providerSessionId },
    include: {
      investorProfile: true,
    },
  });

  if (!currentSession) {
    throw new Error(
      `KYC verification session not found: ${params.providerSessionId}`,
    );
  }

  const changed = currentSession.status !== params.status;

  const session = await prisma.kycVerificationSession.update({
    where: { providerSessionId: params.providerSessionId },
    data: {
      status: params.status,
      lastSyncedAt: new Date(),
      rawPayload: toOptionalJsonValue(params.rawPayload),
      completedAt:
        params.status === "Approved" || params.status === "Declined"
          ? new Date()
          : undefined,
      abandonedAt: params.status === "Abandoned" ? new Date() : undefined,
      expiredAt: params.status === "Expired" ? new Date() : undefined,
    },
    include: {
      investorProfile: true,
    },
  });

  const finalProfileStatus =
    mapDiditStatusToAppKycStatus(params.status) ??
    (isDiditInactiveStatus(params.status) ? "NOT_STARTED" : null);

  if (changed && finalProfileStatus) {
    await prisma.investorProfile.update({
      where: { id: session.investorProfileId },
      data: {
        kycStatus: finalProfileStatus,
        isVerified: finalProfileStatus === "VERIFIED",
      },
    });
  }

  return {
    changed,
    session,
  };
}

export async function syncLatestKycSessionIfNeeded(investorProfileId: string) {
  const session = await getLatestKycVerificationSession(investorProfileId);
  if (!session) return null;

  const sessionAgeAnchor = session.lastSyncedAt ?? session.updatedAt;

  if (isDiditResumableStatus(session.status) && isDiditSessionStale(sessionAgeAnchor)) {
    try {
      const diditSession = await retrieveDiditSession(session.providerSessionId);
      const remoteStatus =
        typeof diditSession?.status === "string" ? diditSession.status : session.status;

      const refreshed = await markKycVerificationSessionStatus({
        providerSessionId: session.providerSessionId,
        status: remoteStatus,
        rawPayload: diditSession,
      });

      return refreshed.session;
    } catch (error) {
      console.error("[KYC_SESSION_SYNC_ERROR]", error);
    }
  }

  return session;
}

export async function getLatestKycSessionState(investorProfileId: string) {
  const session = await syncLatestKycSessionIfNeeded(investorProfileId);
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
