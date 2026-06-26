"use server";

import { Prisma } from "@/generated/prisma";
import { UserRole } from "@/generated/prisma";
import { formatCurrency } from "@/lib/formatters/formatters";
import { prisma } from "@/lib/prisma";
import { getPublicPlatformPaymentMethodForCheckout } from "@/lib/services/platform-wallets/getPlatformWallets";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";
import {
  calculateWithdrawalCommissionDueAmount,
  getWithdrawalCommissionSourceType,
  readWithdrawalSnapshotString,
} from "@/lib/payments/withdrawals/withdrawalCommissionSettings";
import { notifyManyRealtimeNotifications } from "@/lib/notifications/notifyManyRealtimeNotifications";
import {
  isWithdrawalCommissionSettledStatus,
} from "@/lib/payments/withdrawals/withdrawalCommissionStatusWorkflow";
import { isWithdrawalTerminalStatus } from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";

type CreateWithdrawalCommissionSubmissionInput = {
  withdrawalId: string;
  userId: string;
  claimedAmount: number;
  proofMode?: CheckoutFundingMethodType;
  depositorName?: string | null;
  depositorAccountName?: string | null;
  depositorAccountNo?: string | null;
  transferReference?: string | null;
  note?: string | null;
  receiptFileId: string;
  platformPaymentMethodId: string;
};

export type CreateWithdrawalCommissionSubmissionResult = {
  withdrawalId: string;
  commissionStatus: string;
  commissionReviewStatus: "PENDING_REVIEW";
  claimedAmount: string;
  remainingAmount: string;
  currency: string;
  submittedAt: string;
  platformPaymentMethodId: string;
  platformPaymentMethodLabel: string;
};

function readCommissionPaymentSnapshot(payoutSnapshot: unknown) {
  if (!payoutSnapshot || typeof payoutSnapshot !== "object") {
    return null;
  }

  const snapshot = payoutSnapshot as Record<string, unknown>;
  const commissionPayment =
    snapshot.commissionPayment && typeof snapshot.commissionPayment === "object"
      ? (snapshot.commissionPayment as Record<string, unknown>)
      : null;

  if (!commissionPayment) {
    return null;
  }

  const paidAmount = Number(commissionPayment.paidAmount ?? 0);
  const reviewStatus =
    commissionPayment.reviewStatus === "PENDING_REVIEW"
      ? "PENDING_REVIEW"
      : commissionPayment.reviewStatus === "APPROVED"
        ? "APPROVED"
        : commissionPayment.reviewStatus === "REJECTED"
          ? "REJECTED"
          : null;

  return {
    paidAmount: Number.isFinite(paidAmount) && paidAmount > 0 ? paidAmount : 0,
    reviewStatus,
  };
}

