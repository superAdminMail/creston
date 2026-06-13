"use server";

import { Prisma } from "@/generated/prisma";
import { formatCurrency } from "@/lib/formatters/formatters";
import { createReviewNotification } from "@/lib/notifications/createReviewNotification";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import { buildWithdrawalCommissionCheckoutUrl } from "@/lib/withdrawals/withdrawalCommissionCheckout";
import {
  readWithdrawalCommissionPaymentSnapshot,
} from "@/lib/withdrawals/withdrawalCommissionSnapshot";
import {
  getWithdrawalCommissionSourceType,
  readWithdrawalSnapshotString,
} from "@/lib/payments/withdrawals/withdrawalCommissionSettings";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";
import type { WithdrawalCommissionPaymentSnapshot } from "@/lib/types/payments/withdrawalCommission.types";

type ReviewBaseInput = {
  withdrawalId: string;
  adminUserId: string;
  reviewNote?: string | null;
};

function calculateCommissionDueAmount(input: {
  sourceType: "INVESTMENT_ORDER" | "SAVINGS_ACCOUNT";
  amount: Prisma.Decimal;
  commissionPercent: Prisma.Decimal;
  savingsFeeAmount: Prisma.Decimal | null;
}) {
  return input.sourceType === "SAVINGS_ACCOUNT"
    ? input.savingsFeeAmount
      ? decimalToNumber(input.savingsFeeAmount)
      : null
    : decimalToNumber(input.amount) *
        (decimalToNumber(input.commissionPercent) / 100);
}

function buildReviewLink(input: {
  withdrawalId: string;
  remainingAmount: number;
}) {
  return input.remainingAmount > 0
    ? buildWithdrawalCommissionCheckoutUrl(input.withdrawalId)
    : `/account/dashboard/user/withdrawals/${input.withdrawalId}`;
}

function buildReviewTitle(input: {
  approvalMode: "FULL" | "PARTIAL";
  proofMode: CheckoutFundingMethodType;
  nextRemainingAmount: number;
}) {
  const isCrypto = input.proofMode === "CRYPTO_PROVIDER";
  const prefix = isCrypto ? "Withdrawal crypto commission" : "Withdrawal commission";

  if (input.approvalMode === "FULL") {
    return `${prefix} approved`;
  }

  if (input.nextRemainingAmount <= 0) {
    return `${prefix} approved`;
  }

  return `${prefix} partially approved`;
}

function buildReviewMessage(input: {
  approvalMode: "FULL" | "PARTIAL";
  proofMode: CheckoutFundingMethodType;
  nextRemainingAmount: number;
  currency: string;
}) {
  const isCrypto = input.proofMode === "CRYPTO_PROVIDER";
  const prefix = isCrypto ? "Your crypto commission proof" : "Your withdrawal commission proof";

  if (input.nextRemainingAmount <= 0) {
    return `${prefix} was approved and settled.`;
  }

  if (input.approvalMode === "FULL") {
    return `${prefix} was approved. ${formatCurrency(
      input.nextRemainingAmount,
      input.currency,
    )} remains due.`;
  }

  return `${prefix} was partially approved. ${formatCurrency(
    input.nextRemainingAmount,
    input.currency,
  )} remains due.`;
}

type WithdrawalCommissionReviewSnapshot = WithdrawalCommissionPaymentSnapshot & {
  proofMode: CheckoutFundingMethodType | null;
};

