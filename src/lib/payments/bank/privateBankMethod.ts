import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export type PrivateBankMethod = {
  id: string;
  label: string;
  type: string;
  providerName: string | null;
  bankName: string | null;
  bankCode: string | null;
  accountName: string | null;
  reference: string | null;
  bankAddress: string | null;
  accountNumber: string | null;
  iban: string | null;
  swiftCode: string | null;
  routingNumber: string | null;
  branchName: string | null;
  country: string | null;
  instructions: string | null;
  notes: string | null;
  isPrivate: boolean;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  verificationStatus: string;
  cryptoAsset: string | null;
  cryptoNetwork: string | null;
  walletAddress: string | null;
  walletTag: string | null;
  currency: string | null;
};

export const privateBankMethodSelect = {
  id: true,
  label: true,
  type: true,
  providerName: true,
  bankName: true,
  bankCode: true,
  accountName: true,
  reference: true,
  bankAddress: true,
  accountNumber: true,
  iban: true,
  swiftCode: true,
  routingNumber: true,
  branchName: true,
  country: true,
  instructions: true,
  notes: true,
  isPrivate: true,
  isActive: true,
  isDefault: true,
  sortOrder: true,
  verificationStatus: true,
  cryptoAsset: true,
  cryptoNetwork: true,
  walletAddress: true,
  walletTag: true,
  currency: true,
} satisfies Prisma.PlatformPaymentMethodSelect;

export async function resolvePrivateBankMethodById(
  platformPaymentMethodId: string,
  currency?: string | null,
): Promise<PrivateBankMethod | null> {
  const currencyFilter = currency
    ? [{ currency }, { currency: null }]
    : undefined;

  const paymentMethod = await prisma.platformPaymentMethod.findFirst({
    where: {
      id: platformPaymentMethodId,
      isActive: true,
      isPrivate: true,
      type: "BANK_INFO",
      ...(currencyFilter ? { OR: currencyFilter } : {}),
    },
    select: privateBankMethodSelect,
  });

  return paymentMethod ?? null;
}
