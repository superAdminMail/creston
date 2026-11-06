"use server";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type AccountClosureResult =
  | { success: true; outcome: "DELETED" }
  | {
      success: true;
      outcome: "DEACTIVATED";
      deactivatedAt: Date;
    }
  | { error: string };

export async function deactivateCurrentUserAccount(): Promise<AccountClosureResult> {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser) {
    return { error: "Unauthorized" };
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const account = await tx.user.findUnique({
          where: { id: sessionUser.id },
          select: {
            id: true,
            emailVerified: true,
            accountStatus: true,
            isDeleted: true,
            isSuspended: true,
            investorProfile: {
              select: {
                investmentAccounts: {
                  select: { id: true },
                  take: 1,
                },
                investmentOrders: {
                  select: { id: true },
                  take: 1,
                },
                savingsAccounts: {
                  select: { id: true },
                  take: 1,
                },
                withdrawalOrders: {
                  select: { id: true },
                  take: 1,
                },
              },
            },
            cryptoFundingIntents: {
              select: { id: true },
              take: 1,
            },
            investmentOrderAdjustments: {
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
            savingsFundingIntents: {
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
          },
        });

        if (!account) {
          return { error: "Account not found" } as const;
        }

        if (!account.emailVerified) {
          return {
            error: "Please contact support to resolve your unverified account.",
          } as const;
        }

        if (account.isDeleted || account.accountStatus === "DELETED") {
          return {
            error: "This account has already been deleted.",
          } as const;
        }

        if (account.accountStatus === "DEACTIVATED") {
          return {
            error: "This account is already deactivated.",
          } as const;
        }

        if (
          account.isSuspended ||
          account.accountStatus === "SUSPENDED" ||
          account.accountStatus === "BLOCKED"
        ) {
          return {
            error:
              "Suspended accounts cannot be closed here. Please contact support.",
          } as const;
        }

        if (account.accountStatus !== "ACTIVE") {
          return {
            error:
              "This account is not eligible for closure. Please contact support.",
          } as const;
        }

        const profile = account.investorProfile;

        const hasFinancialHistory =
          !!profile &&
          (profile.investmentAccounts.length > 0 ||
            profile.investmentOrders.length > 0 ||
            profile.savingsAccounts.length > 0 ||
            profile.withdrawalOrders.length > 0);

        const hasDirectFinancialHistory =
          account.cryptoFundingIntents.length > 0 ||
          account.investmentOrderAdjustments.length > 0 ||
          account.submittedInvestmentOrderPayments.length > 0 ||
          account.reviewedInvestmentOrderPayments.length > 0 ||
          account.savingsFundingIntents.length > 0 ||
          account.submittedSavingsTransactionPayments.length > 0 ||
          account.reviewedSavingsTransactionPayments.length > 0 ||
          account.referralReceived !== null ||
          account.referralsMade.length > 0 ||
          account.referralRewards.length > 0;

        const now = new Date();

        if (hasFinancialHistory || hasDirectFinancialHistory) {
          const update = await tx.user.updateMany({
            where: {
              id: account.id,
              emailVerified: true,
              accountStatus: "ACTIVE",
              isDeleted: false,
              isSuspended: false,
            },
            data: {
              accountStatus: "DEACTIVATED",
              deactivatedAt: now,
            },
          });

          if (update.count !== 1) {
            return {
              error: "The account status has changed. Refresh and try again.",
            } as const;
          }

          await tx.session.deleteMany({
            where: { userId: account.id },
          });

          await tx.auditLog.create({
            data: {
              actorUserId: account.id,
              action: "USER_ACCOUNT_DEACTIVATED",
              entityType: "USER",
              entityId: account.id,
              description:
                "User closed their account. Financial records were retained.",
              metadata: {
                source: "ACCOUNT_SETTINGS",
                reason: "FINANCIAL_HISTORY_EXISTS",
              },
            },
          });

          return {
            success: true,
            outcome: "DEACTIVATED",
            deactivatedAt: now,
          } as const;
        }

        await tx.session.deleteMany({
          where: { userId: account.id },
        });

        await tx.auditLog.updateMany({
          where: { actorUserId: account.id },
          data: { actorUserId: null },
        });

        await tx.fileAsset.updateMany({
          where: { uploadedById: account.id },
          data: { uploadedById: null },
        });

        await tx.auditLog.create({
          data: {
            actorUserId: null,
            action: "USER_ACCOUNT_PERMANENTLY_DELETED",
            entityType: "USER",
            entityId: account.id,
            description:
              "User permanently deleted their account through account settings.",
            metadata: {
              source: "ACCOUNT_SETTINGS",
              reason: "NO_FINANCIAL_HISTORY",
            },
          },
        });

        await tx.user.delete({
          where: { id: account.id },
        });

        return {
          success: true,
          outcome: "DELETED",
        } as const;
      },
      {
        isolationLevel: "Serializable",
      },
    );

    if ("success" in result && result.success) {
      revalidatePath("/account");
      revalidatePath("/account/dashboard");
      return result;
    }

    return result;
  } catch (error) {
    console.error("Account closure failed:", error);

    return {
      error:
        "We couldn't close your account safely. Please try again or contact support.",
    };
  }
}
