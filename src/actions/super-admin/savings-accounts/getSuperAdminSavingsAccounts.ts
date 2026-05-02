"use server";

import type { SavingsStatus } from "@/generated/prisma";
import {
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/services/investment/decimal";

export type SuperAdminSavingsAccountListItem = {
  id: string;
  name: string;
  description: string;
  status: SavingsStatus;
  statusLabel: string;
  balance: number;
  currency: string;
  targetAmount: number | null;
  isLocked: boolean;
  lockedUntil: string;
  latestFundingIntentStatus: string | null;
  transactionCount: number;
  ownerName: string;
  ownerEmail: string;
  productName: string;
  productDescription: string;
  productInterestEnabled: boolean;
  productAllowsDeposits: boolean;
  productAllowsWithdrawals: boolean;
  createdDate: string;
  updatedDate: string;
};

export type SuperAdminSavingsAccountsPageData = {
  totalAccountsCount: number;
  activeAccountsCount: number;
  lockedAccountsCount: number;
  targetLinkedAccountsCount: number;
  totalBalance: number;
  accounts: SuperAdminSavingsAccountListItem[];
};

export async function getSuperAdminSavingsAccounts(): Promise<SuperAdminSavingsAccountsPageData> {
  await requireSuperAdminAccess();

  const accounts = await prisma.savingsAccount.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      balance: true,
      currency: true,
      targetAmount: true,
      isLocked: true,
      lockedUntil: true,
      createdAt: true,
      updatedAt: true,
      savingsFundingIntents: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          status: true,
        },
      },
      _count: {
        select: {
          transactions: true,
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
      savingsProduct: {
        select: {
          name: true,
          description: true,
          interestEnabled: true,
          allowsDeposits: true,
          allowsWithdrawals: true,
        },
      },
    },
  });

  const mappedAccounts = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    description:
      account.description?.trim() ||
      "Savings account linked to a live savings product.",
    status: account.status,
    statusLabel: formatEnumLabel(account.status),
    balance: decimalToNumber(account.balance),
    currency: account.currency || "USD",
    targetAmount: account.targetAmount ? decimalToNumber(account.targetAmount) : null,
    isLocked: account.isLocked,
    lockedUntil: formatDateLabel(account.lockedUntil, "Not locked"),
    latestFundingIntentStatus:
      account.savingsFundingIntents[0]?.status ?? null,
    transactionCount: account._count.transactions,
    ownerName: account.investorProfile.user.name?.trim() || "Unnamed investor",
    ownerEmail: account.investorProfile.user.email,
    productName: account.savingsProduct.name,
    productDescription:
      account.savingsProduct.description?.trim() ||
      "Configured savings product.",
    productInterestEnabled: account.savingsProduct.interestEnabled,
    productAllowsDeposits: account.savingsProduct.allowsDeposits,
    productAllowsWithdrawals: account.savingsProduct.allowsWithdrawals,
    createdDate: formatDateLabel(account.createdAt),
    updatedDate: formatDateLabel(account.updatedAt),
  }));

  const summary = mappedAccounts.reduce(
    (acc, account) => {
      if (account.status === "ACTIVE") {
        acc.activeAccountsCount += 1;
      }

      if (account.isLocked) {
        acc.lockedAccountsCount += 1;
      }

      if (account.targetAmount !== null) {
        acc.targetLinkedAccountsCount += 1;
      }

      acc.totalBalance += account.balance;
      return acc;
    },
    {
      activeAccountsCount: 0,
      lockedAccountsCount: 0,
      targetLinkedAccountsCount: 0,
      totalBalance: 0,
    },
  );

  return {
    totalAccountsCount: mappedAccounts.length,
    activeAccountsCount: summary.activeAccountsCount,
    lockedAccountsCount: summary.lockedAccountsCount,
    targetLinkedAccountsCount: summary.targetLinkedAccountsCount,
    totalBalance: summary.totalBalance,
    accounts: mappedAccounts,
  };
}
