"use server";

import { KycStatus } from "@/generated/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type SavingsAccountViewModel = {
  id: string;
  name: string;
  description: string | null;
  balance: number;
  currency: string;
  targetAmount: number | null;
  status: string;
  isLocked: boolean;
  lockedUntil: Date | null;
  createdAt: Date;
  latestFundingIntentStatus: string | null;
  product: {
    id: string;
    name: string;
    description: string | null;
    interestEnabled: boolean;
    interestRatePercent: number | null;
    interestPayoutFrequency: string | null;
    allowsDeposits: boolean;
    allowsWithdrawals: boolean;
    isLockable: boolean;
  };
};

type SavingsProductOption = {
  id: string;
  name: string;
  description: string | null;
  interestEnabled: boolean;
  interestRatePercent: number | null;
  interestPayoutFrequency: string | null;
  isLockable: boolean;
  minimumLockDays: number | null;
  maximumLockDays: number | null;
  allowsWithdrawals: boolean;
  allowsDeposits: boolean;
  minBalance: number | null;
  maxBalance: number | null;
  currency: string;
};

export type SavingsPageData = {
  userName: string | null;
  kycStatus: KycStatus | null;
  canCreateSavingsAccount: boolean;
  accounts: SavingsAccountViewModel[];
  products: SavingsProductOption[];
};

export async function getSavingsPageData(): Promise<SavingsPageData> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    redirect("/auth/login");
  }

  const [profile, products] = await Promise.all([
    prisma.investorProfile.findUnique({
      where: { userId: user.id },
      select: {
        kycStatus: true,
        savingsAccounts: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            description: true,
            balance: true,
            currency: true,
            targetAmount: true,
            status: true,
            isLocked: true,
            lockedUntil: true,
            createdAt: true,
            savingsFundingIntents: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                status: true,
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
                allowsDeposits: true,
                allowsWithdrawals: true,
                isLockable: true,
              },
            },
          },
        },
      },
    }),
    prisma.savingsProduct.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
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
      },
    }),
  ]);

  return {
    userName: user.name,
    kycStatus: profile?.kycStatus ?? null,
    canCreateSavingsAccount: profile?.kycStatus === KycStatus.VERIFIED,
    accounts:
      profile?.savingsAccounts.map((account) => ({
        id: account.id,
        name: account.name,
        description: account.description,
        balance: Number(account.balance),
        currency: account.currency,
        targetAmount: account.targetAmount
          ? Number(account.targetAmount)
          : null,
        status: account.status,
        isLocked: account.isLocked,
        lockedUntil: account.lockedUntil,
        createdAt: account.createdAt,
        latestFundingIntentStatus:
          account.savingsFundingIntents[0]?.status ?? null,
        product: {
          id: account.savingsProduct.id,
          name: account.savingsProduct.name,
          description: account.savingsProduct.description,
          interestEnabled: account.savingsProduct.interestEnabled,
          interestRatePercent: account.savingsProduct.interestRatePercent
            ? Number(account.savingsProduct.interestRatePercent)
            : null,
          interestPayoutFrequency:
            account.savingsProduct.interestPayoutFrequency,
          allowsDeposits: account.savingsProduct.allowsDeposits,
          allowsWithdrawals: account.savingsProduct.allowsWithdrawals,
          isLockable: account.savingsProduct.isLockable,
        },
      })) ?? [],
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      interestEnabled: product.interestEnabled,
      interestRatePercent: product.interestRatePercent
        ? Number(product.interestRatePercent)
        : null,
      interestPayoutFrequency: product.interestPayoutFrequency,
      isLockable: product.isLockable,
      minimumLockDays: product.minimumLockDays,
      maximumLockDays: product.maximumLockDays,
      allowsWithdrawals: product.allowsWithdrawals,
      allowsDeposits: product.allowsDeposits,
      minBalance: product.minBalance ? Number(product.minBalance) : null,
      maxBalance: product.maxBalance ? Number(product.maxBalance) : null,
      currency: product.currency,
    })),
  };
}
