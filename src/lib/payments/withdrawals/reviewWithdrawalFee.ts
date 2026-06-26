"use server";

import { formatCurrency } from "@/lib/formatters/formatters";
import { createReviewNotification } from "@/lib/notifications/createReviewNotification";
import { prisma } from "@/lib/prisma";
import { asJsonObject, toJsonValue } from "@/lib/payments/paymentJson";
import type { WithdrawalFeePaymentSnapshot } from "@/lib/types/payments/withdrawalFee.types";
import { readWithdrawalFeePaymentSnapshot } from "@/lib/withdrawals/withdrawalFeeSnapshot";

type ReviewBaseInput = {
  withdrawalId: string;
  adminUserId: string;
  reviewNote?: string | null;
};

function buildReviewLink(withdrawalId: string) {
  return `/account/dashboard/user/withdrawals/${withdrawalId}`;
}

function buildApprovalTitle(input: {
  approvalMode: "FULL" | "PARTIAL";
  nextRemainingAmount: number;
}) {
  if (input.nextRemainingAmount <= 0) {
    return "Withdrawal applied fee approved and settled";
  }

  if (input.approvalMode === "FULL") {
    return "Withdrawal applied fee approved";
  }

  return "Withdrawal applied fee partially approved";
}

function buildApprovalMessage(input: {
  approvalMode: "FULL" | "PARTIAL";
  nextRemainingAmount: number;
  currency: string;
}) {
  if (input.nextRemainingAmount <= 0) {
    return "Your withdrawal applied fee proof was approved and settled.";
  }

  if (input.approvalMode === "FULL") {
    return `Your withdrawal applied fee proof was approved. ${formatCurrency(
      input.nextRemainingAmount,
      input.currency,
    )} remains due.`;
  }

  return `Your withdrawal applied fee proof was partially approved. ${formatCurrency(
    input.nextRemainingAmount,
    input.currency,
  )} remains due.`;
}

