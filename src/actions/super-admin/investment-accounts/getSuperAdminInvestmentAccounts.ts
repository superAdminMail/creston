"use server";

import { type AccountStatus } from "@/generated/prisma";
import {
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { prisma } from "@/lib/prisma";

type Decimalish = {
  toNumber(): number;
};

function toNumber(value: Decimalish | number | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return value.toNumber();
}

export type SuperAdminInvestmentAccountListItem = {
  id: string;
  status: AccountStatus;
  statusLabel: string;
  balance: number;
  currency: string;
  planName: string;
  planDescription: string;
  planPeriodLabel: string;
  investmentModelLabel: string;
  investmentName: string;
  investmentTypeLabel: string;
  orderCount: number;
  openedDate: string;
  createdDate: string;
  updatedDate: string;
  ownerName: string;
  ownerEmail: string;
};

export type SuperAdminInvestmentAccountsPageData = {
  totalAccountsCount: number;
  activeAccountsCount: number;
  pendingAccountsCount: number;
  totalBalance: number;
  marketAccountsCount: number;
  fixedAccountsCount: number;
  accounts: SuperAdminInvestmentAccountListItem[];
};

export async function getSuperAdminInvestmentAccounts(): Promise<SuperAdminInvestmentAccountsPageData> {
  await requireSuperAdminAccess();

  const accounts = await prisma.investmentAccount.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      status: true,
      balance: true,
      openedAt: true,
      createdAt: true,
      updatedAt: true,
      currency: true,
      investmentOrders: {
        select: {
          id: true,
        },
      },
      investorProfile: {
        select: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      investmentPlan: {
        select: {
          name: true,
          description: true,
          period: true,
          investmentModel: true,
          investment: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      },
    },
  });

  const mappedAccounts = accounts.map((account) => ({
    id: account.id,
    status: account.status,
    statusLabel: formatEnumLabel(account.status),
    balance: toNumber(account.balance),
    currency: account.currency || "USD",
    planName: account.investmentPlan.name,
    planDescription:
      account.investmentPlan.description?.trim() ||
      "Structured investment plan aligned to the platform catalog.",
    planPeriodLabel: formatEnumLabel(account.investmentPlan.period),
    investmentModelLabel: formatEnumLabel(
      account.investmentPlan.investmentModel,
    ),
    investmentName: account.investmentPlan.investment.name,
    investmentTypeLabel: formatEnumLabel(account.investmentPlan.investment.type),
    orderCount: account.investmentOrders.length,
    openedDate: formatDateLabel(account.openedAt, "Not opened yet"),
    createdDate: formatDateLabel(account.createdAt),
    updatedDate: formatDateLabel(account.updatedAt),
    ownerName: account.investorProfile.user.name?.trim() || "Unnamed investor",
    ownerEmail: account.investorProfile.user.email,
  }));

  const totalAccountsCount = mappedAccounts.length;
  const activeAccountsCount = mappedAccounts.filter(
    (account) => account.status === "ACTIVE",
  ).length;
  const pendingAccountsCount = mappedAccounts.filter(
    (account) => account.status === "PENDING",
  ).length;
  const totalBalance = mappedAccounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );
  const marketAccountsCount = mappedAccounts.filter(
    (account) => account.investmentModelLabel === "Market",
  ).length;
  const fixedAccountsCount = mappedAccounts.filter(
    (account) => account.investmentModelLabel === "Fixed",
  ).length;

  return {
    totalAccountsCount,
    activeAccountsCount,
    pendingAccountsCount,
    totalBalance,
    marketAccountsCount,
    fixedAccountsCount,
    accounts: mappedAccounts,
  };
}
