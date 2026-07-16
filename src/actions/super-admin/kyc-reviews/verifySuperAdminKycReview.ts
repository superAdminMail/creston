"use server";

import { revalidatePath } from "next/cache";

import type { KycStatus, Prisma } from "@/generated/prisma";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";
import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  getFriendlyServerError,
  type FormActionState,
} from "@/lib/forms/actionState";
import { isDiditSessionStale } from "@/lib/kyc/didit";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { pusherServer } from "@/lib/pusher";

export type VerifySuperAdminKycReviewFieldName =
  | "investorProfileId"
  | "verificationSessionId"
  | "reviewKind";

export type VerifySuperAdminKycReviewState = FormActionState<VerifySuperAdminKycReviewFieldName>;

export async function verifySuperAdminKycReview(
  _prevState: VerifySuperAdminKycReviewState,
  formData: FormData,
): Promise<VerifySuperAdminKycReviewState> {
  try {
    const { userId: actorUserId } = await requireSuperAdminAccess();

    const investorProfileIdValue = formData.get("investorProfileId");
    const verificationSessionIdValue = formData.get("verificationSessionId");
    const reviewKindValue = formData.get("reviewKind");

    if (
      typeof investorProfileIdValue !== "string" ||
      !investorProfileIdValue.trim()
    ) {
      return createValidationErrorState(
        { investorProfileId: ["Select a KYC review item."] },
        "Please select a KYC review item.",
      ) as VerifySuperAdminKycReviewState;
    }

    if (
      reviewKindValue !== "MANUAL_REVIEW" &&
      reviewKindValue !== "VERIFIED_STALE"
    ) {
      return createValidationErrorState(
        { reviewKind: ["Select a KYC review item."] },
        "Please select a KYC review item.",
      ) as VerifySuperAdminKycReviewState;
    }

    const investorProfileId = investorProfileIdValue.trim();
    const verificationSessionId =
      typeof verificationSessionIdValue === "string" &&
      verificationSessionIdValue.trim()
        ? verificationSessionIdValue.trim()
        : null;

    const investor = await prisma.investorProfile.findUnique({
      where: { id: investorProfileId },
      select: {
        id: true,
        userId: true,
        isVerified: true,
        kycStatus: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        kycVerification: {
          select: {
            status: true,
            verifiedAt: true,
            providerSessionId: true,
            failureReason: true,
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
            completedAt: true,
          },
        },
      },
    });

    if (!investor) {
      return createErrorFormState("KYC review target not found.") as VerifySuperAdminKycReviewState;
    }

    const latestSession =
      verificationSessionId &&
      investor.kycVerificationSessions[0]?.id !== verificationSessionId
        ? await prisma.kycVerificationSession.findFirst({
            where: {
              id: verificationSessionId,
              investorProfileId,
            },
            select: {
              id: true,
              providerSessionId: true,
              status: true,
              startedAt: true,
              updatedAt: true,
              lastSyncedAt: true,
              completedAt: true,
            },
          })
        : investor.kycVerificationSessions[0] ?? null;

    const sessionAgeAnchor =
      latestSession?.lastSyncedAt ?? latestSession?.updatedAt ?? null;
    const profileIsVerified =
      investor.isVerified ||
      investor.kycStatus === "VERIFIED" ||
      investor.kycVerification?.status === "VERIFIED";
    const sessionIsStale = latestSession
      ? isDiditSessionStale(sessionAgeAnchor)
      : false;
    const verifiedStaleReviewEligible =
      reviewKindValue === "VERIFIED_STALE" &&
      profileIsVerified &&
      sessionIsStale;
    const manualReviewEligible =
      reviewKindValue === "MANUAL_REVIEW" && !profileIsVerified;

    if (!verifiedStaleReviewEligible && !manualReviewEligible) {
      return createErrorFormState(
        "This KYC review item is no longer eligible for review. Please refresh and try again.",
      ) as VerifySuperAdminKycReviewState;
    }

    const now = new Date();
    const nextKycStatus: KycStatus = "VERIFIED";

    await prisma.$transaction(async (tx) => {
      if (latestSession) {
        await tx.kycVerificationSession.update({
          where: { id: latestSession.id },
          data: {
            status: "Approved",
            completedAt: latestSession.completedAt ?? now,
            lastSyncedAt: now,
          },
        });
      }

      await tx.investorProfile.update({
        where: { id: investorProfileId },
        data: {
          kycStatus: nextKycStatus,
          isVerified: true,
        },
      });

      await tx.kYCVerification.upsert({
        where: { investorProfileId },
        create: {
          investorProfileId,
          provider: "didit",
          providerSessionId:
            latestSession?.providerSessionId ??
            investor.kycVerification?.providerSessionId ??
            null,
          status: nextKycStatus,
          verifiedAt: now,
          failureReason: null,
        },
        update: {
          providerSessionId:
            latestSession?.providerSessionId ??
            investor.kycVerification?.providerSessionId ??
            null,
          status: nextKycStatus,
          verifiedAt: now,
          failureReason: null,
        },
      });

      await logAuditEvent({
        actorUserId,
        action: "kyc-review.verified",
        entityType: "InvestorProfile",
        entityId: investorProfileId,
        description: `Verified ${investor.user.name?.trim() || investor.user.email} from the super-admin KYC review queue.`,
        metadata: {
          reviewKind: reviewKindValue,
          investorProfileId,
          userId: investor.userId,
          sessionId: latestSession?.id ?? null,
          previous: {
            kycStatus: investor.kycStatus,
            isVerified: investor.isVerified,
            verificationStatus: investor.kycVerification?.status ?? null,
          },
          next: {
            kycStatus: nextKycStatus,
            isVerified: true,
          },
        } satisfies Prisma.InputJsonObject,
        db: tx,
      });
    });

    await pusherServer.trigger(
      `private-kyc-${investor.userId}`,
      "kyc-status-updated",
      {
        status: "VERIFIED",
        providerStatus: "Approved",
        profileIsVerified: true,
      },
    );

    revalidatePath("/account/dashboard/super-admin/kyc-reviews");
    revalidatePath("/account/dashboard/super-admin/system-health");
    revalidatePath("/account/dashboard/super-admin/investors");
    revalidatePath(`/account/dashboard/super-admin/investors/${investorProfileId}`);
    revalidatePath("/account/dashboard/user/kyc");

    return createSuccessFormState(
      reviewKindValue === "VERIFIED_STALE"
        ? "Verified stale KYC session reconciled successfully."
        : "KYC profile verified successfully.",
    ) as VerifySuperAdminKycReviewState;
  } catch (error) {
    console.error("[SUPER_ADMIN_KYC_REVIEW_VERIFY_ERROR]", error);

    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Something went wrong while reviewing this KYC record.",
      ),
    ) as VerifySuperAdminKycReviewState;
  }
}