export async function approveWithdrawalFeeReview(
  input: ReviewBaseInput & {
    approvedAmount: number;
    approvalMode: "FULL" | "PARTIAL";
  },
): Promise<{ ok: true; withdrawalId: string }> {
  const withdrawal = await prisma.withdrawalOrder.findUnique({
    where: { id: input.withdrawalId },
    select: {
      id: true,
      currency: true,
      payoutSnapshot: true,
      investorProfile: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!withdrawal) {
    throw new Error("Withdrawal order not found.");
  }

  const feePayment = readWithdrawalFeePaymentSnapshot(withdrawal.payoutSnapshot);

  if (!feePayment || feePayment.reviewStatus !== "PENDING_REVIEW") {
    throw new Error("This withdrawal fee proof submission has already been reviewed.");
  }

  const approvedAmount = input.approvedAmount;

  if (!Number.isFinite(approvedAmount) || approvedAmount <= 0) {
    throw new Error("Approved amount is required.");
  }

  const submittedAmount = feePayment.submittedAmount ?? feePayment.feeAmount;

  if (approvedAmount > submittedAmount) {
    throw new Error("Approved amount cannot exceed the submitted fee amount.");
  }

  if (input.approvalMode === "FULL" && approvedAmount !== submittedAmount) {
    throw new Error("Full approval must match the submitted fee amount.");
  }

  if (input.approvalMode === "PARTIAL" && approvedAmount >= submittedAmount) {
    throw new Error("Partial approval must be smaller than the submitted fee amount.");
  }

  const previouslyApprovedAmount = feePayment.paidAmount;
  const remainingBeforeReview = Math.max(
    0,
    feePayment.feeAmount - previouslyApprovedAmount,
  );

  if (approvedAmount > remainingBeforeReview) {
    throw new Error("Approved amount cannot exceed the remaining fee.");
  }

  const nextPaidAmount = previouslyApprovedAmount + approvedAmount;
  const nextRemainingAmount = Math.max(0, feePayment.feeAmount - nextPaidAmount);
  const now = new Date();
  const submissionKey = feePayment.submittedAt ?? now.toISOString();
  const updatedSnapshot =
    withdrawal.payoutSnapshot && typeof withdrawal.payoutSnapshot === "object"
      ? {
          ...asJsonObject(withdrawal.payoutSnapshot),
          withdrawalFeePayment: {
            ...(feePayment as WithdrawalFeePaymentSnapshot),
            approvedAmount,
            paidAmount: nextPaidAmount,
            remainingAmount: nextRemainingAmount,
            reviewStatus: "APPROVED" as const,
            reviewedAt: now.toISOString(),
            reviewedByUserId: input.adminUserId,
            reviewNote: input.reviewNote?.trim() || null,
            rejectionReason: null,
          },
        }
      : {
          withdrawalFeePayment: {
            ...(feePayment as WithdrawalFeePaymentSnapshot),
            approvedAmount,
            paidAmount: nextPaidAmount,
            remainingAmount: nextRemainingAmount,
            reviewStatus: "APPROVED" as const,
            reviewedAt: now.toISOString(),
            reviewedByUserId: input.adminUserId,
            reviewNote: input.reviewNote?.trim() || null,
            rejectionReason: null,
          },
        };

  await prisma.$transaction(async (tx) => {
    const updateResult = await tx.withdrawalOrder.updateMany({
      where: {
        id: withdrawal.id,
      },
      data: {
        payoutSnapshot: toJsonValue(updatedSnapshot),
      },
    });

    if (updateResult.count === 0) {
      throw new Error("This withdrawal fee proof submission has already been reviewed.");
    }

    await createReviewNotification({
      tx,
      userId: withdrawal.investorProfile.userId,
      key: `withdrawal-fee-review:${withdrawal.id}:APPROVED:${input.approvalMode}:${approvedAmount.toFixed(2)}:${submissionKey}`,
      title: buildApprovalTitle({
        approvalMode: input.approvalMode,
        nextRemainingAmount,
      }),
      message: buildApprovalMessage({
        approvalMode: input.approvalMode,
        nextRemainingAmount,
        currency: withdrawal.currency,
      }),
      link: buildReviewLink(withdrawal.id),
      metadata: {
        kind: "withdrawal_fee_review",
        withdrawalId: withdrawal.id,
        approvedAmount,
        remainingAmount: nextRemainingAmount,
        approvalMode: input.approvalMode,
        reviewedByUserId: input.adminUserId,
        submittedAt: submissionKey,
      },
    });
  });

  return { ok: true, withdrawalId: withdrawal.id };
}

export async function rejectWithdrawalFeeReview(
  input: ReviewBaseInput & {
    rejectionReason: string;
  },
): Promise<{ ok: true; withdrawalId: string }> {
  const withdrawal = await prisma.withdrawalOrder.findUnique({
    where: { id: input.withdrawalId },
    select: {
      id: true,
      currency: true,
      payoutSnapshot: true,
      investorProfile: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!withdrawal) {
    throw new Error("Withdrawal order not found.");
  }

  const feePayment = readWithdrawalFeePaymentSnapshot(withdrawal.payoutSnapshot);

  if (!feePayment || feePayment.reviewStatus !== "PENDING_REVIEW") {
    throw new Error("This withdrawal fee proof submission has already been reviewed.");
  }

  const now = new Date();
  const submissionKey = feePayment.submittedAt ?? now.toISOString();
  const updatedSnapshot =
    withdrawal.payoutSnapshot && typeof withdrawal.payoutSnapshot === "object"
      ? {
          ...asJsonObject(withdrawal.payoutSnapshot),
          withdrawalFeePayment: {
            ...(feePayment as WithdrawalFeePaymentSnapshot),
            approvedAmount: null,
            reviewStatus: "REJECTED" as const,
            reviewedAt: now.toISOString(),
            reviewedByUserId: input.adminUserId,
            reviewNote: input.reviewNote?.trim() || null,
            rejectionReason: input.rejectionReason.trim(),
          },
        }
      : {
          withdrawalFeePayment: {
            ...(feePayment as WithdrawalFeePaymentSnapshot),
            approvedAmount: null,
            reviewStatus: "REJECTED" as const,
            reviewedAt: now.toISOString(),
            reviewedByUserId: input.adminUserId,
            reviewNote: input.reviewNote?.trim() || null,
            rejectionReason: input.rejectionReason.trim(),
          },
        };

  await prisma.$transaction(async (tx) => {
    const updateResult = await tx.withdrawalOrder.updateMany({
      where: {
        id: withdrawal.id,
      },
      data: {
        payoutSnapshot: toJsonValue(updatedSnapshot),
      },
    });

    if (updateResult.count === 0) {
      throw new Error("This withdrawal fee proof submission has already been reviewed.");
    }

    await createReviewNotification({
      tx,
      userId: withdrawal.investorProfile.userId,
      key: `withdrawal-fee-review:${withdrawal.id}:REJECTED:${input.adminUserId}:${submissionKey}`,
      title: "Withdrawal applied fee rejected",
      message: "Your withdrawal applied fee proof was rejected by the super-admin team.",
      link: buildReviewLink(withdrawal.id),
      metadata: {
        kind: "withdrawal_fee_review",
        withdrawalId: withdrawal.id,
        rejectionReason: input.rejectionReason.trim(),
        reviewedByUserId: input.adminUserId,
        submittedAt: submissionKey,
      },
    });
  });

  return { ok: true, withdrawalId: withdrawal.id };
}
