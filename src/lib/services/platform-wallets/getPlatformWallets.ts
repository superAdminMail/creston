import { cache } from "react";

import { prisma } from "@/lib/prisma";

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
      currency: true,
      country: true,
      instructions: true,
      notes: true,
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
