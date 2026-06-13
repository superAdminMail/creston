"use server";

import { prisma } from "@/lib/prisma";
import { createReviewNotification } from "@/lib/notifications/createReviewNotification";
import { reconcileInvestmentOrderPaymentState } from "@/app/account/dashboard/admin/investment-payments/_lib/reconcileInvestmentOrderPaymentState";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";

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

  const paymentKind = readPaymentKind(payment.submissionKind);
  const claimedAmount = payment.claimedAmount.toNumber();

  if (payment.investmentOrder.status === "CONFIRMED" && paymentKind !== "UPGRADE") {
    throw new Error(
      "This order is already confirmed and can no longer be reviewed here.",
    );
  }

  if (approvedAmount > claimedAmount) {
    throw new Error("Approved amount cannot be greater than claimed amount.");
  }

  if (paymentKind === "UPGRADE" && approvalMode !== "FULL") {
    throw new Error("Upgrade proofs must be approved in full.");
  }

  if (paymentKind === "UPGRADE" && approvedAmount !== claimedAmount) {
    throw new Error("Upgrade approval must match the submitted upgrade amount.");
  }

  if (approvalMode === "PARTIAL" && approvedAmount >= claimedAmount) {
    throw new Error(
      "Partial approval amount must be lower than the claimed amount.",
    );
  }

  const orderAmount = payment.investmentOrder.amount.toNumber();
  const currentPaid = payment.investmentOrder.amountPaid.toNumber();
  const remaining = Math.max(orderAmount - currentPaid, 0);

  if (approvedAmount > remaining) {
    throw new Error("Approved amount cannot exceed the remaining order balance.");
  }

  const isCryptoProof =
    proofMode === "CRYPTO_PROVIDER" || payment.type === "CRYPTO_PROVIDER";
  const isActiveUpgradeOffer =
    paymentKind === "UPGRADE" &&
    payment.investmentOrder.upgradeStatus === "PENDING_REVIEW" &&
    payment.investmentOrder.upgradeAmount !== null &&
    payment.investmentOrder.upgradePaymentId === payment.id &&
    payment.investmentOrder.runtimeStatus !== "NOT_STARTED" &&
    payment.claimedAmount.toNumber() ===
      payment.investmentOrder.upgradeAmount.toNumber();

  if (paymentKind === "UPGRADE" && !isActiveUpgradeOffer) {
    throw new Error("The upgrade offer is no longer available.");
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

    if (paymentKind === "UPGRADE") {
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
          upgradeReviewedAt: new Date(),
          lastPaymentReviewedAt: new Date(),
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
            ? "Investment upgrade approved"
            : isCryptoProof
              ? "Investment crypto payment approved"
              : "Investment payment approved"
          : paymentKind === "UPGRADE"
            ? "Investment upgrade partially approved"
            : isCryptoProof
              ? "Investment crypto payment partially approved"
              : "Investment payment partially approved",
      message:
        approvalMode === "FULL"
          ? paymentKind === "UPGRADE"
            ? "Your investment upgrade proof was approved."
            : isCryptoProof
              ? "Your crypto payment proof was approved."
              : "Your investment payment proof was approved."
          : paymentKind === "UPGRADE"
            ? "Your investment upgrade proof was partially approved."
            : isCryptoProof
              ? "Your crypto payment proof was partially approved."
              : "Your investment payment proof was partially approved.",
      link: `/account/dashboard/user/investment-orders/${payment.investmentOrderId}/payment`,
      metadata: {
        paymentId: payment.id,
        investmentOrderId: payment.investmentOrderId,
        approvalMode,
        proofMode: proofMode ?? payment.type,
        approvedAmount,
        reviewedByUserId: adminUserId,
        submissionKind: paymentKind,
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
      submissionKind: true,
      investmentOrder: {
        select: {
          upgradeStatus: true,
          upgradeAmount: true,
          upgradePaymentId: true,
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

  const paymentKind = readPaymentKind(payment.submissionKind);

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

    if (paymentKind === "UPGRADE") {
      await tx.investmentOrder.update({
        where: { id: payment.investmentOrderId },
        data: {
          upgradeStatus: "REJECTED",
          upgradeReviewedAt: new Date(),
          lastPaymentReviewedAt: new Date(),
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
          ? "Investment upgrade rejected"
          : "Investment payment rejected",
      message:
        paymentKind === "UPGRADE"
          ? "Your investment upgrade proof was rejected by the admin team."
          : "Your investment payment proof was rejected by the admin team.",
      link: `/account/dashboard/user/investment-orders/${payment.investmentOrderId}/payment`,
      metadata: {
        paymentId: payment.id,
        investmentOrderId: payment.investmentOrderId,
        rejectionReason,
        reviewedByUserId: adminUserId,
        submissionKind: paymentKind,
      },
    });
  });

  return { ok: true, investmentOrderId: payment.investmentOrderId };
}
