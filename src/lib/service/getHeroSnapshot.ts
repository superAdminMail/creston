import { InvestmentOrderStatus, SavingsStatus } from "@/generated/prisma";

import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { prisma } from "@/lib/prisma";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import { SITE_CONFIGURATION_ID } from "@/lib/site/siteConfiguration";
import { decimalToNumber, toDecimal } from "@/lib/services/investment/decimal";
import { computeInvestmentOrderRecognizedProfit } from "@/lib/services/investment/valuationService";

type HeroSnapshot = {
  statusLabel: string;
  totalValueLabel: string;
  totalCapitalInflowValue: number;
  topLabel: string;
  planLabel: string;
  durationLabel: string;
  userCountLabel: string;
  investorCountValue: number;
};

const HERO_CAPITAL_INFLOW_DAILY_INCREMENT = 860_000;
const HERO_INVESTOR_COUNT_DAILY_INCREMENT = 600;
const HERO_ACCRUAL_WINDOW_MS = 24 * 60 * 60 * 1000;
const HERO_CAPITAL_INFLOW_DEFAULT = toDecimal(796_000_000);
const HERO_INVESTOR_COUNT_DEFAULT = 65_000;

function abbreviateNumber(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  }

  return `${value}`;
}

function formatCompactDollar(value: number) {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}b`;
  }

  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}m`;
  }

  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1).replace(/\.0$/, "")}k`;
  }

  return `$${value.toFixed(0)}`;
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

async function ensureHeroMetricsOffsets() {
  const now = new Date();

  const siteConfiguration = await prisma.siteConfiguration.findUnique({
    where: {
      id: SITE_CONFIGURATION_ID,
    },
    select: {
      id: true,
      siteName: true,
      heroCapitalInflowOffset: true,
      heroInvestorCountOffset: true,
      heroMetricsLastAccruedAt: true,
    },
  });

  if (!siteConfiguration) {
    return prisma.siteConfiguration.upsert({
      where: {
        id: SITE_CONFIGURATION_ID,
      },
      create: {
        id: SITE_CONFIGURATION_ID,
        siteName: "Company",
        heroCapitalInflowOffset: HERO_CAPITAL_INFLOW_DEFAULT,
        heroInvestorCountOffset: HERO_INVESTOR_COUNT_DEFAULT,
        heroMetricsLastAccruedAt: now,
      },
      update: {
        heroCapitalInflowOffset: HERO_CAPITAL_INFLOW_DEFAULT,
        heroInvestorCountOffset: HERO_INVESTOR_COUNT_DEFAULT,
        heroMetricsLastAccruedAt: now,
      },
      select: {
        id: true,
        siteName: true,
        heroCapitalInflowOffset: true,
        heroInvestorCountOffset: true,
        heroMetricsLastAccruedAt: true,
      },
    });
  }

  if (!siteConfiguration.heroMetricsLastAccruedAt) {
    await prisma.siteConfiguration.updateMany({
      where: {
        id: SITE_CONFIGURATION_ID,
        heroMetricsLastAccruedAt: null,
      },
      data: {
        heroMetricsLastAccruedAt: now,
      },
    });

    return {
      ...siteConfiguration,
      heroMetricsLastAccruedAt: now,
    };
  }

  const elapsedMs = now.getTime() - siteConfiguration.heroMetricsLastAccruedAt.getTime();
  const elapsedPeriods = Math.floor(elapsedMs / HERO_ACCRUAL_WINDOW_MS);

  if (elapsedPeriods <= 0) {
    return siteConfiguration;
  }

  const nextAccruedAt = new Date(
    siteConfiguration.heroMetricsLastAccruedAt.getTime() +
      elapsedPeriods * HERO_ACCRUAL_WINDOW_MS,
  );

  const updateResult = await prisma.siteConfiguration.updateMany({
    where: {
      id: SITE_CONFIGURATION_ID,
      heroMetricsLastAccruedAt: siteConfiguration.heroMetricsLastAccruedAt,
    },
    data: {
      heroCapitalInflowOffset: {
        increment: toDecimal(
          HERO_CAPITAL_INFLOW_DAILY_INCREMENT * elapsedPeriods,
        ),
      },
      heroInvestorCountOffset: {
        increment: HERO_INVESTOR_COUNT_DAILY_INCREMENT * elapsedPeriods,
      },
      heroMetricsLastAccruedAt: nextAccruedAt,
    },
  });

  if (updateResult.count > 0) {
    return prisma.siteConfiguration.findUnique({
      where: {
        id: SITE_CONFIGURATION_ID,
      },
      select: {
        id: true,
        siteName: true,
        heroCapitalInflowOffset: true,
        heroInvestorCountOffset: true,
        heroMetricsLastAccruedAt: true,
      },
    });
  }

  return prisma.siteConfiguration.findUnique({
    where: {
      id: SITE_CONFIGURATION_ID,
    },
    select: {
      id: true,
      siteName: true,
      heroCapitalInflowOffset: true,
      heroInvestorCountOffset: true,
      heroMetricsLastAccruedAt: true,
    },
  });
}

export async function getHeroSnapshot(): Promise<HeroSnapshot> {
  const site = await getSiteSeoConfig();
  const heroMetrics = await ensureHeroMetricsOffsets();

  const [investmentOrders, savingsSummary, investorProfileCount] =
    await Promise.all([
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
    const resolvedValue = toDecimal(order.amount).add(
      computeInvestmentOrderRecognizedProfit(order),
    );

    return sum.add(resolvedValue);
  }, toDecimal(0));

  const totalSavings = toDecimal(savingsSummary._sum.balance);
  const totalValue = totalInvestments.add(totalSavings);
  const headlineTotalValue = totalValue.add(
    toDecimal(heroMetrics?.heroCapitalInflowOffset ?? HERO_CAPITAL_INFLOW_DEFAULT),
  );
  const headlineUserCount =
    investorProfileCount +
    (heroMetrics?.heroInvestorCountOffset ?? HERO_INVESTOR_COUNT_DEFAULT);

  const typeTotals = new Map<string, { total: number; label: string }>();
  const planTotals = new Map<
    string,
    { total: number; durationDays: number | null; label: string }
  >();

  for (const order of investmentOrders) {
    const resolvedValue = toDecimal(order.amount).add(
      computeInvestmentOrderRecognizedProfit(order),
    );

    const typeLabel =
      formatEnumLabel(
        order.investmentPlanTier.investmentPlan.investment.type,
      ) || "Investments";
    const existingType = typeTotals.get(typeLabel);
    typeTotals.set(typeLabel, {
      label: typeLabel,
      total: (existingType?.total ?? 0) + decimalToNumber(resolvedValue),
    });

    const planName = order.investmentPlan.name;
    const existingPlan = planTotals.get(planName);
    planTotals.set(planName, {
      label: planName,
      total: (existingPlan?.total ?? 0) + decimalToNumber(resolvedValue),
      durationDays: order.investmentPlan.durationDays,
    });
  }

  const topType = Array.from(typeTotals.values()).sort(
    (left, right) => right.total - left.total,
  )[0];
  const topPlan = Array.from(planTotals.values()).sort(
    (left, right) => right.total - left.total,
  )[0];

  return {
    statusLabel: "Active",
    totalValueLabel: formatCompactDollar(decimalToNumber(headlineTotalValue)),
    totalCapitalInflowValue: decimalToNumber(headlineTotalValue),
    topLabel: topType?.label ?? "Savings",
    planLabel: topPlan?.label ?? site.siteName,
    durationLabel: resolveDurationLabel(topPlan?.durationDays ?? null),
    userCountLabel: `${abbreviateNumber(headlineUserCount)}+ Investors`,
    investorCountValue: headlineUserCount,
  };
}
