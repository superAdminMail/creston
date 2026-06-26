"use server";

import { Prisma, UserRole } from "@/generated/prisma";
import { formatCurrency } from "@/lib/formatters/formatters";
import { notifyManyRealtimeNotifications } from "@/lib/notifications/notifyManyRealtimeNotifications";
import { prisma } from "@/lib/prisma";
import { getPublicPlatformPaymentMethodForCheckout } from "@/lib/services/platform-wallets/getPlatformWallets";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";
import { calculateWithdrawalAppliedFeeAmount } from "@/lib/withdrawals/withdrawalFeeCheckout";
import { readWithdrawalFeePaymentSnapshot } from "@/lib/withdrawals/withdrawalFeeSnapshot";
import { isWithdrawalTerminalStatus } from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";
import {
  getWithdrawalAppliedFeeBaseAmount,
} from "@/lib/withdrawals/withdrawalFeeCheckout";

type CreateWithdrawalFeeSubmissionInput = {
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

export type CreateWithdrawalFeeSubmissionResult = {
  withdrawalId: string;
  feeReviewStatus: "PENDING_REVIEW";
  claimedAmount: string;
  remainingAmount: string;
  currency: string;
  submittedAt: string;
  platformPaymentMethodId: string;
  platformPaymentMethodLabel: string;
};

export async function createWithdrawalFeeSubmission({
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
}: CreateWithdrawalFeeSubmissionInput): Promise<CreateWithdrawalFeeSubmissionResult> {
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
      amount: true,
      payoutSnapshot: true,
    },
  });

  if (!initialWithdrawal) {
    throw new Error("Withdrawal order not found");
  }

  if (isWithdrawalTerminalStatus(initialWithdrawal.status)) {
    throw new Error("This withdrawal fee checkout is no longer available");
  }

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
          payoutSnapshot: true,
        },
      });

      if (!withdrawal) {
        throw new Error("Withdrawal order not found");
      }

      if (isWithdrawalTerminalStatus(withdrawal.status)) {
        throw new Error("This withdrawal fee checkout is no longer available");
      }

      const feeAmount = calculateWithdrawalAppliedFeeAmount(
        getWithdrawalAppliedFeeBaseAmount(
          withdrawal.payoutSnapshot,
          decimalToNumber(withdrawal.amount),
        ),
      );

      if (feeAmount <= 0) {
        throw new Error("Withdrawal fee is not configured for this request.");
      }

      const feeSnapshot = readWithdrawalFeePaymentSnapshot(
        withdrawal.payoutSnapshot,
      );
      const alreadyPaidAmount = feeSnapshot?.paidAmount ?? 0;
      const isPendingReview = feeSnapshot?.reviewStatus === "PENDING_REVIEW";

      if (isPendingReview) {
        throw new Error("This withdrawal fee proof is already awaiting review");
      }

      const remainingBeforeClaim = Math.max(
        0,
        feeAmount - alreadyPaidAmount,
      );

      if (remainingBeforeClaim <= 0) {
        throw new Error("This withdrawal fee has already been settled");
      }

      if (claimedAmount > remainingBeforeClaim) {
        throw new Error("Claim amount cannot exceed the remaining fee");
      }

      const now = new Date();
      const nextRemainingAmount = remainingBeforeClaim;
      const updatedSnapshot =
        withdrawal.payoutSnapshot && typeof withdrawal.payoutSnapshot === "object"
          ? {
              ...(withdrawal.payoutSnapshot as Record<string, unknown>),
              withdrawalFeePayment: {
                feeAmount,
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
              withdrawalFeePayment: {
                feeAmount,
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
        feeReviewStatus: "PENDING_REVIEW" as const,
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
        in: [UserRole.SUPER_ADMIN],
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
        title: "Withdrawal fee proof submitted",
        message: `A withdrawal fee proof for ${formatCurrency(
          claimedAmount,
          result.currency,
        )} is waiting for review.`,
        link: `/account/dashboard/super-admin/withdrawals/${withdrawalId}`,
        key: `withdrawal-fee-review:${withdrawalId}:${admin.id}:${proofMode}:${claimedAmount.toFixed(2)}:${result.submittedAt}`,
        metadata: {
          kind: "withdrawal_fee_review_submitted",
          withdrawalId,
          claimedAmount,
          currency: result.currency,
          proofMode,
          submittedAt: result.submittedAt,
          recipientRole: admin.role,
        },
      }),
      failureMessage:
        "Failed to notify the super admin about withdrawal fee review",
      failureContext: {
        withdrawalId,
      },
    });
  }

  return result;
}
