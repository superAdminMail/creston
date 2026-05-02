import type {
  InvestmentCatalogStatus,
  InvestmentModel,
  InvestmentPeriod,
  InvestmentType,
  SavingsInterestFrequency,
} from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { decimalToNumber } from "@/lib/services/investment/decimal";

export type AdminSavingsProductItem = {
  id: string;
  name: string;
  description: string | null;
  interestRatePercent: number | null;
  interestPayoutFrequency: SavingsInterestFrequency | null;
  allowsWithdrawals: boolean;
  allowsDeposits: boolean;
  minBalance: number | null;
  maxBalance: number | null;
  currency: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  accountCount: number;
};

export type AdminInvestmentPlanItem = {
  id: string;
  name: string;
  description: string | null;
  investmentName: string;
  investmentType: InvestmentType;
  investmentModel: InvestmentModel;
  period: InvestmentPeriod;
  durationDays: number;
  expectedReturnMin: number | null;
  expectedReturnMax: number | null;
  allowWithdrawal: boolean;
  isLocked: boolean;
  currency: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  accountCount: number;
  orderCount: number;
};

export type AdminInvestmentProductItem = {
  id: string;
  name: string;
  slug: string;
  symbol: string | null;
  type: InvestmentType;
  status: InvestmentCatalogStatus;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  planCount: number;
};

export async function getAdminSavingsProducts(): Promise<
  AdminSavingsProductItem[]
> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const products = await prisma.savingsProduct.findMany({
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      name: true,
      description: true,
      interestRatePercent: true,
      interestPayoutFrequency: true,
      allowsWithdrawals: true,
      allowsDeposits: true,
      minBalance: true,
      maxBalance: true,
      currency: true,
      isActive: true,
      sortOrder: true,
      createdAt: true,
      _count: {
        select: {
          savingsAccounts: true,
        },
      },
    },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    interestRatePercent: product.interestRatePercent
      ? decimalToNumber(product.interestRatePercent)
      : null,
    interestPayoutFrequency: product.interestPayoutFrequency,
    allowsWithdrawals: product.allowsWithdrawals,
    allowsDeposits: product.allowsDeposits,
    minBalance: product.minBalance ? decimalToNumber(product.minBalance) : null,
    maxBalance: product.maxBalance ? decimalToNumber(product.maxBalance) : null,
    currency: product.currency,
    isActive: product.isActive,
    sortOrder: product.sortOrder,
    createdAt: product.createdAt.toISOString(),
    accountCount: product._count.savingsAccounts,
  }));
}

export async function getAdminInvestmentPlans(): Promise<
  AdminInvestmentPlanItem[]
> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const plans = await prisma.investmentPlan.findMany({
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      name: true,
      description: true,
      investmentModel: true,
      period: true,
      durationDays: true,
      expectedReturnMin: true,
      expectedReturnMax: true,
      allowWithdrawal: true,
      isLocked: true,
      currency: true,
      isActive: true,
      sortOrder: true,
      createdAt: true,
      investment: {
        select: {
          name: true,
          type: true,
        },
      },
      _count: {
        select: {
          investmentAccounts: true,
          investmentOrders: true,
        },
      },
    },
  });

  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    investmentName: plan.investment.name,
    investmentType: plan.investment.type,
    investmentModel: plan.investmentModel,
    period: plan.period,
      durationDays: plan.durationDays,
      expectedReturnMin: plan.expectedReturnMin
        ? decimalToNumber(plan.expectedReturnMin)
        : null,
      expectedReturnMax: plan.expectedReturnMax
        ? decimalToNumber(plan.expectedReturnMax)
        : null,
    allowWithdrawal: plan.allowWithdrawal,
    isLocked: plan.isLocked,
    currency: plan.currency,
    isActive: plan.isActive,
    sortOrder: plan.sortOrder,
    createdAt: plan.createdAt.toISOString(),
    accountCount: plan._count.investmentAccounts,
    orderCount: plan._count.investmentOrders,
  }));
}

export async function getAdminInvestmentProducts(): Promise<
  AdminInvestmentProductItem[]
> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const products = await prisma.investment.findMany({
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      name: true,
      slug: true,
      symbol: true,
      type: true,
      status: true,
      isActive: true,
      sortOrder: true,
      createdAt: true,
      _count: {
        select: {
          investmentPlans: true,
        },
      },
    },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    symbol: product.symbol,
    type: product.type,
    status: product.status,
    isActive: product.isActive,
    sortOrder: product.sortOrder,
    createdAt: product.createdAt.toISOString(),
    planCount: product._count.investmentPlans,
  }));
}
