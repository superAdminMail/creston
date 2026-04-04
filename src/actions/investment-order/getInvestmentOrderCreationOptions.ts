"use server";

import type {
  InvestmentTierLevel,
  InvestmentPeriod,
  InvestmentPlanCategory,
  InvestmentType,
} from "@/generated/prisma";
import { InvestmentCatalogStatus } from "@/generated/prisma";
import { formatCurrency, formatEnumLabel, formatTierLevel } from "@/lib/formatters/formatters";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";

type Decimalish = {
  toNumber(): number;
};

export type InvestmentOrderCreationTierOption = {
  id: string;
  level: InvestmentTierLevel;
  levelLabel: string;
  minAmount: number;
  maxAmount: number;
  roiPercent: number;
  isActive: boolean;
};

export type InvestmentOrderCreationPlanOption = {
  id: string;
  investmentId: string;
  investmentName: string;
  name: string;
  slug: string;
  description: string;
  category: InvestmentPlanCategory;
  categoryLabel: string;
  period: InvestmentPeriod;
  periodLabel: string;
  currency: string;
  isActive: boolean;
  tiers: InvestmentOrderCreationTierOption[];
  tiersCountLabel: string;
  tierRangeLabel: string | null;
};

export type InvestmentOrderCreationInvestmentOption = {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: InvestmentType;
  typeLabel: string;
  period: InvestmentPeriod;
  periodLabel: string;
  isActive: boolean;
  sortOrder: number;
  icon: {
    url: string;
    alt: string;
  } | null;
  plans: InvestmentOrderCreationPlanOption[];
};

export type InvestmentOrderCreationOptionsData = {
  hasInvestorProfile: boolean;
  totalActiveInvestments: number;
  totalActivePlans: number;
  totalActiveTiers: number;
  investments: InvestmentOrderCreationInvestmentOption[];
};

function toNumber(value: Decimalish | number) {
  if (typeof value === "number") return value;
  return value.toNumber();
}

export async function getInvestmentOrderCreationOptions(): Promise<InvestmentOrderCreationOptionsData> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const investorProfile = await prisma.investorProfile.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!investorProfile?.id) {
    return {
      hasInvestorProfile: false,
      totalActiveInvestments: 0,
      totalActivePlans: 0,
      totalActiveTiers: 0,
      investments: [],
    };
  }

  const investments = await prisma.investment.findMany({
    where: {
      isActive: true,
      status: InvestmentCatalogStatus.ACTIVE,
      investmentPlans: {
        some: {
          isActive: true,
          tiers: {
            some: {
              isActive: true,
            },
          },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      type: true,
      period: true,
      isActive: true,
      sortOrder: true,
      iconFileAsset: {
        select: {
          url: true,
        },
      },
      investmentPlans: {
        where: {
          isActive: true,
          tiers: {
            some: {
              isActive: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          category: true,
          period: true,
          currency: true,
          isActive: true,
          tiers: {
            where: {
              isActive: true,
            },
            orderBy: {
              level: "asc",
            },
            select: {
              id: true,
              level: true,
              minAmount: true,
              maxAmount: true,
              roiPercent: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  const normalizedInvestments = investments
    .map<InvestmentOrderCreationInvestmentOption>((investment) => ({
      id: investment.id,
      name: investment.name,
      slug: investment.slug,
      description:
        investment.description?.trim() ||
        "Structured Havenstone investment option tailored for long-term financial planning.",
      type: investment.type,
      typeLabel: formatEnumLabel(investment.type),
      period: investment.period,
      periodLabel: formatEnumLabel(investment.period),
      isActive: investment.isActive,
      sortOrder: investment.sortOrder,
      icon: investment.iconFileAsset?.url
        ? {
            url: investment.iconFileAsset.url,
            alt: `${investment.name} icon`,
          }
        : null,
      plans: investment.investmentPlans.map((plan) => ({
        id: plan.id,
        investmentId: investment.id,
        investmentName: investment.name,
        name: plan.name,
        slug: plan.slug,
        description:
          plan.description?.trim() ||
          "Platform-managed investment plan with structured contribution boundaries.",
        category: plan.category,
        categoryLabel: formatEnumLabel(plan.category),
        period: plan.period,
        periodLabel: formatEnumLabel(plan.period),
        currency: plan.currency,
        isActive: plan.isActive,
        tiers: plan.tiers.map((tier) => ({
          id: tier.id,
          level: tier.level,
          levelLabel: formatTierLevel(tier.level),
          minAmount: toNumber(tier.minAmount),
          maxAmount: toNumber(tier.maxAmount),
          roiPercent: toNumber(tier.roiPercent),
          isActive: tier.isActive,
        })),
        tiersCountLabel:
          plan.tiers.length === 1
            ? "1 tier option available"
            : `${plan.tiers.length} tier options available`,
        tierRangeLabel:
          plan.tiers.length > 0
            ? `${formatCurrency(
                Math.min(...plan.tiers.map((tier) => toNumber(tier.minAmount))),
                plan.currency,
              )} - ${formatCurrency(
                Math.max(...plan.tiers.map((tier) => toNumber(tier.maxAmount))),
                plan.currency,
              )}`
            : null,
      })),
    }))
    .filter((investment) => investment.plans.length > 0);

  return {
    hasInvestorProfile: true,
    totalActiveInvestments: normalizedInvestments.length,
    totalActivePlans: normalizedInvestments.reduce(
      (total, investment) => total + investment.plans.length,
      0,
    ),
    totalActiveTiers: normalizedInvestments.reduce(
      (total, investment) =>
        total +
        investment.plans.reduce((planTotal, plan) => planTotal + plan.tiers.length, 0),
      0,
    ),
    investments: normalizedInvestments,
  };
}
