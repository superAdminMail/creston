import { cache } from "react";

import { prisma } from "@/lib/prisma";

type PublicPlatformPaymentMethodType = "BANK_INFO" | "WALLET_ADDRESS";

export const getPlatformPaymentMethods = cache(async () => {
  return prisma.platformPaymentMethod.findMany({
    orderBy: [
      { isDefault: "desc" },
      { isActive: "desc" },
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      label: true,
      type: true,
      providerName: true,
      accountName: true,
      reference: true,
      bankAddress: true,
      currency: true,
      country: true,
      instructions: true,
      notes: true,
      isPrivate: true,
      isActive: true,
      isDefault: true,
      sortOrder: true,
      verificationStatus: true,
      bankName: true,
      bankCode: true,
      accountNumber: true,
      iban: true,
      swiftCode: true,
      routingNumber: true,
      branchName: true,
      cryptoAsset: true,
      cryptoNetwork: true,
      walletAddress: true,
      walletTag: true,
      createdAt: true,
    },
  });
});

export const getPublicPlatformPaymentMethods = cache(async () => {
  return prisma.platformPaymentMethod.findMany({
    where: {
      isActive: true,
      isPrivate: false,
    },
    orderBy: [
      { isDefault: "desc" },
      { isActive: "desc" },
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      label: true,
      type: true,
      providerName: true,
      accountName: true,
      reference: true,
      bankAddress: true,
      currency: true,
      country: true,
      instructions: true,
      notes: true,
      isPrivate: true,
      isActive: true,
      isDefault: true,
      sortOrder: true,
      verificationStatus: true,
      bankName: true,
      bankCode: true,
      accountNumber: true,
      iban: true,
      swiftCode: true,
      routingNumber: true,
      branchName: true,
      cryptoAsset: true,
      cryptoNetwork: true,
      walletAddress: true,
      walletTag: true,
      createdAt: true,
    },
  });
});

export const getPlatformWallets = getPlatformPaymentMethods;

export async function getPublicPlatformPaymentMethodForCheckout({
  currency,
  preferredType = "BANK_INFO",
}: {
  currency?: string | null;
  preferredType?: PublicPlatformPaymentMethodType;
}) {
  const publicPaymentMethods = await getPublicPlatformPaymentMethods();

  const findByType = (type: PublicPlatformPaymentMethodType) =>
    publicPaymentMethods.find(
      (method) =>
        method.type === type &&
        (method.currency === currency || method.currency === null),
    ) ?? null;

  return (
    findByType(preferredType) ??
    findByType("BANK_INFO") ??
    findByType("WALLET_ADDRESS")
  );
}
