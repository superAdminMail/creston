"use server";

import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import type { SavingsInterestFrequency } from "@/generated/prisma";
import { decimalToNumber } from "@/lib/services/investment/decimal";

export type SuperAdminSavingsProductDetails = {
  id: string;
  name: string;
  description: string;
  interestEnabled: boolean;
  interestRatePercent: number | null;
  interestPayoutFrequency: SavingsInterestFrequency | null;
  isLockable: boolean;
  minimumLockDays: number | null;
  maximumLockDays: number | null;
  allowsWithdrawals: boolean;
  allowsDeposits: boolean;
  minBalance: number | null;
  maxBalance: number | null;
  currency: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  accountCount: number;
  formDefaults: {
    name: string;
    description: string;
    interestEnabled: boolean;
    interestRatePercent: string;
    interestPayoutFrequency: SavingsInterestFrequency | "";
    isLockable: boolean;
    minimumLockDays: string;
    maximumLockDays: string;
    allowsWithdrawals: boolean;
    allowsDeposits: boolean;
    minBalance: string;
    maxBalance: string;
    currency: string;
    isActive: boolean;
    sortOrder: string;
  };
  interestRateLabel: string;
  balanceRangeLabel: string;
  lockRangeLabel: string | null;
  frequencyLabel: string;
};

export async function getSuperAdminSavingsProductById(
  savingsProductId: string,
): Promise<SuperAdminSavingsProductDetails> {
  await requireSuperAdminAccess();

  const product = await prisma.savingsProduct.findUnique({
    where: { id: savingsProductId },
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
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          savingsAccounts: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const interestRatePercent = product.interestRatePercent
    ? decimalToNumber(product.interestRatePercent)
    : null;
  const minBalance = product.minBalance ? decimalToNumber(product.minBalance) : null;
  const maxBalance = product.maxBalance ? decimalToNumber(product.maxBalance) : null;
  const minimumLockDays = product.minimumLockDays ?? null;
  const maximumLockDays = product.maximumLockDays ?? null;

  return {
    id: product.id,
    name: product.name,
    description: product.description?.trim() || "No description provided.",
    interestEnabled: product.interestEnabled,
    interestRatePercent,
    interestPayoutFrequency: product.interestPayoutFrequency,
    isLockable: product.isLockable,
    minimumLockDays,
    maximumLockDays,
    allowsWithdrawals: product.allowsWithdrawals,
    allowsDeposits: product.allowsDeposits,
    minBalance,
    maxBalance,
    currency: product.currency,
    isActive: product.isActive,
    sortOrder: product.sortOrder,
    createdAt: formatDateLabel(product.createdAt),
    updatedAt: formatDateLabel(product.updatedAt),
    accountCount: product._count.savingsAccounts,
    formDefaults: {
      name: product.name,
      description: product.description ?? "",
      interestEnabled: product.interestEnabled,
      interestRatePercent: interestRatePercent
        ? interestRatePercent.toFixed(2)
        : "",
      interestPayoutFrequency: product.interestPayoutFrequency ?? "",
      isLockable: product.isLockable,
      minimumLockDays: minimumLockDays ? String(minimumLockDays) : "",
      maximumLockDays: maximumLockDays ? String(maximumLockDays) : "",
      allowsWithdrawals: product.allowsWithdrawals,
      allowsDeposits: product.allowsDeposits,
      minBalance: minBalance ? minBalance.toFixed(2) : "",
      maxBalance: maxBalance ? maxBalance.toFixed(2) : "",
      currency: product.currency,
      isActive: product.isActive,
      sortOrder: String(product.sortOrder),
    },
    interestRateLabel:
      interestRatePercent !== null
        ? `${interestRatePercent.toFixed(2)}%`
        : "Not set",
    balanceRangeLabel:
      minBalance !== null || maxBalance !== null
        ? `${minBalance !== null ? formatCurrency(minBalance, product.currency) : "No minimum"} - ${maxBalance !== null ? formatCurrency(maxBalance, product.currency) : "No maximum"}`
        : "No balance range configured",
    lockRangeLabel:
      product.isLockable && minimumLockDays !== null
        ? maximumLockDays !== null
          ? `${minimumLockDays} - ${maximumLockDays} days`
          : `${minimumLockDays} day minimum`
        : null,
    frequencyLabel: product.interestPayoutFrequency
      ? formatEnumLabel(product.interestPayoutFrequency)
      : "Not set",
  };
}
