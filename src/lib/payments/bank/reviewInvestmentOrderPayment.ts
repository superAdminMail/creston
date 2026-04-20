"use server";

import { prisma } from "@/lib/prisma";
import { reconcileInvestmentOrderPaymentState } from "@/app/account/dashboard/admin/investment-payments/_lib/reconcileInvestmentOrderPaymentState";

type ReviewInvestmentOrderPaymentBase = {
  paymentId: string;
  adminUserId: string;
  reviewNote?: string | null;
};

export async function approveInvestmentOrderPaymentReview({
  paymentId,
  adminUserId,
  approvedAmount,
  reviewNote,
}: ReviewInvestmentOrderPaymentBase & {
  approvedAmount: number;
}): Promise<{ ok: true; investmentOrderId: string }> {
  const payment = await prisma.investmentOrderPayment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      status: true,
      claimedAmount: true,
      investmentOrderId: true,
      investmentOrder: {
        select: {
          id: true,
          amount: true,
          amountPaid: true,
          status: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment submission not found.");
  }

  if (payment.investmentOrder.status === "CONFIRMED") {
    throw new Error(
      "This order is already confirmed and can no longer be reviewed here.",
    );
  }

  const claimedAmount = payment.claimedAmount.toNumber();

  if (approvedAmount > claimedAmount) {
    throw new Error("Approved amount cannot be greater than claimed amount.");
  }

  const orderAmount = payment.investmentOrder.amount.toNumber();
  const currentPaid = payment.investmentOrder.amountPaid.toNumber();
  const remaining = Math.max(orderAmount - currentPaid, 0);

  if (approvedAmount > remaining) {
    throw new Error("Approved amount cannot exceed the remaining order balance.");
  }

  await prisma.$transaction(async (tx) => {
    const updateResult = await tx.investmentOrderPayment.updateMany({
      where: {
        id: payment.id,
        status: "PENDING_REVIEW",
      },
      data: {
        status: "APPROVED",
        approvedAmount,
        reviewNote: reviewNote || null,
        rejectionReason: null,
        reviewedAt: new Date(),
        reviewedByUserId: adminUserId,
      },
    });

    if (updateResult.count === 0) {
      throw new Error("This payment submission has already been reviewed.");
    }

    await reconcileInvestmentOrderPaymentState(tx, payment.investmentOrderId);
  });

  return { ok: true, investmentOrderId: payment.investmentOrderId };
}

export async function rejectInvestmentOrderPaymentReview({
  paymentId,
  adminUserId,
  rejectionReason,
  reviewNote,
}: ReviewInvestmentOrderPaymentBase & {
  rejectionReason: string;
}): Promise<{ ok: true; investmentOrderId: string }> {
  const payment = await prisma.investmentOrderPayment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      investmentOrderId: true,
    },
  });

  if (!payment) {
    throw new Error("Payment submission not found.");
  }

  await prisma.$transaction(async (tx) => {
    const updateResult = await tx.investmentOrderPayment.updateMany({
      where: {
        id: payment.id,
        status: "PENDING_REVIEW",
      },
      data: {
        status: "REJECTED",
        approvedAmount: null,
        rejectionReason,
        reviewNote: reviewNote || null,
        reviewedAt: new Date(),
        reviewedByUserId: adminUserId,
      },
    });

    if (updateResult.count === 0) {
      throw new Error("This payment submission has already been reviewed.");
    }

    await reconcileInvestmentOrderPaymentState(tx, payment.investmentOrderId);
  });

  return { ok: true, investmentOrderId: payment.investmentOrderId };
}
