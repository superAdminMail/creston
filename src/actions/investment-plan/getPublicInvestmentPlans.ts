import { cache } from "react";
import { Prisma } from "@/generated/prisma";

import { formatCurrency, formatEnumLabel, formatTierLevel } from "@/lib/formatters/formatters";
import { prisma } from "@/lib/prisma";

const publicInvestmentPlanSelect =
  Prisma.validator<Prisma.InvestmentPlanSelect>()({
    id: true,
    name: true,
    slug: true,
    description: true,
    seoTitle: true,
    seoDescription: true,
    seoImageFile: {
      select: {
        url: true,
      },
    },
    period: true,
    currency: true,
    isActive: true,
    updatedAt: true,
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
    investment: {
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        period: true,
        status: true,
        isActive: true,
        sortOrder: true,
        iconFileAsset: {
          select: {
            url: true,
          },
        },
      },
    },
  });

type PublicInvestmentPlanRecord = Prisma.InvestmentPlanGetPayload<{
  select: typeof publicInvestmentPlanSelect;
}>;

export type PublicInvestmentPlanViewModel = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoImageUrl: string | null;
  period: string;
  periodLabel: string;
  currency: string;
  tiersCountLabel: string;
  tierRangeLabel: string | null;
  tiers: Array<{
    id: string;
    level: string;
    levelLabel: string;
    minAmount: number;
    maxAmount: number;
    roiPercent: number;
  }>;
  updatedAt: Date;
  investment: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    typeLabel: string;
    period: string;
    periodLabel: string;
    status: string;
    statusLabel: string;
    sortOrder: number;
    isActive: boolean;
    iconUrl: string | null;
  };
};

function mapPublicInvestmentPlan(
  plan: PublicInvestmentPlanRecord,
): PublicInvestmentPlanViewModel {
  const tiers = plan.tiers.map((tier) => ({
    id: tier.id,
    level: tier.level,
    levelLabel: formatTierLevel(tier.level),
    minAmount: Number(tier.minAmount),
    maxAmount: Number(tier.maxAmount),
    roiPercent: Number(tier.roiPercent),
  }));

  return {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    description: plan.description,
    seoTitle: plan.seoTitle,
    seoDescription: plan.seoDescription,
    seoImageUrl: plan.seoImageFile?.url ?? null,
    period: plan.period,
    periodLabel: formatEnumLabel(plan.period),
    currency: plan.currency,
    tiersCountLabel:
      tiers.length === 1 ? "1 tier option available" : `${tiers.length} tier options available`,
    tierRangeLabel:
      tiers.length > 0
        ? `${formatCurrency(
            Math.min(...tiers.map((tier) => tier.minAmount)),
            plan.currency,
          )} - ${formatCurrency(
            Math.max(...tiers.map((tier) => tier.maxAmount)),
            plan.currency,
          )}`
        : null,
    tiers,
    updatedAt: plan.updatedAt,
    investment: {
      id: plan.investment.id,
      name: plan.investment.name,
      slug: plan.investment.slug,
      description: plan.investment.description,
      type: plan.investment.type,
      typeLabel: formatEnumLabel(plan.investment.type),
      period: plan.investment.period,
      periodLabel: formatEnumLabel(plan.investment.period),
      status: plan.investment.status,
      statusLabel: formatEnumLabel(plan.investment.status),
      sortOrder: plan.investment.sortOrder,
      isActive: plan.investment.isActive,
      iconUrl: plan.investment.iconFileAsset?.url ?? null,
    },
  };
}

export const getPublicInvestmentPlans = cache(
  async (): Promise<PublicInvestmentPlanViewModel[]> => {
    const plans = await prisma.investmentPlan.findMany({
      where: {
        isActive: true,
        tiers: {
          some: {
            isActive: true,
          },
        },
        investment: {
          isActive: true,
        },
      },
      select: publicInvestmentPlanSelect,
      orderBy: [{ name: "asc" }],
    });

    return plans.map(mapPublicInvestmentPlan).sort((left, right) => {
      if (left.investment.sortOrder !== right.investment.sortOrder) {
        return left.investment.sortOrder - right.investment.sortOrder;
      }

      const investmentComparison = left.investment.name.localeCompare(
        right.investment.name,
      );

      if (investmentComparison !== 0) {
        return investmentComparison;
      }

      return left.name.localeCompare(right.name);
    });
  },
);

export const getPublicInvestmentPlanBySlug = cache(
  async (slug: string): Promise<PublicInvestmentPlanViewModel | null> => {
    const normalizedSlug = slug.trim();

    if (!normalizedSlug) {
      return null;
    }

    const plan = await prisma.investmentPlan.findFirst({
      where: {
        slug: normalizedSlug,
        isActive: true,
        tiers: {
          some: {
            isActive: true,
          },
        },
        investment: {
          isActive: true,
        },
      },
      select: publicInvestmentPlanSelect,
    });

    return plan ? mapPublicInvestmentPlan(plan) : null;
  },
);
