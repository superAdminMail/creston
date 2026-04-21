"use server";

import { prisma } from "@/lib/prisma";
import { createReviewNotification } from "@/lib/notifications/createReviewNotification";
import { reconcileInvestmentOrderPaymentState } from "@/app/account/dashboard/admin/investment-payments/_lib/reconcileInvestmentOrderPaymentState";

type ReviewInvestmentOrderPaymentBase = {
  paymentId: string;
  adminUserId: string;
  reviewNote?: string | null;
};

type InvestmentApprovalMode = "FULL" | "PARTIAL";

export async function approveInvestmentOrderPaymentReview({
  paymentId,
  adminUserId,
  approvedAmount,
  reviewNote,
  approvalMode,
}: ReviewInvestmentOrderPaymentBase & {
  approvedAmount: number;
  approvalMode: InvestmentApprovalMode;
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
          investorProfile: {
            select: {
              userId: true,
            },
          },
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

    await createReviewNotification({
      tx,
      userId: payment.investmentOrder.investorProfile.userId,
      key: `investment-payment-review:${payment.id}:${approvalMode}`,
      title:
        approvalMode === "FULL"
          ? "Investment payment approved"
          : "Investment payment partially approved",
      message:
        approvalMode === "FULL"
          ? "Your investment payment proof was approved."
          : "Your investment payment proof was partially approved.",
      link: `/account/dashboard/user/investment-orders/${payment.investmentOrderId}/payment`,
      metadata: {
        paymentId: payment.id,
        investmentOrderId: payment.investmentOrderId,
        approvalMode,
        approvedAmount,
        reviewedByUserId: adminUserId,
      },
    });
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
      investmentOrder: {
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

    await createReviewNotification({
      tx,
      userId: payment.investmentOrder.investorProfile.userId,
      key: `investment-payment-review:${payment.id}:REJECTED`,
      title: "Investment payment rejected",
      message: "Your investment payment proof was rejected by the admin team.",
      link: `/account/dashboard/user/investment-orders/${payment.investmentOrderId}/payment`,
      metadata: {
        paymentId: payment.id,
        investmentOrderId: payment.investmentOrderId,
        rejectionReason,
        reviewedByUserId: adminUserId,
      },
    });
  });

  return { ok: true, investmentOrderId: payment.investmentOrderId };
}
