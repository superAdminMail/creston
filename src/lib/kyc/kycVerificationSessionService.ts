import { prisma } from "@/lib/prisma";
import {
  isDiditActiveStatus,
  isDiditInactiveStatus,
  isDiditRetryableStatus,
  isDiditSessionStale,
  mapDiditStatusToAppKycStatus,
} from "@/lib/kyc/didit";

export async function getLatestKycVerificationSession(
  investorProfileId: string,
) {
  return prisma.kycVerificationSession.findFirst({
    where: { investorProfileId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createLocalKycVerificationSession(params: {
  investorProfileId: string;
  providerSessionId: string;
  sessionUrl?: string | null;
  callbackUrl?: string | null;
  rawPayload?: unknown;
}) {
  return prisma.kycVerificationSession.create({
    data: {
      investorProfileId: params.investorProfileId,
      provider: "DIDIT",
      providerSessionId: params.providerSessionId,
      sessionUrl: params.sessionUrl ?? null,
      callbackUrl: params.callbackUrl ?? null,
      status: "Not Started",
      startedAt: new Date(),
      rawPayload: params.rawPayload as any,
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
  const session = await prisma.kycVerificationSession.update({
    where: { providerSessionId: params.providerSessionId },
    data: {
      status: params.status,
      lastSyncedAt: new Date(),
      rawPayload: params.rawPayload as any,
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

  const mapped = mapDiditStatusToAppKycStatus(params.status);

  if (mapped) {
    await prisma.investorProfile.update({
      where: { id: session.investorProfileId },
      data: { kycStatus: mapped },
    });
  }

  if (isDiditInactiveStatus(params.status)) {
    await prisma.investorProfile.update({
      where: { id: session.investorProfileId },
      data: { kycStatus: "NOT_STARTED" },
    });
  }

  return session;
}

export async function syncLatestKycSessionIfNeeded(investorProfileId: string) {
  const session = await getLatestKycVerificationSession(investorProfileId);
  if (!session) return null;

  const canRetry =
    isDiditRetryableStatus(session.status) ||
    (isDiditActiveStatus(session.status) &&
      isDiditSessionStale(session.updatedAt));

  return {
    session,
    canRetry,
    isActive:
      isDiditActiveStatus(session.status) &&
      !isDiditSessionStale(session.updatedAt),
    isStale:
      isDiditActiveStatus(session.status) &&
      isDiditSessionStale(session.updatedAt),
  };
}
