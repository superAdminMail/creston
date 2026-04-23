"use server";

import { Prisma, type SavingsStatus } from "@/generated/prisma";
import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { prisma } from "@/lib/prisma";

type Decimalish = {
  toNumber(): number;
};

const savingsAccountDetailsSelect =
  Prisma.validator<Prisma.SavingsAccountSelect>()({
    id: true,
    name: true,
    description: true,
    status: true,
    balance: true,
    targetAmount: true,
    currency: true,
    isLocked: true,
    lockedUntil: true,
    createdAt: true,
    updatedAt: true,
    investorProfileId: true,
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
        id: true,
        name: true,
        description: true,
        interestEnabled: true,
        interestRatePercent: true,
        interestPayoutFrequency: true,
        isLockable: true,
        minimumLockDays: true,
        maximumLockDays: true,
        allowsWithdrawals: true,
        allowsDeposits: true,
        minBalance: true,
        maxBalance: true,
        currency: true,
        isActive: true,
      },
    },
    savingsFundingIntents: {
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        fundingMethodType: true,
        targetAmount: true,
        creditedAmount: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    transactions: {
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        type: true,
        amount: true,
        balanceBefore: true,
        balanceAfter: true,
        reference: true,
        note: true,
        createdAt: true,
      },
    },
    _count: {
      select: {
        transactions: true,
        savingsFundingIntents: true,
      },
    },
  });

type SavingsAccountDetailsRecord = Prisma.SavingsAccountGetPayload<{
  select: typeof savingsAccountDetailsSelect;
}>;

export type SuperAdminSavingsAccountDetailsViewModel = {
  id: string;
  title: string;
  subtitle: string;
  status: SavingsStatus;
  statusLabel: string;
  balance: number;
  currency: string;
  targetAmount: number | null;
  targetAmountLabel: string;
  isLocked: boolean;
  lockedUntilLabel: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    name: string;
    email: string;
  };
  product: {
    id: string;
    name: string;
    description: string;
    interestEnabled: boolean;
    interestRatePercent: number | null;
    interestPayoutFrequency: string | null;
    interestRateLabel: string;
    isLockable: boolean;
    minimumLockDays: number | null;
    maximumLockDays: number | null;
    allowsWithdrawals: boolean;
    allowsDeposits: boolean;
    minBalance: number | null;
    maxBalance: number | null;
    currency: string;
    isActive: boolean;
  };
  meta: {
    investorProfileId: string;
    createdAtRaw: Date;
    updatedAtRaw: Date;
    lockedUntilRaw: Date | null;
  };
  counts: {
    transactions: number;
    fundingIntents: number;
  };
  recentFundingIntents: Array<{
    id: string;
    status: string;
    fundingMethodType: string;
    targetAmount: number;
    creditedAmount: number;
    createdAt: string;
    updatedAt: string;
  }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reference: string;
    note: string;
    createdAt: string;
  }>;
  formDefaults: {
    name: string;
    description: string;
    targetAmount: string;
    status: SavingsStatus;
    isLocked: boolean;
    lockedUntil: string;
  };
};

function toNumber(value: Decimalish | number | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return value.toNumber();
}

function mapSavingsAccountDetails(
  account: NonNullable<SavingsAccountDetailsRecord>,
): SuperAdminSavingsAccountDetailsViewModel {
  const balance = toNumber(account.balance);
  const targetAmount = account.targetAmount ? toNumber(account.targetAmount) : null;
  const interestRatePercent = account.savingsProduct.interestRatePercent
    ? toNumber(account.savingsProduct.interestRatePercent)
    : null;
  const minimumLockDays = account.savingsProduct.minimumLockDays ?? null;
  const maximumLockDays = account.savingsProduct.maximumLockDays ?? null;

  return {
    id: account.id,
    title: account.name,
    subtitle: "Super-admin savings account",
    status: account.status,
    statusLabel: formatEnumLabel(account.status),
    balance,
    currency: account.currency,
    targetAmount,
    targetAmountLabel:
      targetAmount !== null
        ? formatCurrency(targetAmount, account.currency)
        : "No target amount",
    isLocked: account.isLocked,
    lockedUntilLabel: formatDateLabel(account.lockedUntil, "Not locked"),
    createdAt: formatDateLabel(account.createdAt),
    updatedAt: formatDateLabel(account.updatedAt),
    owner: {
      name: account.investorProfile.user.name?.trim() || "Unnamed investor",
      email: account.investorProfile.user.email,
    },
    product: {
      id: account.savingsProduct.id,
      name: account.savingsProduct.name,
      description:
        account.savingsProduct.description?.trim() ||
        "Configured savings product.",
      interestEnabled: account.savingsProduct.interestEnabled,
      interestRatePercent,
      interestPayoutFrequency: account.savingsProduct.interestPayoutFrequency,
      interestRateLabel:
        interestRatePercent !== null
          ? `${interestRatePercent.toFixed(2)}%`
          : "Not set",
      isLockable: account.savingsProduct.isLockable,
      minimumLockDays,
      maximumLockDays,
      allowsWithdrawals: account.savingsProduct.allowsWithdrawals,
      allowsDeposits: account.savingsProduct.allowsDeposits,
      minBalance: account.savingsProduct.minBalance
        ? toNumber(account.savingsProduct.minBalance)
        : null,
      maxBalance: account.savingsProduct.maxBalance
        ? toNumber(account.savingsProduct.maxBalance)
        : null,
      currency: account.savingsProduct.currency,
      isActive: account.savingsProduct.isActive,
    },
    meta: {
      investorProfileId: account.investorProfileId,
      createdAtRaw: account.createdAt,
      updatedAtRaw: account.updatedAt,
      lockedUntilRaw: account.lockedUntil,
    },
    counts: {
      transactions: account._count.transactions,
      fundingIntents: account._count.savingsFundingIntents,
    },
    recentFundingIntents: account.savingsFundingIntents.map((intent) => ({
      id: intent.id,
      status: intent.status,
      fundingMethodType: intent.fundingMethodType,
      targetAmount: toNumber(intent.targetAmount),
      creditedAmount: toNumber(intent.creditedAmount),
      createdAt: formatDateLabel(intent.createdAt),
      updatedAt: formatDateLabel(intent.updatedAt),
    })),
    recentTransactions: account.transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: toNumber(transaction.amount),
      balanceBefore: toNumber(transaction.balanceBefore),
      balanceAfter: toNumber(transaction.balanceAfter),
      reference: transaction.reference?.trim() || "Not set",
      note: transaction.note?.trim() || "No note",
      createdAt: formatDateLabel(transaction.createdAt),
    })),
    formDefaults: {
      name: account.name,
      description: account.description ?? "",
      targetAmount: targetAmount !== null ? targetAmount.toFixed(2) : "",
      status: account.status,
      isLocked: account.isLocked,
      lockedUntil: account.lockedUntil
        ? account.lockedUntil.toISOString().slice(0, 16)
        : "",
    },
  };
}

export async function getSuperAdminSavingsAccountById(
  savingsAccountId: string,
): Promise<SuperAdminSavingsAccountDetailsViewModel | null> {
  await requireSuperAdminAccess();

  const account = await prisma.savingsAccount.findUnique({
    where: { id: savingsAccountId },
    select: savingsAccountDetailsSelect,
  });

  if (!account) {
    return null;
  }

  return mapSavingsAccountDetails(account);
}
