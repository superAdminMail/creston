"use server";

import { Prisma } from "@/generated/prisma";
import { formatCurrency, formatEnumLabel } from "@/lib/formatters/formatters";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import type {
  AdminAdjustmentAccountOption,
  AdminAdjustmentPageData,
} from "@/lib/types/adminAdjustments";

const investmentAccountSelect =
  Prisma.validator<Prisma.InvestmentAccountSelect>()({
    id: true,
    balance: true,
    currency: true,
    status: true,
    updatedAt: true,
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
      },
    },
  });

const savingsAccountSelect =
  Prisma.validator<Prisma.SavingsAccountSelect>()({
    id: true,
    balance: true,
    currency: true,
    status: true,
    updatedAt: true,
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
      },
    },
  });

function mapInvestmentAccount(
  account: Prisma.InvestmentAccountGetPayload<{
    select: typeof investmentAccountSelect;
  }>,
): AdminAdjustmentAccountOption {
  const ownerName = account.investorProfile.user.name?.trim() || "Unnamed user";
  const ownerEmail = account.investorProfile.user.email;
  const balance = decimalToNumber(account.balance);
  const currency = account.currency;

  return {
    id: account.id,
    accountType: "INVESTMENT_ACCOUNT",
    title: `${ownerName} · ${account.investmentPlan.name}`,
    subtitle: ownerEmail,
    meta: `${formatCurrency(balance, currency)} · ${formatEnumLabel(account.status)}`,
    balance,
    currency,
    status: account.status,
    ownerName,
    ownerEmail,
    updatedAt: account.updatedAt.toISOString(),
  };
}

function mapSavingsAccount(
  account: Prisma.SavingsAccountGetPayload<{
    select: typeof savingsAccountSelect;
  }>,
): AdminAdjustmentAccountOption {
  const ownerName = account.investorProfile.user.name?.trim() || "Unnamed user";
  const ownerEmail = account.investorProfile.user.email;
  const balance = decimalToNumber(account.balance);
  const currency = account.currency;

  return {
    id: account.id,
    accountType: "SAVINGS_ACCOUNT",
    title: `${ownerName} · ${account.savingsProduct.name}`,
    subtitle: ownerEmail,
    meta: `${formatCurrency(balance, currency)} · ${formatEnumLabel(account.status)}`,
    balance,
    currency,
    status: account.status,
    ownerName,
    ownerEmail,
    updatedAt: account.updatedAt.toISOString(),
  };
}

export async function getAdminAdjustmentPageData(): Promise<AdminAdjustmentPageData> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const [investmentAccounts, savingsAccounts] = await Promise.all([
    prisma.investmentAccount.findMany({
      where: {
        status: {
          not: "CLOSED",
        },
      },
      select: investmentAccountSelect,
      orderBy: {
        updatedAt: "desc",
      },
      take: 200,
    }),
    prisma.savingsAccount.findMany({
      where: {
        status: {
          not: "CLOSED",
        },
      },
      select: savingsAccountSelect,
      orderBy: {
        updatedAt: "desc",
      },
      take: 200,
    }),
  ]);

  const accounts = [
    ...investmentAccounts.map(mapInvestmentAccount),
    ...savingsAccounts.map(mapSavingsAccount),
  ].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  const defaultAccount =
    accounts.find((account) => account.accountType === "INVESTMENT_ACCOUNT") ??
    accounts[0] ??
    null;

  return {
    accounts,
    defaultAccountType: defaultAccount?.accountType ?? null,
    defaultAccountId: defaultAccount?.id ?? null,
    stats: {
      totalAccounts: accounts.length,
      investmentAccounts: investmentAccounts.length,
      savingsAccounts: savingsAccounts.length,
    },
  };
}
