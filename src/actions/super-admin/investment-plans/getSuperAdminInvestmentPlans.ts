import type { InvestmentPeriod, InvestmentPlanCategory } from "@/generated/prisma";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { formatCurrency, formatDateLabel, formatEnumLabel } from "@/lib/formatters/formatters";

export type SuperAdminInvestmentPlanFilters = {
  investmentId?: string;
  category?: string;
  period?: string;
  currency?: string;
  isActive?: string;
};

export type SuperAdminInvestmentPlanListItem = {
  id: string;
  name: string;
  slug: string;
  investmentId: string;
  investmentName: string;
  category: InvestmentPlanCategory;
  categoryLabel: string;
  period: InvestmentPeriod;
  periodLabel: string;
  minAmount: number;
  maxAmount: number;
  minAmountLabel: string;
  maxAmountLabel: string;
  currency: string;
  isActive: boolean;
  updatedAt: string;
};

export type SuperAdminInvestmentOption = {
  id: string;
  name: string;
  slug: string;
};

export type SuperAdminInvestmentPlansData = {
  filters: SuperAdminInvestmentPlanFilters;
  filterOptions: {
    investments: SuperAdminInvestmentOption[];
    categories: Array<{ value: InvestmentPlanCategory; label: string }>;
    periods: Array<{ value: InvestmentPeriod; label: string }>;
  };
  plans: SuperAdminInvestmentPlanListItem[];
  investmentOptions: SuperAdminInvestmentOption[];
};

function parseBooleanFilter(value?: string) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export async function getSuperAdminInvestmentPlans(
  filters: SuperAdminInvestmentPlanFilters = {},
): Promise<SuperAdminInvestmentPlansData> {
  await requireSuperAdminAccess();

  const [plans, investments] = await Promise.all([
    prisma.investmentPlan.findMany({
      where: {
        ...(filters.investmentId ? { investmentId: filters.investmentId } : {}),
        ...(filters.category
          ? { category: filters.category as InvestmentPlanCategory }
          : {}),
        ...(filters.period ? { period: filters.period as InvestmentPeriod } : {}),
        ...(filters.currency
          ? { currency: filters.currency.trim().toUpperCase() }
          : {}),
        ...(typeof parseBooleanFilter(filters.isActive) === "boolean"
          ? { isActive: parseBooleanFilter(filters.isActive) }
          : {}),
      },
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        period: true,
        minAmount: true,
        maxAmount: true,
        currency: true,
        isActive: true,
        updatedAt: true,
        investment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.investment.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  const investmentOptions = investments.map((investment) => ({
    id: investment.id,
    name: investment.name,
    slug: investment.slug,
  }));

  return {
    filters,
    filterOptions: {
      investments: investmentOptions,
      categories: [
        "SAVINGS",
        "PERSONAL_RETIREMENT",
        "CHILD_EDUCATION",
        "HOME_OWNERSHIP",
        "VEHICLE",
        "EMERGENCY_FUND",
        "WEALTH_BUILDING",
        "INCOME_GENERATION",
        "CAPITAL_PRESERVATION",
        "OTHER",
      ].map((value) => ({
        value: value as InvestmentPlanCategory,
        label: formatEnumLabel(value),
      })),
      periods: ["SHORT_TERM", "MEDIUM_TERM", "LONG_TERM"].map((value) => ({
        value: value as InvestmentPeriod,
        label: formatEnumLabel(value),
      })),
    },
    plans: plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      investmentId: plan.investment.id,
      investmentName: plan.investment.name,
      category: plan.category,
      categoryLabel: formatEnumLabel(plan.category),
      period: plan.period,
      periodLabel: formatEnumLabel(plan.period),
      minAmount: Number(plan.minAmount),
      maxAmount: Number(plan.maxAmount),
      minAmountLabel: formatCurrency(Number(plan.minAmount), plan.currency),
      maxAmountLabel: formatCurrency(Number(plan.maxAmount), plan.currency),
      currency: plan.currency,
      isActive: plan.isActive,
      updatedAt: formatDateLabel(plan.updatedAt),
    })),
    investmentOptions,
  };
}
