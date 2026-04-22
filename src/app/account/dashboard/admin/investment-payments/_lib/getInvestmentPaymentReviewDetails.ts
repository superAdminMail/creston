import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { InvestmentPaymentReviewDetails } from "@/lib/types/payments/investmentPaymentReview.types";
import { resolveInvestmentTierRoiPercentValue } from "@/lib/investment/formatInvestmentTierReturnLabel";

function toNumber(value: { toNumber(): number } | number | null | undefined) {
  if (typeof value === "number") return value;
  return value?.toNumber?.() ?? 0;
}

export async function getInvestmentPaymentReviewDetails(
  paymentId: string,
): Promise<InvestmentPaymentReviewDetails> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const payment = await prisma.investmentOrderPayment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      type: true,
      status: true,
      claimedAmount: true,
      approvedAmount: true,
      currency: true,
      depositorName: true,
      depositorAccountName: true,
      depositorAccountNo: true,
      transferReference: true,
      blockchainTxHash: true,
      note: true,
      reviewNote: true,
      rejectionReason: true,
      submittedAt: true,
      reviewedAt: true,
      submittedByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviewedByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      receiptFile: {
        select: {
          id: true,
          fileName: true,
          url: true,
        },
      },
      platformPaymentMethod: {
        select: {
          id: true,
          label: true,
          bankName: true,
          bankCode: true,
          accountName: true,
          accountNumber: true,
          instructions: true,
        },
      },
      investmentOrder: {
        select: {
          id: true,
          status: true,
          amount: true,
          amountPaid: true,
          currency: true,
          paymentReference: true,
          paidAt: true,
          confirmedAt: true,
      investmentPlan: {
        select: {
          id: true,
          name: true,
          period: true,
          investmentModel: true,
        },
      },
      investmentPlanTier: {
        select: {
          id: true,
          level: true,
          fixedRoiPercent: true,
          projectedRoiMin: true,
          projectedRoiMax: true,
        },
      },
          investorProfile: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!payment) {
    notFound();
  }

  const orderAmount = toNumber(payment.investmentOrder.amount);
  const amountPaid = toNumber(payment.investmentOrder.amountPaid);

  return {
    id: payment.id,
    type: payment.type,
    status: payment.status,
    claimedAmount: toNumber(payment.claimedAmount),
    approvedAmount: payment.approvedAmount
      ? toNumber(payment.approvedAmount)
      : null,
    currency: payment.currency,
    depositorName: payment.depositorName ?? null,
    depositorAccountName: payment.depositorAccountName ?? null,
    depositorAccountNo: payment.depositorAccountNo ?? null,
    transferReference: payment.transferReference ?? null,
    blockchainTxHash: payment.blockchainTxHash ?? null,
    note: payment.note ?? null,
    reviewNote: payment.reviewNote ?? null,
    rejectionReason: payment.rejectionReason ?? null,
    submittedAt: payment.submittedAt.toISOString(),
    reviewedAt: payment.reviewedAt?.toISOString() ?? null,
    submittedBy: {
      id: payment.submittedByUser?.id ?? null,
      name: payment.submittedByUser?.name ?? null,
      email: payment.submittedByUser?.email ?? null,
    },
    reviewedBy: payment.reviewedByUser
      ? {
          id: payment.reviewedByUser.id ?? null,
          name: payment.reviewedByUser.name ?? null,
          email: payment.reviewedByUser.email ?? null,
        }
      : null,
    receipt: payment.receiptFile
      ? {
          id: payment.receiptFile.id,
          fileName: payment.receiptFile.fileName,
          url: payment.receiptFile.url ?? null,
        }
      : null,
    bankMethod: payment.platformPaymentMethod
      ? {
          id: payment.platformPaymentMethod.id,
          label: payment.platformPaymentMethod.label,
          bankName: payment.platformPaymentMethod.bankName,
          bankCode: payment.platformPaymentMethod.bankCode,
          accountName: payment.platformPaymentMethod.accountName,
          accountNumber: payment.platformPaymentMethod.accountNumber,
          instructions: payment.platformPaymentMethod.instructions,
        }
      : null,
    order: {
      id: payment.investmentOrder.id,
      status: payment.investmentOrder.status,
      amount: orderAmount,
      amountPaid,
      remainingAmount: Math.max(orderAmount - amountPaid, 0),
      currency: payment.investmentOrder.currency,
      paymentReference: payment.investmentOrder.paymentReference ?? null,
      paidAt: payment.investmentOrder.paidAt?.toISOString() ?? null,
      confirmedAt: payment.investmentOrder.confirmedAt?.toISOString() ?? null,
      plan: {
        id: payment.investmentOrder.investmentPlan.id,
        name: payment.investmentOrder.investmentPlan.name,
        period: payment.investmentOrder.investmentPlan.period,
      },
      tier: {
        id: payment.investmentOrder.investmentPlanTier.id,
        level: payment.investmentOrder.investmentPlanTier.level,
        roiPercent:
          resolveInvestmentTierRoiPercentValue({
            investmentModel: payment.investmentOrder.investmentPlan.investmentModel,
            fixedRoiPercent: payment.investmentOrder.investmentPlanTier.fixedRoiPercent
              ? toNumber(payment.investmentOrder.investmentPlanTier.fixedRoiPercent)
              : null,
            projectedRoiMin: payment.investmentOrder.investmentPlanTier.projectedRoiMin
              ? toNumber(payment.investmentOrder.investmentPlanTier.projectedRoiMin)
              : null,
            projectedRoiMax: payment.investmentOrder.investmentPlanTier.projectedRoiMax
              ? toNumber(payment.investmentOrder.investmentPlanTier.projectedRoiMax)
              : null,
          }) ?? 0,
      },
      investor: {
        id: payment.investmentOrder.investorProfile.user.id,
        name: payment.investmentOrder.investorProfile.user.name,
        email: payment.investmentOrder.investorProfile.user.email,
      },
    },
  };
}
