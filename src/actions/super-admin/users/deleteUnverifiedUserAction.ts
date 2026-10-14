"use server";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";

type DeleteUnverifiedUserResult =
  | {
      success: true;
      deletedUserId: string;
      deletedUserEmail: string;
    }
  | {
      error: string;
    };

export async function deleteUnverifiedUserAction(
  userId: string,
): Promise<DeleteUnverifiedUserResult> {
  if (typeof userId !== "string" || !userId.trim()) {
    return { error: "A valid user ID is required." };
  }

  try {
    const admin = await requireSuperAdminAccess();
    const targetUserId = userId.trim();

    if (targetUserId === admin.userId) {
      return {
        error: "You cannot delete your own account through this action.",
      };
    }

    return await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          accountId: true,
          role: true,
          isDeleted: true,
          investorProfile: {
            select: { id: true },
          },
          referralReceived: {
            select: { id: true },
          },
          referralsMade: {
            select: { id: true },
            take: 1,
          },
          referralRewards: {
            select: { id: true },
            take: 1,
          },
          cryptoFundingIntents: {
            select: { id: true },
            take: 1,
          },
          savingsFundingIntents: {
            select: { id: true },
            take: 1,
          },
          submittedInvestmentOrderPayments: {
            select: { id: true },
            take: 1,
          },
          reviewedInvestmentOrderPayments: {
            select: { id: true },
            take: 1,
          },
          submittedSavingsTransactionPayments: {
            select: { id: true },
            take: 1,
          },
          reviewedSavingsTransactionPayments: {
            select: { id: true },
            take: 1,
          },
        },
      });

      if (!target) {
        return { error: "The selected user could not be found." };
      }

      if (target.emailVerified) {
        return {
          error:
            "Verified accounts cannot be permanently deleted through this action.",
        };
      }

      if (target.role === "ADMIN" || target.role === "SUPER_ADMIN") {
        return {
          error:
            "Administrative accounts cannot be deleted through this workflow.",
        };
      }

      if (target.isDeleted) {
        return { error: "This account is already marked as deleted." };
      }

      const hasProtectedHistory =
        target.investorProfile !== null ||
        target.referralReceived !== null ||
        target.referralsMade.length > 0 ||
        target.referralRewards.length > 0 ||
        target.cryptoFundingIntents.length > 0 ||
        target.savingsFundingIntents.length > 0 ||
        target.submittedInvestmentOrderPayments.length > 0 ||
        target.reviewedInvestmentOrderPayments.length > 0 ||
        target.submittedSavingsTransactionPayments.length > 0 ||
        target.reviewedSavingsTransactionPayments.length > 0;

      if (hasProtectedHistory) {
        return {
          error:
            "This account has associated financial, referral, or payment history. It cannot be permanently deleted automatically and requires further review.",
        };
      }

      await tx.auditLog.updateMany({
        where: { actorUserId: target.id },
        data: { actorUserId: null },
      });

      await tx.fileAsset.updateMany({
        where: { uploadedById: target.id },
        data: { uploadedById: null },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: admin.userId,
          action: "UNVERIFIED_USER_PERMANENTLY_DELETED",
          entityType: "USER",
          entityId: target.id,
          description:
            "An Admin permanently deleted an account whose email was not verified.",
          metadata: {
            targetEmail: target.email,
            targetAccountId: target.accountId,
            targetName: target.name,
            reason: "EMAIL_NOT_VERIFIED",
          },
        },
      });

      await tx.user.delete({
        where: { id: target.id },
      });

      return {
        success: true,
        deletedUserId: target.id,
        deletedUserEmail: target.email,
      };
    });
  } catch (error) {
    console.error("Permanent deletion of unverified user failed:", error);

    return {
      error:
        "The account could not be deleted safely. Please review its associated records and try again.",
    };
  }
}
