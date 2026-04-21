"use server";

import {
  Prisma,
  SavingsFundingIntentStatus,
  SavingsTransactionPaymentStatus,
  SavingsTransactionType,
} from "@/generated/prisma";
import { createReviewNotification } from "@/lib/notifications/createReviewNotification";
import { prisma } from "@/lib/prisma";

type ReviewSavingsTransactionPaymentBase = {
  paymentId: string;
  adminUserId: string;
  reviewNote?: string | null;
};

type SavingsApprovalMode = "FULL" | "PARTIAL";

export async function approveSavingsTransactionPaymentReview({
  paymentId,
  adminUserId,
  approvedAmount,
  reviewNote,
  approvalMode,
}: ReviewSavingsTransactionPaymentBase & {
  approvedAmount: number;
  approvalMode: SavingsApprovalMode;
}): Promise<{ ok: true }> {
  const payment = await prisma.savingsTransactionPayment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      status: true,
      claimedAmount: true,
      currency: true,
      transferReference: true,
      savingsFundingIntent: {
        select: {
          id: true,
          status: true,
          creditedAmount: true,
          targetAmount: true,
          paidAt: true,
          creditedAt: true,
          paymentReference: true,
          savingsAccountId: true,
          savingsAccount: {
            select: {
              id: true,
              balance: true,
              targetAmount: true,
              currency: true,
              investorProfile: {
                select: {
                  userId: true,
                },
              },
              savingsProduct: {
                select: {
                  maxBalance: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment submission not found.");
  }

  if (payment.status !== SavingsTransactionPaymentStatus.PENDING_REVIEW) {
    throw new Error("This payment submission has already been reviewed.");
  }

  const claimedAmount = payment.claimedAmount.toNumber();

  if (approvedAmount <= 0) {
    throw new Error("Approved amount must be greater than zero.");
  }

  if (approvedAmount > claimedAmount) {
    throw new Error("Approved amount cannot be greater than claimed amount.");
  }

  if (approvalMode === "FULL" && approvedAmount !== claimedAmount) {
    throw new Error("Full approval amount must match the claimed amount.");
  }

  if (approvalMode === "PARTIAL" && approvedAmount >= claimedAmount) {
    throw new Error("Partial approval amount must be less than the claimed amount.");
  }

  const currentBalance = new Prisma.Decimal(
    payment.savingsFundingIntent.savingsAccount.balance,
  );
  const maxBalance = payment.savingsFundingIntent.savingsAccount.savingsProduct
    .maxBalance
    ? new Prisma.Decimal(
        payment.savingsFundingIntent.savingsAccount.savingsProduct.maxBalance,
      )
    : null;
  const targetAmount = payment.savingsFundingIntent.savingsAccount.targetAmount
    ? new Prisma.Decimal(payment.savingsFundingIntent.savingsAccount.targetAmount)
    : null;

  const remainingToTargetAmount = targetAmount
    ? targetAmount.minus(currentBalance)
    : null;
  const remainingToMaxBalance = maxBalance
    ? maxBalance.minus(currentBalance)
    : null;

  const currentCreditedAmount = new Prisma.Decimal(
    payment.savingsFundingIntent.creditedAmount,
  );
  const targetFundingAmount = new Prisma.Decimal(
    payment.savingsFundingIntent.targetAmount,
  );
  const remainingToFundingIntent = targetFundingAmount.minus(
    currentCreditedAmount,
  );

  const remainingCandidates = [
    remainingToFundingIntent,
    remainingToTargetAmount,
    remainingToMaxBalance,
  ].filter((value): value is Prisma.Decimal => value !== null);

  const remainingCapacity =
    remainingCandidates.length > 0
      ? remainingCandidates.reduce((minimum, current) =>
          current.lt(minimum) ? current : minimum,
        )
      : null;

  if (remainingCapacity && new Prisma.Decimal(approvedAmount).gt(remainingCapacity)) {
    throw new Error(
      "Approved amount cannot exceed the remaining fundable amount.",
    );
  }

  const approvedAmountDecimal = new Prisma.Decimal(approvedAmount);
  const newBalance = currentBalance.plus(approvedAmountDecimal);
  const newCreditedAmount = currentCreditedAmount.plus(approvedAmountDecimal);

  if (maxBalance && newBalance.gt(maxBalance)) {
    throw new Error("Savings account balance would exceed the configured maximum.");
  }

  const nextStatus =
    approvalMode === "FULL"
      ? SavingsFundingIntentStatus.CREDITED
      : SavingsFundingIntentStatus.PARTIALLY_PAID;

  await prisma.$transaction(async (tx) => {
    const updateResult = await tx.savingsTransactionPayment.updateMany({
      where: {
        id: payment.id,
        status: SavingsTransactionPaymentStatus.PENDING_REVIEW,
      },
      data: {
        status: SavingsTransactionPaymentStatus.APPROVED,
        approvedAmount: approvedAmountDecimal,
        reviewNote: reviewNote || null,
        rejectionReason: null,
        reviewedAt: new Date(),
        reviewedByUserId: adminUserId,
      },
    });

    if (updateResult.count === 0) {
      throw new Error("This payment submission has already been reviewed.");
    }

    const now = new Date();
    const creditReference =
      payment.transferReference?.trim() ||
      payment.id;
    const creditedAt =
      approvalMode === "FULL"
        ? payment.savingsFundingIntent.creditedAt ?? now
        : payment.savingsFundingIntent.creditedAt;

    await tx.savingsFundingIntent.update({
      where: { id: payment.savingsFundingIntent.id },
      data: {
        status: nextStatus,
        creditedAmount: newCreditedAmount,
        paidAt: payment.savingsFundingIntent.paidAt ?? now,
        creditedAt,
        paymentReference:
          payment.savingsFundingIntent.paymentReference ?? creditReference,
      },
    });

    await tx.savingsAccount.update({
      where: { id: payment.savingsFundingIntent.savingsAccount.id },
      data: {
        balance: newBalance,
      },
    });

    await tx.savingsTransaction.create({
      data: {
        savingsAccountId: payment.savingsFundingIntent.savingsAccount.id,
        savingsFundingIntentId: payment.savingsFundingIntent.id,
        type: SavingsTransactionType.DEPOSIT,
        amount: approvedAmountDecimal,
        currency: payment.currency,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        reference: creditReference,
        note: "Savings payment approved by admin",
        metadata: {
          paymentId: payment.id,
          approvedAmount: approvedAmountDecimal.toString(),
          reviewedByUserId: adminUserId,
          approvalMode,
        },
      },
    });

    await createReviewNotification({
      tx,
      userId:
        payment.savingsFundingIntent.savingsAccount.investorProfile.userId,
      key: `savings-payment-review:${payment.id}:${approvalMode}`,
      title:
        approvalMode === "FULL"
          ? "Savings payment approved"
          : "Savings payment partially approved",
      message:
        approvalMode === "FULL"
          ? "Your savings deposit proof was approved and credited."
          : "Your savings deposit proof was partially approved and credited.",
      link: `/account/dashboard/checkout?targetType=SAVINGS_FUNDING&targetId=${payment.savingsFundingIntent.savingsAccount.id}`,
      metadata: {
        paymentId: payment.id,
        savingsAccountId: payment.savingsFundingIntent.savingsAccount.id,
        fundingIntentId: payment.savingsFundingIntent.id,
        approvalMode,
        approvedAmount: approvedAmountDecimal.toString(),
        reviewedByUserId: adminUserId,
      },
    });
  });

  return { ok: true };
}

export async function rejectSavingsTransactionPaymentReview({
  paymentId,
  adminUserId,
  reviewNote,
  rejectionReason,
}: ReviewSavingsTransactionPaymentBase & {
  rejectionReason: string;
}): Promise<{ ok: true }> {
  const payment = await prisma.savingsTransactionPayment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      status: true,
      savingsFundingIntentId: true,
    },
  });

  if (!payment) {
    throw new Error("Payment submission not found.");
  }

  if (payment.status !== SavingsTransactionPaymentStatus.PENDING_REVIEW) {
    throw new Error("This payment submission has already been reviewed.");
  }

  await prisma.$transaction(async (tx) => {
    const updateResult = await tx.savingsTransactionPayment.updateMany({
      where: {
        id: payment.id,
        status: SavingsTransactionPaymentStatus.PENDING_REVIEW,
      },
      data: {
        status: SavingsTransactionPaymentStatus.REJECTED,
        approvedAmount: null,
        reviewNote: reviewNote || null,
        rejectionReason,
        reviewedAt: new Date(),
        reviewedByUserId: adminUserId,
      },
    });

    if (updateResult.count === 0) {
      throw new Error("This payment submission has already been reviewed.");
    }

    await tx.savingsFundingIntent.update({
      where: { id: payment.savingsFundingIntentId },
      data: {
        status: SavingsFundingIntentStatus.FAILED,
        failedAt: new Date(),
        failureCode: "REJECTED_BY_ADMIN",
        failureMessage: rejectionReason,
      },
    });

    const intent = await tx.savingsFundingIntent.findUnique({
      where: { id: payment.savingsFundingIntentId },
      select: {
        savingsAccountId: true,
        savingsAccount: {
          select: {
            investorProfile: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (intent) {
      await createReviewNotification({
        tx,
        userId: intent.savingsAccount.investorProfile.userId,
        key: `savings-payment-review:${payment.id}:REJECTED`,
        title: "Savings payment rejected",
        message: "Your savings deposit proof was rejected by the admin team.",
        link: `/account/dashboard/checkout?targetType=SAVINGS_FUNDING&targetId=${intent.savingsAccountId}`,
        metadata: {
          paymentId: payment.id,
          savingsAccountId: intent.savingsAccountId,
          fundingIntentId: payment.savingsFundingIntentId,
          rejectionReason,
          reviewedByUserId: adminUserId,
        },
      });
    }
  });

  return { ok: true };
}
