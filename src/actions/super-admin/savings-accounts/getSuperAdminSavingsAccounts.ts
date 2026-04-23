"use server";

import type { SavingsStatus } from "@/generated/prisma";
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
    balance: toNumber(account.balance),
    currency: account.currency || "USD",
    targetAmount: account.targetAmount ? toNumber(account.targetAmount) : null,
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

  return {
    totalAccountsCount: mappedAccounts.length,
    activeAccountsCount: mappedAccounts.filter(
      (account) => account.status === "ACTIVE",
    ).length,
    lockedAccountsCount: mappedAccounts.filter((account) => account.isLocked).length,
    targetLinkedAccountsCount: mappedAccounts.filter(
      (account) => account.targetAmount !== null,
    ).length,
    totalBalance: mappedAccounts.reduce((sum, account) => sum + account.balance, 0),
    accounts: mappedAccounts,
  };
}
