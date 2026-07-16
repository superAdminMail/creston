"use server";

import { formatDistanceToNow } from "date-fns";

import type { KycStatus } from "@/generated/prisma";
import { formatDateLabel, formatEnumLabel } from "@/lib/formatters/formatters";
import { isDiditSessionStale } from "@/lib/kyc/didit";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { prisma } from "@/lib/prisma";

type KycReviewSessionSummary = {
  id: string;
  providerSessionId: string;
  providerSessionIdLabel: string;
  status: string;
  statusLabel: string;
  ageLabel: string;
  updatedAtLabel: string;
  startedAtLabel: string;
  isStale: boolean;
};

export type SuperAdminKycReviewListItem = {
  investorProfileId: string;
  userId: string;
  name: string;
  email: string;
  username: string;
  kycStatus: KycStatus;
  kycStatusLabel: string;
  isVerified: boolean;
  verificationStatus: KycStatus;
  verificationStatusLabel: string;
  verifiedAtLabel: string;
  latestSession: KycReviewSessionSummary | null;
  reviewState: "MANUAL_REVIEW" | "VERIFIED_STALE";
  reviewStateLabel: string;
  reviewReason: string;
  actionLabel: string;
  profileUpdatedLabel: string;
};

export type SuperAdminKycReviewsPageData = {
  reviewableProfilesCount: number;
  manualReviewCount: number;
  staleSessionCount: number;
  verifiedStaleCount: number;
  manualReviewItems: SuperAdminKycReviewListItem[];
  verifiedStaleItems: SuperAdminKycReviewListItem[];
};

function formatReference(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-8)}`;
}

function formatRelativeTime(value: Date | null | undefined) {
  if (!value) {
    return "Live";
  }

  return formatDistanceToNow(value, { addSuffix: true });
}

function formatDiditStatusLabel(status: string) {
  return status
    .trim()
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function buildReviewReason(params: {
  reviewState: "MANUAL_REVIEW" | "VERIFIED_STALE";
  investorName: string;
  latestSession: KycReviewSessionSummary | null;
  currentStatusLabel: string;
}) {
  if (params.reviewState === "VERIFIED_STALE") {
    return `${params.investorName} is already verified, but the latest Didit session record is stale and should be reconciled.`;
  }

  if (params.latestSession?.isStale) {
    return `${params.investorName} has a stale Didit session that is ready for a compliance decision.`;
  }

  return `${params.investorName} is currently ${params.currentStatusLabel.toLowerCase()} and requires manual compliance review before the profile is cleared.`;
}

export async function getSuperAdminKycReviews(): Promise<SuperAdminKycReviewsPageData> {
  await requireSuperAdminAccess();

  const investors = await prisma.investorProfile.findMany({
    where: {
      OR: [
        { kycStatus: { not: "VERIFIED" } },
        { isVerified: true },
        {
          kycVerification: {
            is: {
              status: "VERIFIED",
            },
          },
        },
      ],
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 150,
    select: {
      id: true,
      isVerified: true,
      kycStatus: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
        },
      },
      kycVerification: {
        select: {
          status: true,
          verifiedAt: true,
          updatedAt: true,
        },
      },
      kycVerificationSessions: {
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          providerSessionId: true,
          status: true,
          startedAt: true,
          updatedAt: true,
          lastSyncedAt: true,
        },
      },
    },
  });

  const mappedItems = investors
    .map((investor) => {
      const latestSession = investor.kycVerificationSessions[0] ?? null;
      const sessionAgeAnchor =
        latestSession?.lastSyncedAt ?? latestSession?.updatedAt ?? null;
      const latestSessionIsStale = latestSession
        ? isDiditSessionStale(sessionAgeAnchor)
        : false;

      const profileIsVerified =
        investor.isVerified ||
        investor.kycStatus === "VERIFIED" ||
        investor.kycVerification?.status === "VERIFIED";

      const verifiedStaleEligible =
        profileIsVerified && latestSessionIsStale;

      const reviewState = verifiedStaleEligible
        ? "VERIFIED_STALE"
        : !profileIsVerified
          ? "MANUAL_REVIEW"
          : null;

      if (!reviewState) {
        return null;
      }

      const sessionSummary: KycReviewSessionSummary | null = latestSession
        ? {
            id: latestSession.id,
            providerSessionId: latestSession.providerSessionId,
            providerSessionIdLabel: formatReference(
              latestSession.providerSessionId,
            ),
            status: latestSession.status,
            statusLabel: formatDiditStatusLabel(latestSession.status),
            ageLabel: formatRelativeTime(sessionAgeAnchor),
            updatedAtLabel: formatRelativeTime(latestSession.updatedAt),
            startedAtLabel: formatRelativeTime(latestSession.startedAt),
            isStale: latestSessionIsStale,
          }
        : null;

      const reviewStateLabel =
        reviewState === "VERIFIED_STALE"
          ? "Verified stale session"
          : "Manual review";

      const reviewItem: SuperAdminKycReviewListItem = {
        investorProfileId: investor.id,
        userId: investor.user.id,
        name: investor.user.name?.trim() || "Unnamed investor",
        email: investor.user.email,
        username: investor.user.username?.trim() || "Not set",
        kycStatus: investor.kycStatus,
        kycStatusLabel: formatEnumLabel(investor.kycStatus),
        isVerified: investor.isVerified,
        verificationStatus:
          investor.kycVerification?.status ?? investor.kycStatus,
        verificationStatusLabel: formatEnumLabel(
          investor.kycVerification?.status ?? investor.kycStatus,
        ),
        verifiedAtLabel: formatDateLabel(
          investor.kycVerification?.verifiedAt,
          "Not verified yet",
        ),
        latestSession: sessionSummary,
        reviewState,
        reviewStateLabel,
        reviewReason: buildReviewReason({
          reviewState,
          investorName: investor.user.name?.trim() || "This investor",
          latestSession: sessionSummary,
          currentStatusLabel: formatEnumLabel(
            investor.kycVerification?.status ?? investor.kycStatus,
          ),
        }),
        actionLabel:
          reviewState === "VERIFIED_STALE"
            ? "Reconcile verification"
            : "Mark verified",
        profileUpdatedLabel: formatRelativeTime(investor.updatedAt),
      };
      return reviewItem;
    })
    .filter((item): item is SuperAdminKycReviewListItem => item !== null);

  const manualReviewItems = mappedItems.filter(
    (item) => item.reviewState === "MANUAL_REVIEW",
  );
  const verifiedStaleItems = mappedItems.filter(
    (item) => item.reviewState === "VERIFIED_STALE",
  );

  const staleSessionCount = mappedItems.filter(
    (item) => item.latestSession?.isStale,
  ).length;

  return {
    reviewableProfilesCount: mappedItems.length,
    manualReviewCount: manualReviewItems.length,
    staleSessionCount,
    verifiedStaleCount: verifiedStaleItems.length,
    manualReviewItems,
    verifiedStaleItems,
  };
}
