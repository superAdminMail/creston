"use server";

import { formatCurrency, formatDateLabel, formatEnumLabel } from "@/lib/formatters/formatters";
import { resolveInvestmentTierRoiPercentValue } from "@/lib/investment/formatInvestmentTierReturnLabel";
import { prisma } from "@/lib/prisma";

import {
  assertAdminInvestmentOrderAccess,
  canConfirmInvestmentOrderStatus,
  formatStatusLabel,
} from "./adminInvestmentOrder.shared";

export type AdminInvestmentOrderDetails = {
  id: string;
  investorName: string;
  investorEmail: string;
  investorKycStatus: string;
  amount: string;
  amountValue: number;
  currency: string;
  statusLabel: string;
  status: string;
  runtimeStatus: string;
  runtimeStatusLabel: string;
  paymentReference: string;
  paymentDate: string;
  confirmedDate: string;
  createdDate: string;
  modelLabel: string;
  accountName: string;
  accountStatusLabel: string;
  accountOpenedAt: string;
  planName: string;
  planPeriodLabel: string;
  planDurationLabel: string;
  investmentName: string;
  investmentTypeLabel: string;
  tierLabel: string;
  roiPercentLabel: string;
  expectedReturn: string;
  accruedProfit: string;
  startDate: string;
  maturityDate: string;
  adminNotes: string;
  cancellationReason: string;
  canConfirm: boolean;
  canDelete: boolean;
  canCancel: boolean;
};

export async function getAdminInvestmentOrderDetails(orderId: string) {
  await assertAdminInvestmentOrderAccess();

  const order = await prisma.investmentOrder.findUnique({
    where: {
      id: orderId,
    },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      runtimeStatus: true,
      paymentReference: true,
      paidAt: true,
      confirmedAt: true,
      createdAt: true,
      investmentModel: true,
      expectedReturn: true,
      accruedProfit: true,
      startDate: true,
      maturityDate: true,
      adminNotes: true,
      cancellationReason: true,
      investorProfile: {
        select: {
          kycStatus: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      investmentAccount: {
        select: {
          id: true,
          status: true,
          openedAt: true,
        },
      },
      investmentPlan: {
        select: {
          name: true,
          period: true,
          durationDays: true,
          investment: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      },
      investmentPlanTier: {
        select: {
          level: true,
          fixedRoiPercent: true,
          projectedRoiMin: true,
          projectedRoiMax: true,
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  return {
    id: order.id,
    investorName: order.investorProfile.user.name?.trim() || "Unnamed investor",
    investorEmail: order.investorProfile.user.email,
    investorKycStatus: formatEnumLabel(order.investorProfile.kycStatus),
    amount: formatCurrency(order.amount.toNumber(), order.currency),
    amountValue: order.amount.toNumber(),
    currency: order.currency,
    status: order.status,
    statusLabel: formatStatusLabel(order.status),
    runtimeStatus: order.runtimeStatus,
    runtimeStatusLabel: formatEnumLabel(order.runtimeStatus),
    paymentReference:
      order.paymentReference ?? `ORD-${order.id.slice(0, 8).toUpperCase()}`,
    paymentDate: formatDateLabel(order.paidAt, "Not paid yet"),
    confirmedDate: formatDateLabel(order.confirmedAt, "Awaiting confirmation"),
    createdDate: formatDateLabel(order.createdAt),
    modelLabel: formatEnumLabel(order.investmentModel),
    accountName: `Account ${order.investmentAccount.id.slice(0, 8).toUpperCase()}`,
    accountStatusLabel: formatEnumLabel(order.investmentAccount.status),
    accountOpenedAt: formatDateLabel(order.investmentAccount.openedAt, "Not opened"),
    planName: order.investmentPlan.name,
    planPeriodLabel: formatEnumLabel(order.investmentPlan.period),
    planDurationLabel: `${order.investmentPlan.durationDays} days`,
    investmentName: order.investmentPlan.investment.name,
    investmentTypeLabel: formatEnumLabel(order.investmentPlan.investment.type),
    tierLabel: formatEnumLabel(order.investmentPlanTier.level),
    roiPercentLabel: (() => {
      const roiPercent = resolveInvestmentTierRoiPercentValue({
        investmentModel: order.investmentModel,
        fixedRoiPercent: order.investmentPlanTier.fixedRoiPercent
          ? order.investmentPlanTier.fixedRoiPercent.toNumber()
          : null,
        projectedRoiMin: order.investmentPlanTier.projectedRoiMin
          ? order.investmentPlanTier.projectedRoiMin.toNumber()
          : null,
        projectedRoiMax: order.investmentPlanTier.projectedRoiMax
          ? order.investmentPlanTier.projectedRoiMax.toNumber()
          : null,
      });

      return roiPercent !== null ? `${roiPercent.toFixed(2)}%` : "Not configured";
    })(),
    expectedReturn: formatCurrency(order.expectedReturn?.toNumber() ?? 0, order.currency),
    accruedProfit: formatCurrency(order.accruedProfit.toNumber(), order.currency),
    startDate: formatDateLabel(order.startDate, "Not started"),
    maturityDate: formatDateLabel(order.maturityDate, "Not set"),
    adminNotes: order.adminNotes ?? "",
    cancellationReason: order.cancellationReason ?? "",
    canConfirm: canConfirmInvestmentOrderStatus(order.status),
    canDelete: order.status === "PENDING_PAYMENT",
    canCancel: order.status === "PENDING_PAYMENT",
  } satisfies AdminInvestmentOrderDetails;
}
