import type { InvestmentPeriod } from "@/generated/prisma";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
  formatTierLevel,
} from "@/lib/formatters/formatters";
import { formatInvestmentTierReturnLabel } from "@/lib/investment/formatInvestmentTierReturnLabel";

export type SuperAdminInvestmentPlanFilters = {
  investmentId?: string;
  period?: string;
  currency?: string;
  isActive?: string;
};

export type SuperAdminInvestmentPlanTierSummary = {
  id: string;
  level: string;
  levelLabel: string;
  minAmount: number;
  maxAmount: number;
  fixedRoiPercent: number | null;
  projectedRoiMin: number | null;
  projectedRoiMax: number | null;
  returnLabel: string | null;
  isActive: boolean;
};

export type SuperAdminInvestmentPlanListItem = {
  id: string;
  name: string;
  slug: string;
  investmentId: string;
  investmentName: string;
  period: InvestmentPeriod;
  periodLabel: string;
  currency: string;
  isActive: boolean;
  updatedAt: string;
  tiersCount: number;
  tiersCountLabel: string;
  tierRangeLabel: string | null;
  tiers: SuperAdminInvestmentPlanTierSummary[];
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
        period: true,
        investmentModel: true,
        currency: true,
        isActive: true,
        updatedAt: true,
        investment: {
          select: {
            id: true,
            name: true,
          },
        },
        tiers: {
          orderBy: {
            level: "asc",
          },
          select: {
            id: true,
            level: true,
            minAmount: true,
            maxAmount: true,
            fixedRoiPercent: true,
            projectedRoiMin: true,
            projectedRoiMax: true,
            isActive: true,
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
      periods: ["SHORT_TERM", "MEDIUM_TERM", "LONG_TERM"].map((value) => ({
        value: value as InvestmentPeriod,
        label: formatEnumLabel(value),
      })),
    },
    plans: plans.map((plan) => {
      const tiers = plan.tiers.map((tier) => ({
        id: tier.id,
        level: tier.level,
        levelLabel: formatTierLevel(tier.level),
        minAmount: Number(tier.minAmount),
        maxAmount: Number(tier.maxAmount),
        fixedRoiPercent: tier.fixedRoiPercent
          ? Number(tier.fixedRoiPercent)
          : null,
        projectedRoiMin: tier.projectedRoiMin
          ? Number(tier.projectedRoiMin)
          : null,
        projectedRoiMax: tier.projectedRoiMax
          ? Number(tier.projectedRoiMax)
          : null,
        returnLabel: formatInvestmentTierReturnLabel({
          investmentModel: plan.investmentModel,
          fixedRoiPercent: tier.fixedRoiPercent
            ? Number(tier.fixedRoiPercent)
            : null,
          projectedRoiMin: tier.projectedRoiMin
            ? Number(tier.projectedRoiMin)
            : null,
          projectedRoiMax: tier.projectedRoiMax
            ? Number(tier.projectedRoiMax)
            : null,
        }),
        isActive: tier.isActive,
      }));
      const activeTiers = tiers.filter((tier) => tier.isActive);

      return {
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        investmentId: plan.investment.id,
        investmentName: plan.investment.name,
        period: plan.period,
        periodLabel: formatEnumLabel(plan.period),
        currency: plan.currency,
        isActive: plan.isActive,
        updatedAt: formatDateLabel(plan.updatedAt),
        tiersCount: activeTiers.length,
        tiersCountLabel:
          activeTiers.length === 1
            ? "1 tier option available"
            : `${activeTiers.length} tier options available`,
        tierRangeLabel:
          activeTiers.length > 0
            ? `${formatCurrency(
                Math.min(...activeTiers.map((tier) => tier.minAmount)),
                plan.currency,
              )} - ${formatCurrency(
                Math.max(...activeTiers.map((tier) => tier.maxAmount)),
                plan.currency,
              )}`
            : null,
        tiers,
      };
    }),
    investmentOptions,
  };
}
