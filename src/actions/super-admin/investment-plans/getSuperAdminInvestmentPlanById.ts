import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { formatCurrency, formatDateLabel, formatEnumLabel } from "@/lib/formatters/formatters";
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
  category: string;
  categoryLabel: string;
  period: string;
  periodLabel: string;
  minAmount: number;
  maxAmount: number;
  minAmountLabel: string;
  maxAmountLabel: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  formDefaults: {
    investmentId: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    period: string;
    minAmount: string;
    maxAmount: string;
    currency: string;
    isActive: boolean;
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
        category: true,
        period: true,
        minAmount: true,
        maxAmount: true,
        currency: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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

  return {
    id: plan.id,
    investmentId: plan.investmentId,
    investmentName: plan.investment.name,
    name: plan.name,
    slug: plan.slug,
    description: plan.description?.trim() || "No description provided.",
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
    createdAt: formatDateLabel(plan.createdAt),
    updatedAt: formatDateLabel(plan.updatedAt),
    formDefaults: {
      investmentId: plan.investmentId,
      name: plan.name,
      slug: plan.slug,
      description: plan.description ?? "",
      category: plan.category,
      period: plan.period,
      minAmount: Number(plan.minAmount).toFixed(2),
      maxAmount: Number(plan.maxAmount).toFixed(2),
      currency: plan.currency,
      isActive: plan.isActive,
    },
    investmentOptions: planData.investmentOptions,
  };
}
