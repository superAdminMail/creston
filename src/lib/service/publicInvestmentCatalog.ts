import { cache } from "react";
import { Prisma } from "@/generated/prisma";

import {
  formatCurrency,
  formatEnumLabel,
  formatTierLevel,
} from "@/lib/formatters/formatters";
import { prisma } from "@/lib/prisma";

const publicInvestmentProductSelect = Prisma.validator<Prisma.InvestmentSelect>()({
  id: true,
  name: true,
  slug: true,
  description: true,
  type: true,
  status: true,
  sortOrder: true,
  isActive: true,
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
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      period: true,
      durationDays: true,
      currency: true,
      investmentModel: true,
      tiers: {
        where: {
          isActive: true,
        },
        orderBy: {
          level: "asc",
        },
        select: {
          id: true,
          minAmount: true,
          maxAmount: true,
          roiPercent: true,
          level: true,
        },
      },
    },
  },
});

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
    durationDays: true,
    investmentModel: true,
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
      },
    },
    investment: {
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
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

type PublicInvestmentProductRecord = Prisma.InvestmentGetPayload<{
  select: typeof publicInvestmentProductSelect;
}>;

type PublicInvestmentPlanRecord = Prisma.InvestmentPlanGetPayload<{
  select: typeof publicInvestmentPlanSelect;
}>;

export type PublicInvestmentProductViewModel = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  typeLabel: string;
  status: string;
  statusLabel: string;
  sortOrder: number;
  isActive: boolean;
  iconUrl: string | null;
  planCount: number;
  planCountLabel: string;
  durationLabel: string | null;
  startingAmount: number | null;
  startingAmountLabel: string | null;
  modelLabels: string[];
  overview: string;
  featuredPlan:
    | {
        name: string;
        slug: string;
      }
    | null;
};

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
  durationDays: number;
  durationLabel: string;
  investmentModel: string;
  investmentModelLabel: string;
  currency: string;
  tiersCountLabel: string;
  tierRangeLabel: string | null;
  startingAmount: number | null;
  startingAmountLabel: string | null;
  roiRangeLabel: string | null;
  tiers: Array<{
    id: string;
    level: string;
    levelLabel: string;
    minAmount: number;
    maxAmount: number;
    roiPercent: number | null;
  }>;
  updatedAt: Date;
  investment: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    typeLabel: string;
    status: string;
    statusLabel: string;
    sortOrder: number;
    isActive: boolean;
    iconUrl: string | null;
  };
};

function formatDurationDays(durationDays: number) {
  if (durationDays % 365 === 0) {
    const years = durationDays / 365;
    return `${years} ${years === 1 ? "year" : "years"}`;
  }

  if (durationDays % 30 === 0) {
    const months = durationDays / 30;
    return `${months} ${months === 1 ? "month" : "months"}`;
  }

  if (durationDays % 7 === 0) {
    const weeks = durationDays / 7;
    return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  }

  return `${durationDays} days`;
}

function formatDurationRange(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return formatDurationDays(min);
  }

  return `${formatDurationDays(min)} - ${formatDurationDays(max)}`;
}

function formatPercentRange(values: Array<number | null>) {
  const filtered = values.filter((value): value is number => value !== null);

  if (filtered.length === 0) {
    return null;
  }

  const min = Math.min(...filtered);
  const max = Math.max(...filtered);

  if (min === max) {
    return `${min.toFixed(2)}%`;
  }

  return `${min.toFixed(2)}% - ${max.toFixed(2)}%`;
}

function mapPublicInvestmentProduct(
  product: PublicInvestmentProductRecord,
): PublicInvestmentProductViewModel {
  const tiers = product.investmentPlans.flatMap((plan) => plan.tiers);
  const startingAmount =
    tiers.length > 0 ? Math.min(...tiers.map((tier) => Number(tier.minAmount))) : null;
  const durationLabel = formatDurationRange(
    product.investmentPlans.map((plan) => plan.durationDays),
  );
  const modelLabels = Array.from(
    new Set(
      product.investmentPlans.map((plan) => formatEnumLabel(plan.investmentModel)),
    ),
  );
  const featuredPlan = product.investmentPlans[0]
    ? {
        name: product.investmentPlans[0].name,
        slug: product.investmentPlans[0].slug,
      }
    : null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    type: product.type,
    typeLabel: formatEnumLabel(product.type),
    status: product.status,
    statusLabel: formatEnumLabel(product.status),
    sortOrder: product.sortOrder,
    isActive: product.isActive,
    iconUrl: product.iconFileAsset?.url ?? null,
    planCount: product.investmentPlans.length,
    planCountLabel:
      product.investmentPlans.length === 1
        ? "1 active plan"
        : `${product.investmentPlans.length} active plans`,
    durationLabel,
    startingAmount,
    startingAmountLabel:
      startingAmount !== null
        ? formatCurrency(startingAmount, product.investmentPlans[0]?.currency ?? "USD")
        : null,
    modelLabels,
    overview:
      product.description ||
      `${product.name} gives investors access to structured ${formatEnumLabel(
        product.type,
      ).toLowerCase()} opportunities with a disciplined long-term approach.`,
    featuredPlan,
  };
}

function mapPublicInvestmentPlan(
  plan: PublicInvestmentPlanRecord,
): PublicInvestmentPlanViewModel {
  const tiers = plan.tiers.map((tier) => ({
    id: tier.id,
    level: tier.level,
    levelLabel: formatTierLevel(tier.level),
    minAmount: Number(tier.minAmount),
    maxAmount: Number(tier.maxAmount),
    roiPercent: tier.roiPercent === null ? null : Number(tier.roiPercent),
  }));

  const startingAmount =
    tiers.length > 0 ? Math.min(...tiers.map((tier) => tier.minAmount)) : null;

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
    durationDays: plan.durationDays,
    durationLabel: formatDurationDays(plan.durationDays),
    investmentModel: plan.investmentModel,
    investmentModelLabel: formatEnumLabel(plan.investmentModel),
    currency: plan.currency,
    tiersCountLabel:
      tiers.length === 1
        ? "1 tier option available"
        : `${tiers.length} tier options available`,
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
    startingAmount,
    startingAmountLabel:
      startingAmount !== null ? formatCurrency(startingAmount, plan.currency) : null,
    roiRangeLabel: formatPercentRange(tiers.map((tier) => tier.roiPercent)),
    tiers,
    updatedAt: plan.updatedAt,
    investment: {
      id: plan.investment.id,
      name: plan.investment.name,
      slug: plan.investment.slug,
      description: plan.investment.description,
      type: plan.investment.type,
      typeLabel: formatEnumLabel(plan.investment.type),
      status: plan.investment.status,
      statusLabel: formatEnumLabel(plan.investment.status),
      sortOrder: plan.investment.sortOrder,
      isActive: plan.investment.isActive,
      iconUrl: plan.investment.iconFileAsset?.url ?? null,
    },
  };
}

export const getPublicInvestmentProducts = cache(
  async (): Promise<PublicInvestmentProductViewModel[]> => {
    const products = await prisma.investment.findMany({
      where: {
        isActive: true,
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
      select: publicInvestmentProductSelect,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return products.map(mapPublicInvestmentProduct);
  },
);

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
