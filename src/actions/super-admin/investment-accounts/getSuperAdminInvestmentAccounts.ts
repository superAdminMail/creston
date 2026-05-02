"use server";

import { type AccountStatus } from "@/generated/prisma";
import {
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/services/investment/decimal";

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
    balance: decimalToNumber(account.balance),
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

  const summary = mappedAccounts.reduce(
    (acc, account) => {
      if (account.status === "ACTIVE") {
        acc.activeAccountsCount += 1;
      }

      if (account.status === "PENDING") {
        acc.pendingAccountsCount += 1;
      }

      if (account.investmentModelLabel === "Market") {
        acc.marketAccountsCount += 1;
      }

      if (account.investmentModelLabel === "Fixed") {
        acc.fixedAccountsCount += 1;
      }

      acc.totalBalance += account.balance;
      return acc;
    },
    {
      activeAccountsCount: 0,
      pendingAccountsCount: 0,
      marketAccountsCount: 0,
      fixedAccountsCount: 0,
      totalBalance: 0,
    },
  );

  return {
    totalAccountsCount: mappedAccounts.length,
    activeAccountsCount: summary.activeAccountsCount,
    pendingAccountsCount: summary.pendingAccountsCount,
    totalBalance: summary.totalBalance,
    marketAccountsCount: summary.marketAccountsCount,
    fixedAccountsCount: summary.fixedAccountsCount,
    accounts: mappedAccounts,
  };
}
