import { notFound } from "next/navigation";
import type { InvestmentTierLevel } from "@/generated/prisma";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
  formatTierLevel,
} from "@/lib/formatters/formatters";
import {
  getSuperAdminInvestmentPlans,
  type SuperAdminInvestmentOption,
} from "./getSuperAdminInvestmentPlans";

export type SuperAdminInvestmentPlanDetails = {
  id: string;
  investmentId: string;
  investmentName: string;
  name: string;
  slug: string;
  description: string;
  period: string;
  periodLabel: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tiersCountLabel: string;
  tierRangeLabel: string | null;
  tiers: Array<{
    id: string;
    level: InvestmentTierLevel;
    levelLabel: string;
    minAmount: number;
    maxAmount: number;
    roiPercent: number;
    isActive: boolean;
    minAmountLabel: string;
    maxAmountLabel: string;
  }>;
  formDefaults: {
    investmentId: string;
    name: string;
    slug: string;
    description: string;
    period: string;
    currency: string;
    isActive: boolean;
    tiers: Array<{
      level: InvestmentTierLevel;
      minAmount: string;
      maxAmount: string;
      roiPercent: string;
      isActive: boolean;
    }>;
  };
  investmentOptions: SuperAdminInvestmentOption[];
};

export async function getSuperAdminInvestmentPlanById(
  investmentPlanId: string,
): Promise<SuperAdminInvestmentPlanDetails> {
  await requireSuperAdminAccess();

  const [plan, planData] = await Promise.all([
    prisma.investmentPlan.findUnique({
      where: { id: investmentPlanId },
      select: {
        id: true,
        investmentId: true,
        name: true,
        slug: true,
        description: true,
        period: true,
        currency: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        tiers: {
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
            name: true,
          },
        },
      },
    }),
    getSuperAdminInvestmentPlans(),
  ]);

  if (!plan) {
    notFound();
  }

  const tiers = plan.tiers.map((tier) => ({
    id: tier.id,
    level: tier.level,
    levelLabel: formatTierLevel(tier.level),
    minAmount: Number(tier.minAmount),
    maxAmount: Number(tier.maxAmount),
    roiPercent: Number(tier.roiPercent),
    isActive: tier.isActive,
    minAmountLabel: formatCurrency(Number(tier.minAmount), plan.currency),
    maxAmountLabel: formatCurrency(Number(tier.maxAmount), plan.currency),
  }));
  const activeTiers = tiers.filter((tier) => tier.isActive);

  return {
    id: plan.id,
    investmentId: plan.investmentId,
    investmentName: plan.investment.name,
    name: plan.name,
    slug: plan.slug,
    description: plan.description?.trim() || "No description provided.",
    period: plan.period,
    periodLabel: formatEnumLabel(plan.period),
    currency: plan.currency,
    isActive: plan.isActive,
    createdAt: formatDateLabel(plan.createdAt),
    updatedAt: formatDateLabel(plan.updatedAt),
    tiersCountLabel:
      activeTiers.length === 1
        ? "1 active tier"
        : `${activeTiers.length} active tiers`,
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
    formDefaults: {
      investmentId: plan.investmentId,
      name: plan.name,
      slug: plan.slug,
      description: plan.description ?? "",
      period: plan.period,
      currency: plan.currency,
      isActive: plan.isActive,
      tiers: (["CORE", "ADVANCED", "ELITE"] as const).map((level) => {
        const tier = plan.tiers.find((item) => item.level === level);

        return {
          level,
          minAmount: tier ? Number(tier.minAmount).toFixed(2) : "",
          maxAmount: tier ? Number(tier.maxAmount).toFixed(2) : "",
          roiPercent: tier ? Number(tier.roiPercent).toFixed(2) : "",
          isActive: tier?.isActive ?? false,
        };
      }),
    },
    investmentOptions: planData.investmentOptions,
  };
}