export async function createWithdrawalCommissionSubmission({
  withdrawalId,
  userId,
  claimedAmount,
  proofMode = "BANK_TRANSFER",
  depositorName,
  depositorAccountName,
  depositorAccountNo,
  transferReference,
  note,
  receiptFileId,
  platformPaymentMethodId,
}: CreateWithdrawalCommissionSubmissionInput): Promise<CreateWithdrawalCommissionSubmissionResult> {
  if (!Number.isFinite(claimedAmount) || claimedAmount <= 0) {
    throw new Error("Claim amount is required");
  }

  const initialWithdrawal = await prisma.withdrawalOrder.findFirst({
    where: {
      id: withdrawalId,
      investorProfile: {
        userId,
      },
    },
    select: {
      id: true,
      status: true,
      currency: true,
      hasCommissionFees: true,
      investmentOrderId: true,
      allocations: {
        select: {
          sourceType: true,
          sourceGrossAmount: true,
        },
      },
      payoutSnapshot: true,
    },
  });

  if (!initialWithdrawal) {
    throw new Error("Withdrawal order not found");
  }

  if (!initialWithdrawal.hasCommissionFees) {
    throw new Error("This withdrawal does not have commission fees enabled");
  }

  if (isWithdrawalTerminalStatus(initialWithdrawal.status)) {
    throw new Error("This withdrawal commission checkout is no longer available");
  }

  const sourceType = getWithdrawalCommissionSourceType({
    investmentOrderId: initialWithdrawal.investmentOrderId,
    sourceType: readWithdrawalSnapshotString(
      initialWithdrawal.payoutSnapshot,
      "sourceType",
    ),
    allocationMode: readWithdrawalSnapshotString(
      initialWithdrawal.payoutSnapshot,
      "allocationMode",
    ),
  });

  const paymentMethod = await getPublicPlatformPaymentMethodForCheckout({
    currency: initialWithdrawal.currency,
    preferredType:
      proofMode === "CRYPTO_PROVIDER" ? "WALLET_ADDRESS" : "BANK_INFO",
  });

  if (!paymentMethod || paymentMethod.id !== platformPaymentMethodId) {
    throw new Error(
      proofMode === "CRYPTO_PROVIDER"
        ? "Selected crypto payment method is not available"
        : "Selected bank transfer method is not available",
    );
  }

  const normalizedReceiptFileId = receiptFileId.trim();

  if (!normalizedReceiptFileId) {
    throw new Error("Receipt image is required");
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const withdrawal = await tx.withdrawalOrder.findFirst({
        where: {
          id: withdrawalId,
          investorProfile: {
            userId,
          },
        },
        select: {
          id: true,
          status: true,
          amount: true,
          currency: true,
          commissionStatus: true,
          hasCommissionFees: true,
          commissionPercent: true,
          savingsFeeAmount: true,
          payoutSnapshot: true,
          allocations: {
            select: {
              sourceType: true,
              sourceGrossAmount: true,
            },
          },
        },
      });

      if (!withdrawal) {
        throw new Error("Withdrawal order not found");
      }

      if (!withdrawal.hasCommissionFees) {
        throw new Error("This withdrawal does not have commission fees enabled");
      }

      if (isWithdrawalTerminalStatus(withdrawal.status)) {
        throw new Error("This withdrawal commission checkout is no longer available");
      }

      if (isWithdrawalCommissionSettledStatus(withdrawal.commissionStatus)) {
        throw new Error("This withdrawal commission has already been settled");
      }

      const commissionDueAmount = calculateWithdrawalCommissionDueAmount({
        sourceType,
        amount: Number(withdrawal.amount),
        commissionPercent: Number(withdrawal.commissionPercent),
        savingsFeeAmount:
          withdrawal.savingsFeeAmount !== null
            ? Number(withdrawal.savingsFeeAmount)
            : null,
        allocations: withdrawal.allocations.map((allocation) => ({
          sourceType: allocation.sourceType,
          sourceGrossAmount: Number(allocation.sourceGrossAmount),
        })),
      });
      const commissionSnapshot = readCommissionPaymentSnapshot(
        withdrawal.payoutSnapshot,
      );
      const alreadyPaidAmount = commissionSnapshot?.paidAmount ?? 0;
      const isPendingReview =
        commissionSnapshot?.reviewStatus === "PENDING_REVIEW";

      if (isPendingReview) {
        throw new Error("This withdrawal commission proof is already awaiting review");
      }

      const remainingBeforeClaim = Math.max(
        0,
        commissionDueAmount - alreadyPaidAmount,
      );

      if (remainingBeforeClaim <= 0) {
        throw new Error("This withdrawal commission has already been settled");
      }

      if (claimedAmount > remainingBeforeClaim) {
        throw new Error("Claim amount cannot exceed the remaining commission");
      }

      const now = new Date();
      const nextRemainingAmount = remainingBeforeClaim;

      const updatedSnapshot =
        withdrawal.payoutSnapshot && typeof withdrawal.payoutSnapshot === "object"
          ? {
              ...(withdrawal.payoutSnapshot as Record<string, unknown>),
              commissionPayment: {
                claimedAmount,
                submittedAmount: claimedAmount,
                paidAmount: alreadyPaidAmount,
                remainingAmount: nextRemainingAmount,
                proofMode,
                platformPaymentMethodId,
                depositorName: depositorName?.trim() || null,
                depositorAccountName: depositorAccountName?.trim() || null,
                depositorAccountNo: depositorAccountNo?.trim() || null,
                transferReference: transferReference?.trim() || null,
                note: note?.trim() || null,
                receiptFileId: normalizedReceiptFileId,
                submittedAt: now.toISOString(),
                reviewStatus: "PENDING_REVIEW",
                approvedAmount: null,
                reviewedAt: null,
                reviewedByUserId: null,
                reviewNote: null,
                rejectionReason: null,
              },
            }
          : {
              commissionPayment: {
                claimedAmount,
                submittedAmount: claimedAmount,
                paidAmount: alreadyPaidAmount,
                remainingAmount: nextRemainingAmount,
                proofMode,
                platformPaymentMethodId,
                depositorName: depositorName?.trim() || null,
                depositorAccountName: depositorAccountName?.trim() || null,
                depositorAccountNo: depositorAccountNo?.trim() || null,
                transferReference: transferReference?.trim() || null,
                note: note?.trim() || null,
                receiptFileId: normalizedReceiptFileId,
                submittedAt: now.toISOString(),
                reviewStatus: "PENDING_REVIEW",
                approvedAmount: null,
                reviewedAt: null,
                reviewedByUserId: null,
                reviewNote: null,
                rejectionReason: null,
              },
            };

      await tx.withdrawalOrder.update({
        where: { id: withdrawal.id },
        data: {
          payoutSnapshot: updatedSnapshot as Prisma.InputJsonValue,
        },
      });

      return {
        withdrawalId: withdrawal.id,
        commissionStatus: withdrawal.commissionStatus,
        commissionReviewStatus: "PENDING_REVIEW" as const,
        claimedAmount: claimedAmount.toString(),
        remainingAmount: nextRemainingAmount.toString(),
        currency: withdrawal.currency,
        submittedAt: now.toISOString(),
        platformPaymentMethodId: paymentMethod.id,
        platformPaymentMethodLabel: paymentMethod.label,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );

  const admins = await prisma.user.findMany({
    where: {
      isDeleted: false,
      role: {
        in: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      },
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (admins.length > 0) {
    await notifyManyRealtimeNotifications({
      recipients: admins,
      buildNotification: (admin) => ({
        userId: admin.id,
        event: "WITHDRAWAL",
        title: "Withdrawal commission proof submitted",
        message: `A withdrawal commission proof for ${formatCurrency(
          claimedAmount,
          result.currency,
        )} is waiting for review.`,
        link: `/account/dashboard/admin/Withdrawals/${withdrawalId}`,
        key: `withdrawal-commission-review:${withdrawalId}:${admin.id}:${proofMode}:${claimedAmount.toFixed(2)}:${result.submittedAt}`,
        metadata: {
          kind: "withdrawal_commission_review_submitted",
          withdrawalId,
          claimedAmount,
          currency: result.currency,
          proofMode,
          submittedAt: result.submittedAt,
          recipientRole: admin.role,
        },
      }),
      failureMessage: "Failed to notify some admins about withdrawal commission review",
      failureContext: {
        withdrawalId,
      },
    });
  }

  return result;
}
