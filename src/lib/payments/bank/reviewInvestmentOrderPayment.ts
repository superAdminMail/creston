"use server";

import { prisma } from "@/lib/prisma";
import { createReviewNotification } from "@/lib/notifications/createReviewNotification";
import { reconcileInvestmentOrderPaymentState } from "@/app/account/dashboard/admin/investment-payments/_lib/reconcileInvestmentOrderPaymentState";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";
import { asJsonObject } from "@/lib/payments/paymentJson";

type ReviewInvestmentOrderPaymentBase = {
  paymentId: string;
  adminUserId: string;
  reviewNote?: string | null;
};

type InvestmentApprovalMode = "FULL" | "PARTIAL";
type InvestmentProofMode = CheckoutFundingMethodType;

type PaymentKind = "STANDARD" | "UPGRADE";

function readPaymentKind(value: unknown): PaymentKind {
  return value === "UPGRADE" ? "UPGRADE" : "STANDARD";
}

export async function approveInvestmentOrderPaymentReview({
  paymentId,
  adminUserId,
  approvedAmount,
  reviewNote,
  approvalMode,
  proofMode,
}: ReviewInvestmentOrderPaymentBase & {
  approvedAmount: number;
  approvalMode: InvestmentApprovalMode;
  proofMode?: InvestmentProofMode;
}): Promise<{ ok: true; investmentOrderId: string }> {
  const payment = await prisma.investmentOrderPayment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      status: true,
      type: true,
      submissionKind: true,
      metadata: true,
      claimedAmount: true,
      investmentOrderId: true,
      investmentOrder: {
        select: {
          id: true,
          amount: true,
          amountPaid: true,
          status: true,
          runtimeStatus: true,

          upgradeStatus: true,
          upgradeAmount: true,
          upgradePaymentId: true,

          capitalUpdateStatus: true,
          capitalUpdateAmount: true,
          capitalUpdatePaymentId: true,

          investorProfile: {
            select: {
              userId: true,
            },
          },
          investmentPlan: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment submission not found.");
  }

  const paymentKind = readPaymentKind(payment.submissionKind);
  const paymentMetadata = asJsonObject(payment.metadata);

  const isCapitalUpdate =
    paymentKind === "UPGRADE" && paymentMetadata.kind === "CAPITAL_UPDATE";

  const investmentPlanName = payment.investmentOrder.investmentPlan.name;

  const paymentSubmissionTarget = isCapitalUpdate
    ? `the capital update for your ${investmentPlanName} investment order`
    : paymentKind === "UPGRADE"
      ? `your ${investmentPlanName} investment upgrade`
      : `your ${investmentPlanName} investment order`;

  const claimedAmount = payment.claimedAmount.toNumber();

  if (payment.status !== "PENDING_REVIEW") {
    throw new Error("This payment submission has already been reviewed.");
  }

  if (
    payment.investmentOrder.status === "CONFIRMED" &&
    paymentKind !== "UPGRADE"
  ) {
    throw new Error(
      "This order is already confirmed and can no longer be reviewed here.",
    );
  }

  if (!Number.isFinite(approvedAmount) || approvedAmount <= 0) {
    throw new Error("Approved amount must be greater than zero.");
  }

  if (approvedAmount > claimedAmount) {
    throw new Error("Approved amount cannot be greater than claimed amount.");
  }

  if (paymentKind === "UPGRADE" && approvalMode !== "FULL") {
    throw new Error(
      `${isCapitalUpdate ? "Capital update" : "Upgrade"} proofs must be approved in full.`,
    );
  }

  if (paymentKind === "UPGRADE" && approvedAmount !== claimedAmount) {
    throw new Error(
      `${isCapitalUpdate ? "Capital update" : "Upgrade"} approval must match the submitted amount.`,
    );
  }

  const orderAmount = payment.investmentOrder.amount.toNumber();
  const currentPaid = payment.investmentOrder.amountPaid.toNumber();
  const remaining = Math.max(orderAmount - currentPaid, 0);

  if (paymentKind !== "UPGRADE" && approvedAmount > remaining) {
    throw new Error(
      "Approved amount cannot exceed the remaining order balance.",
    );
  }

  const isActiveUpgradeOffer =
    paymentKind === "UPGRADE" &&
    !isCapitalUpdate &&
    payment.investmentOrder.upgradeStatus === "PENDING_REVIEW" &&
    payment.investmentOrder.upgradeAmount !== null &&
    payment.investmentOrder.upgradePaymentId === payment.id &&
    payment.investmentOrder.runtimeStatus !== "NOT_STARTED" &&
    claimedAmount === payment.investmentOrder.upgradeAmount.toNumber();

  const isActiveCapitalUpdateOffer =
    paymentKind === "UPGRADE" &&
    isCapitalUpdate &&
    payment.investmentOrder.capitalUpdateStatus === "PENDING_REVIEW" &&
    payment.investmentOrder.capitalUpdateAmount !== null &&
    payment.investmentOrder.capitalUpdatePaymentId === payment.id &&
    payment.investmentOrder.runtimeStatus !== "NOT_STARTED" &&
    claimedAmount === payment.investmentOrder.capitalUpdateAmount.toNumber();

  if (paymentKind === "UPGRADE") {
    if (isCapitalUpdate && !isActiveCapitalUpdateOffer) {
      throw new Error("The capital update offer is no longer available.");
    }

    if (!isCapitalUpdate && !isActiveUpgradeOffer) {
      throw new Error("The upgrade offer is no longer available.");
    }
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

    const reviewedAt = new Date();

    if (paymentKind === "UPGRADE" && isCapitalUpdate) {
      await tx.investmentOrder.update({
        where: { id: payment.investmentOrderId },
        data: {
          capitalUpdateStatus: "APPROVED",
          capitalUpdateReviewedAt: reviewedAt,
          lastPaymentReviewedAt: reviewedAt,
        },
      });
    } else if (paymentKind === "UPGRADE") {
      await tx.investmentOrder.update({
        where: { id: payment.investmentOrderId },
        data: {
          amount: {
            increment: approvedAmount,
          },
          amountPaid: {
            increment: approvedAmount,
          },
          upgradeStatus: "APPROVED",
          upgradeReviewedAt: reviewedAt,
          lastPaymentReviewedAt: reviewedAt,
        },
      });
    } else {
      await reconcileInvestmentOrderPaymentState(tx, payment.investmentOrderId);
    }

    await createReviewNotification({
      tx,
      userId: payment.investmentOrder.investorProfile.userId,
      key: `investment-payment-review:${payment.id}:${approvalMode}:${paymentKind}`,
      title:
        approvalMode === "FULL"
          ? paymentKind === "UPGRADE"
            ? isCapitalUpdate
              ? "Order capital update approval confirmed"
              : "Investment upgrade approval confirmed"
            : "Investment payment approval confirmed"
          : paymentKind === "UPGRADE"
            ? isCapitalUpdate
              ? "Partial order capital update approval confirmed"
              : "Partial investment upgrade approval confirmed"
            : "Partial investment payment approval confirmed",
      message: `Congratulations. Your ${
        approvalMode === "FULL" ? "full" : "partial"
      } payment submission for ${paymentSubmissionTarget} has been approved and recorded.`,
      link: `/account/dashboard/user/investment-orders/${payment.investmentOrderId}/payment`,
      metadata: {
        paymentId: payment.id,
        investmentOrderId: payment.investmentOrderId,
        approvalMode,
        proofMode: proofMode ?? payment.type,
        approvedAmount,
        reviewedByUserId: adminUserId,
        submissionKind: paymentKind,
        flow: isCapitalUpdate ? "CAPITAL_UPDATE" : paymentKind,
        dashboardNoticeKind: "INVESTMENT_PAYMENT_APPROVED",
        investmentPlanName,
      },
    });
  });

  return {
    ok: true,
    investmentOrderId: payment.investmentOrderId,
  };
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
      status: true,
      investmentOrderId: true,
      submissionKind: true,
      metadata: true,
      investmentOrder: {
        select: {
          upgradeStatus: true,
          upgradeAmount: true,
          upgradePaymentId: true,

          capitalUpdateStatus: true,
          capitalUpdateAmount: true,
          capitalUpdatePaymentId: true,

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

  if (payment.status !== "PENDING_REVIEW") {
    throw new Error("This payment submission has already been reviewed.");
  }

  const paymentKind = readPaymentKind(payment.submissionKind);
  const paymentMetadata = asJsonObject(payment.metadata);

  const isCapitalUpdate =
    paymentKind === "UPGRADE" && paymentMetadata.kind === "CAPITAL_UPDATE";

  if (paymentKind === "UPGRADE") {
    const isActiveUpgradeOffer =
      !isCapitalUpdate &&
      payment.investmentOrder.upgradeStatus === "PENDING_REVIEW" &&
      payment.investmentOrder.upgradeAmount !== null &&
      payment.investmentOrder.upgradePaymentId === payment.id;

    const isActiveCapitalUpdateOffer =
      isCapitalUpdate &&
      payment.investmentOrder.capitalUpdateStatus === "PENDING_REVIEW" &&
      payment.investmentOrder.capitalUpdateAmount !== null &&
      payment.investmentOrder.capitalUpdatePaymentId === payment.id;

    if (isCapitalUpdate && !isActiveCapitalUpdateOffer) {
      throw new Error("The capital update offer is no longer available.");
    }

    if (!isCapitalUpdate && !isActiveUpgradeOffer) {
      throw new Error("The upgrade offer is no longer available.");
    }
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

    const reviewedAt = new Date();

    if (paymentKind === "UPGRADE" && isCapitalUpdate) {
      await tx.investmentOrder.update({
        where: { id: payment.investmentOrderId },
        data: {
          capitalUpdateStatus: "REJECTED",
          capitalUpdateReviewedAt: reviewedAt,
          lastPaymentReviewedAt: reviewedAt,
        },
      });
    } else if (paymentKind === "UPGRADE") {
      await tx.investmentOrder.update({
        where: { id: payment.investmentOrderId },
        data: {
          upgradeStatus: "REJECTED",
          upgradeReviewedAt: reviewedAt,
          lastPaymentReviewedAt: reviewedAt,
        },
      });
    } else {
      await reconcileInvestmentOrderPaymentState(tx, payment.investmentOrderId);
    }

    await createReviewNotification({
      tx,
      userId: payment.investmentOrder.investorProfile.userId,
      key: `investment-payment-review:${payment.id}:REJECTED:${paymentKind}`,
      title:
        paymentKind === "UPGRADE"
          ? isCapitalUpdate
            ? "Order capital update rejected"
            : "Investment upgrade rejected"
          : "Investment payment rejected",
      message:
        paymentKind === "UPGRADE"
          ? isCapitalUpdate
            ? "Your order capital update proof was rejected by the admin team."
            : "Your investment upgrade proof was rejected by the admin team."
          : "Your investment payment proof was rejected by the admin team.",
      link: `/account/dashboard/user/investment-orders/${payment.investmentOrderId}/payment`,
      metadata: {
        paymentId: payment.id,
        investmentOrderId: payment.investmentOrderId,
        rejectionReason,
        reviewedByUserId: adminUserId,
        submissionKind: paymentKind,
        flow: isCapitalUpdate ? "CAPITAL_UPDATE" : paymentKind,
      },
    });
  });

  return {
    ok: true,
    investmentOrderId: payment.investmentOrderId,
  };
}
