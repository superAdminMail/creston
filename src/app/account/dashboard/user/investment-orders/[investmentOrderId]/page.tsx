import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import { isInactiveInvestmentOrderRuntimeStatus } from "@/lib/investment/formatInvestmentOrderRuntimeStatusLabel";
import {
  buildInvestmentOrderCapitalUpdatePath,
  buildInvestmentOrderUpgradePath,
  getInvestmentOrderCapitalUpdateSettings,
  hasInvestmentOrderCapitalUpdateOffer,
  hasInvestmentOrderUpgradeOffer,
  isInvestmentOrderCapitalUpdated,
  isInvestmentOrderUpgraded,
} from "@/lib/investment/investmentOrderUpgrade";
import { formatInvestmentTierReturnLabel } from "@/lib/investment/formatInvestmentTierReturnLabel";
import { resolveInvestmentOrderSchedule } from "@/lib/services/investment/orderLifecycle";
import { computeInvestmentOrderRecognizedProfit } from "@/lib/services/investment/valuationService";

import InvestmentOrderDetailsClient from "../_components/InvestmentOrderDetailsClient";

type DecimalLike = {
  toNumber(): number;
};

function toNumber(value: DecimalLike | number | null | undefined) {
  return typeof value === "number" ? value : (value?.toNumber?.() ?? 0);
}

type PageProps = {
  params: Promise<{
    investmentOrderId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { investmentOrderId } = await params;
  const userId = await getCurrentUserId();

  if (!userId) notFound();

  const order = await prisma.investmentOrder.findFirst({
    where: {
      id: investmentOrderId,
      investorProfile: {
        userId,
      },
    },
    select: {
      id: true,
      amount: true,
      amountPaid: true,
      expectedReturn: true,
      currency: true,
      investmentModel: true,
      status: true,
      runtimeStatus: true,
      isMatured: true,
      paymentMethodType: true,
      startDate: true,
      maturityDate: true,
      paidAt: true,
      confirmedAt: true,
      paymentReference: true,
      createdAt: true,
      investmentPlanTier: {
        select: {
          fixedRoiPercent: true,
          projectedRoiMin: true,
          projectedRoiMax: true,
          level: true,
        },
      },
      investmentPlan: {
        select: {
          name: true,
          durationDays: true,
          investmentModel: true,
          investment: {
            select: {
              name: true,
              type: true,
              symbol: true,
            },
          },
        },
      },
      investmentEarnings: {
        select: {
          amount: true,
        },
      },
      upgradeStatus: true,
      upgradeAmount: true,
      upgradePaymentId: true,
      upgradeRequestedAt: true,
      upgradeReviewedAt: true,
      capitalUpdateStatus: true,
      capitalUpdateAmount: true,
      capitalUpdatePaymentId: true,
      capitalUpdateRequestedAt: true,
      capitalUpdateReviewedAt: true,
    },
  });

  if (!order) notFound();

  const amount = toNumber(order.amount);
  const expectedReturn = toNumber(order.expectedReturn);
  const amountPaid = toNumber(order.amountPaid);
  const remainingAmount = Math.max(amount - amountPaid, 0);

  const earnedProfit = Number(computeInvestmentOrderRecognizedProfit(order));
  const returnLabel = formatInvestmentTierReturnLabel({
    investmentModel: order.investmentModel,
    fixedRoiPercent: order.investmentPlanTier.fixedRoiPercent
      ? toNumber(order.investmentPlanTier.fixedRoiPercent)
      : null,
    projectedRoiMin: order.investmentPlanTier.projectedRoiMin
      ? toNumber(order.investmentPlanTier.projectedRoiMin)
      : null,
    projectedRoiMax: order.investmentPlanTier.projectedRoiMax
      ? toNumber(order.investmentPlanTier.projectedRoiMax)
      : null,
  });

  const paymentMethodLabel = order.paymentMethodType
    ? formatEnumLabel(order.paymentMethodType)
    : "Not set";

  const hasUpgradeOffer = hasInvestmentOrderUpgradeOffer(
    order.runtimeStatus,
    order,
  );

  const hasCapitalUpdateOffer = hasInvestmentOrderCapitalUpdateOffer(
    order.runtimeStatus,
    order,
  );

  const capitalUpdateSettings = getInvestmentOrderCapitalUpdateSettings(order);

  const isUpgraded = isInvestmentOrderUpgraded(order.runtimeStatus, order);

  const isCapitalUpdated = isInvestmentOrderCapitalUpdated(
    order.runtimeStatus,
    order,
  );

  const resolvedLifecycle = resolveInvestmentOrderSchedule(
    order.startDate,
    order.maturityDate,
    order.investmentPlan.durationDays,
    order.confirmedAt ?? order.createdAt,
  );

  const canMakePayment =
    order.status === "PENDING_PAYMENT" || order.status === "PARTIALLY_PAID";

  const canUpgrade = hasUpgradeOffer && !canMakePayment;
  const canUpdateCapital = hasCapitalUpdateOffer && !canMakePayment;

  return (
    <InvestmentOrderDetailsClient
      order={{
        id: order.id,
        amount,
        amountPaid,
        expectedReturn,
        earnedProfit,
        remainingAmount,
        currency: order.currency,
        investmentModel: order.investmentModel,
        status: order.status,
        runtimeStatus: order.runtimeStatus,
        isMatured: order.isMatured,
        paymentMethodLabel,
        paymentReference: order.paymentReference,
        startDate: resolvedLifecycle.startDate?.toISOString() ?? null,
        maturityDate: resolvedLifecycle.maturityDate?.toISOString() ?? null,
        paidAt: order.paidAt?.toISOString() ?? null,
        confirmedAt: order.confirmedAt?.toISOString() ?? null,
        createdAt: order.createdAt.toISOString(),
        investmentPlan: {
          name: order.investmentPlan.name,
          durationDays: order.investmentPlan.durationDays,
          investmentModel: order.investmentPlan.investmentModel,
          investment: {
            name: order.investmentPlan.investment.name,
            type: order.investmentPlan.investment.type,
            symbol: order.investmentPlan.investment.symbol,
          },
        },
        investmentPlanTier: {
          level: order.investmentPlanTier.level,
        },
        returnLabel,
        capitalUpdateReason: capitalUpdateSettings.reason ?? null,
        hasUpgradeOffer,
        hasCapitalUpdateOffer,
        isUpgraded,
        isCapitalUpdated,
        canMakePayment,
        canUpgrade,
        canUpdateCapital,
      }}
      isInactive={isInactiveInvestmentOrderRuntimeStatus(order.runtimeStatus)}
      upgradePath={buildInvestmentOrderUpgradePath(order.id)}
      capitalUpdatePath={buildInvestmentOrderCapitalUpdatePath(order.id)}
    />
  );
}