export async function approveWithdrawalCommissionReview(
  input: ReviewBaseInput & {
    approvedAmount: number;
    approvalMode: "FULL" | "PARTIAL";
  },
): Promise<{ ok: true; withdrawalId: string }> {
  const withdrawal = await prisma.withdrawalOrder.findUnique({
    where: { id: input.withdrawalId },
    select: {
      id: true,
      amount: true,
      currency: true,
      commissionStatus: true,
      commissionPercent: true,
      savingsFeeAmount: true,
      investmentOrderId: true,
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

  const sourceType = getWithdrawalCommissionSourceType({
    investmentOrderId: withdrawal.investmentOrderId,
    sourceType: readWithdrawalSnapshotString(
      withdrawal.payoutSnapshot,
      "sourceType",
    ),
  });

  const commissionPayment = readWithdrawalCommissionPaymentSnapshot(
    withdrawal.payoutSnapshot,
  ) as WithdrawalCommissionReviewSnapshot | null;

  if (!commissionPayment || commissionPayment.reviewStatus !== "PENDING_REVIEW") {
    throw new Error("This withdrawal commission proof submission has already been reviewed.");
  }

  const commissionDueAmount = calculateCommissionDueAmount({
    sourceType,
    amount: withdrawal.amount,
    commissionPercent: withdrawal.commissionPercent,
    savingsFeeAmount: withdrawal.savingsFeeAmount,
  });

  if (commissionDueAmount === null || commissionDueAmount <= 0) {
    throw new Error("Withdrawal commission is not configured.");
  }

  const approvedAmount = input.approvedAmount;
  const previouslyApprovedAmount = commissionPayment.paidAmount;
  const remainingBeforeReview = Math.max(
    0,
    commissionDueAmount - previouslyApprovedAmount,
  );

  if (approvedAmount <= 0) {
    throw new Error("Approved amount must be greater than zero.");
  }

  if (approvedAmount > commissionPayment.claimedAmount) {
    throw new Error("Approved amount cannot be greater than the submitted amount.");
  }

  if (input.approvalMode === "FULL" && approvedAmount !== commissionPayment.claimedAmount) {
    throw new Error("Full approval amount must match the submitted amount.");
  }

  if (input.approvalMode === "PARTIAL" && approvedAmount >= commissionPayment.claimedAmount) {
    throw new Error("Partial approval amount must be lower than the submitted amount.");
  }

  if (approvedAmount > remainingBeforeReview) {
    throw new Error("Approved amount cannot exceed the remaining commission due.");
  }

  const now = new Date();
  const nextPaidAmount = previouslyApprovedAmount + approvedAmount;
  const nextRemainingAmount = Math.max(0, commissionDueAmount - nextPaidAmount);
  const nextStatus = nextRemainingAmount <= 0 ? "PAID" : "PARTIALLY_PAID";
  const proofMode =
    commissionPayment.proofMode ?? ("BANK_TRANSFER" as CheckoutFundingMethodType);
  const updatedSnapshot = {
    ...(withdrawal.payoutSnapshot && typeof withdrawal.payoutSnapshot === "object"
      ? (withdrawal.payoutSnapshot as Record<string, unknown>)
      : {}),
    commissionPayment: {
      ...commissionPayment,
      approvedAmount,
      paidAmount: nextPaidAmount,
      remainingAmount: nextRemainingAmount,
      reviewStatus: "APPROVED" as const,
      reviewedAt: now.toISOString(),
      reviewedByUserId: input.adminUserId,
      reviewNote: input.reviewNote ?? null,
      rejectionReason: null,
      proofMode,
    },
  };
  const submissionKey = commissionPayment.submittedAt ?? now.toISOString();

  await prisma.$transaction(async (tx) => {
    const updateResult = await tx.withdrawalOrder.updateMany({
      where: {
        id: withdrawal.id,
        commissionStatus: {
          in: ["PENDING", "PARTIALLY_PAID"],
        },
      },
      data: {
        commissionStatus: nextStatus,
        payoutSnapshot: updatedSnapshot as Prisma.InputJsonValue,
      },
    });

    if (updateResult.count === 0) {
      throw new Error("This withdrawal commission proof submission has already been reviewed.");
    }

    await createReviewNotification({
      tx,
      userId: withdrawal.investorProfile.userId,
      key: `withdrawal-commission-review:${withdrawal.id}:APPROVED:${input.approvalMode}:${approvedAmount.toFixed(2)}:${submissionKey}`,
      title: buildReviewTitle({
        approvalMode: input.approvalMode,
        proofMode,
        nextRemainingAmount,
      }),
      message: buildReviewMessage({
        approvalMode: input.approvalMode,
        proofMode,
        nextRemainingAmount,
        currency: withdrawal.currency,
      }),
      link: buildReviewLink({
        withdrawalId: withdrawal.id,
        remainingAmount: nextRemainingAmount,
      }),
      metadata: {
        kind: "withdrawal_commission_review",
        withdrawalId: withdrawal.id,
        approvedAmount,
        remainingAmount: nextRemainingAmount,
        approvalMode: input.approvalMode,
        proofMode,
        reviewedByUserId: input.adminUserId,
        submittedAt: submissionKey,
      },
    });
  });

  return { ok: true, withdrawalId: withdrawal.id };
}

export async function rejectWithdrawalCommissionReview(
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

  const commissionPayment = readWithdrawalCommissionPaymentSnapshot(
    withdrawal.payoutSnapshot,
  );

  if (!commissionPayment || commissionPayment.reviewStatus !== "PENDING_REVIEW") {
    throw new Error("This withdrawal commission proof submission has already been reviewed.");
  }

  const proofMode =
    commissionPayment.proofMode ?? ("BANK_TRANSFER" as CheckoutFundingMethodType);
  const updatedSnapshot = {
    ...(withdrawal.payoutSnapshot && typeof withdrawal.payoutSnapshot === "object"
      ? (withdrawal.payoutSnapshot as Record<string, unknown>)
      : {}),
    commissionPayment: {
      ...commissionPayment,
      reviewStatus: "REJECTED" as const,
      reviewedAt: new Date().toISOString(),
      reviewedByUserId: input.adminUserId,
      reviewNote: input.reviewNote ?? null,
      rejectionReason: input.rejectionReason,
    },
  };
  const submissionKey = commissionPayment.submittedAt ?? new Date().toISOString();

  await prisma.$transaction(async (tx) => {
    const updateResult = await tx.withdrawalOrder.updateMany({
      where: {
        id: withdrawal.id,
        commissionStatus: {
          in: ["PENDING", "PARTIALLY_PAID"],
        },
      },
      data: {
        payoutSnapshot: updatedSnapshot as Prisma.InputJsonValue,
      },
    });

    if (updateResult.count === 0) {
      throw new Error("This withdrawal commission proof submission has already been reviewed.");
    }

    await createReviewNotification({
      tx,
      userId: withdrawal.investorProfile.userId,
      key: `withdrawal-commission-review:${withdrawal.id}:REJECTED:${input.adminUserId}:${submissionKey}`,
      title: "Withdrawal commission rejected",
      message: "Your withdrawal commission proof was rejected by the admin team.",
      link: buildReviewLink({
        withdrawalId: withdrawal.id,
        remainingAmount: commissionPayment.remainingAmount,
      }),
      metadata: {
        kind: "withdrawal_commission_review",
        withdrawalId: withdrawal.id,
        rejectionReason: input.rejectionReason,
        proofMode,
        reviewedByUserId: input.adminUserId,
        submittedAt: submissionKey,
      },
    });
  });

  return { ok: true, withdrawalId: withdrawal.id };
}
