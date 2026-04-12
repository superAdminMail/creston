import { cache } from "react";

import { InvestmentModel, InvestmentOrderStatus, SavingsStatus } from "@/generated/prisma";

import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatEnumLabel } from "@/lib/formatters/formatters";
import { toDecimal } from "@/lib/services/investment/decimal";

type HeroSnapshot = {
  statusLabel: string;
  totalValueLabel: string;
  topLabel: string;
  planLabel: string;
  durationLabel: string;
  userCountLabel: string;
};

function abbreviateNumber(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  }

  return `${value}`;
}

function resolveDurationLabel(durationDays: number | null) {
  if (!durationDays || durationDays <= 0) {
    return "Flexible";
  }

  if (durationDays % 365 === 0) {
    const years = durationDays / 365;
    return `${years} ${years === 1 ? "Year" : "Years"}`;
  }

  if (durationDays % 30 === 0) {
    const months = durationDays / 30;
    return `${months} ${months === 1 ? "Month" : "Months"}`;
  }

  if (durationDays % 7 === 0) {
    const weeks = durationDays / 7;
    return `${weeks} ${weeks === 1 ? "Week" : "Weeks"}`;
  }

  return `${durationDays} Days`;
}

export const getHeroSnapshot = cache(async (): Promise<HeroSnapshot> => {
  const site = await getSiteSeoConfig();

  const [investmentOrders, savingsSummary, investorProfileCount] = await Promise.all([
    prisma.investmentOrder.findMany({
      where: {
        status: InvestmentOrderStatus.CONFIRMED,
        isWithdrawn: false,
      },
      select: {
        amount: true,
        currentValue: true,
        accruedProfit: true,
        investmentModel: true,
        investmentPlan: {
          select: {
            name: true,
            durationDays: true,
          },
        },
        investmentPlanTier: {
          select: {
            investmentPlan: {
              select: {
                investment: {
                  select: {
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.savingsAccount.aggregate({
      where: {
        status: SavingsStatus.ACTIVE,
        isLocked: false,
      },
      _sum: {
        balance: true,
      },
    }),
    prisma.investorProfile.count(),
  ]);

  const totalInvestments = investmentOrders.reduce((sum, order) => {
    const resolvedValue =
      order.investmentModel === InvestmentModel.MARKET &&
      toDecimal(order.currentValue).greaterThan(0)
        ? toDecimal(order.currentValue)
        : toDecimal(order.amount).add(toDecimal(order.accruedProfit));

    return sum.add(resolvedValue);
  }, toDecimal(0));

  const totalSavings = toDecimal(savingsSummary._sum.balance);
  const totalValue = totalInvestments.add(totalSavings);

  const typeTotals = new Map<string, { total: number; label: string }>();
  const planTotals = new Map<string, { total: number; durationDays: number | null; label: string }>();

  for (const order of investmentOrders) {
    const resolvedValue =
      order.investmentModel === InvestmentModel.MARKET &&
      toDecimal(order.currentValue).greaterThan(0)
        ? toDecimal(order.currentValue)
        : toDecimal(order.amount).add(toDecimal(order.accruedProfit));

    const typeLabel =
      formatEnumLabel(
        order.investmentPlanTier.investmentPlan.investment.type,
      ) || "Investments";
    const existingType = typeTotals.get(typeLabel);
    typeTotals.set(typeLabel, {
      label: typeLabel,
      total: (existingType?.total ?? 0) + resolvedValue.toNumber(),
    });

    const planName = order.investmentPlan.name;
    const existingPlan = planTotals.get(planName);
    planTotals.set(planName, {
      label: planName,
      total: (existingPlan?.total ?? 0) + resolvedValue.toNumber(),
      durationDays: order.investmentPlan.durationDays,
    });
  }

  const topType = Array.from(typeTotals.values()).sort((left, right) => right.total - left.total)[0];
  const topPlan = Array.from(planTotals.values()).sort((left, right) => right.total - left.total)[0];

  return {
    statusLabel: "Active",
    totalValueLabel: formatCurrency(totalValue.toNumber(), "USD"),
    topLabel: topType?.label ?? "Savings",
    planLabel: topPlan?.label ?? site.siteName,
    durationLabel: resolveDurationLabel(topPlan?.durationDays ?? null),
    userCountLabel: `${abbreviateNumber(investorProfileCount)}+ Investors`,
  };
});
