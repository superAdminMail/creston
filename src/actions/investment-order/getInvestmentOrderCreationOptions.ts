"use server";

import type {
  InvestmentPeriod,
  InvestmentPlanCategory,
  InvestmentType,
} from "@/generated/prisma";
import { InvestmentCatalogStatus } from "@/generated/prisma";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";

type Decimalish = {
  toNumber(): number;
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
  minAmount: number;
  maxAmount: number;
  currency: string;
  isActive: boolean;
  riskLevelLabel: string;
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
  riskLevelLabel: string;
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
      riskLevel: true,
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
          minAmount: true,
          maxAmount: true,
          currency: true,
          isActive: true,
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
      riskLevel: investment.riskLevel,
      riskLevelLabel: formatEnumLabel(investment.riskLevel),
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
        minAmount: toNumber(plan.minAmount),
        maxAmount: toNumber(plan.maxAmount),
        currency: plan.currency,
        isActive: plan.isActive,
        riskLevel: investment.riskLevel,
        riskLevelLabel: formatEnumLabel(investment.riskLevel),
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
    investments: normalizedInvestments,
  };
}
