"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

export async function getUserPaymentMethods() {
  const user = await getCurrentSessionUser();

  if (!user?.id) throw new Error("Unauthorized");

  const profile = await prisma.investorProfile.findUnique({
    where: { userId: user.id },
    include: {
      paymentMethods: true,
    },
  });

  return (
    profile?.paymentMethods.map((m) => ({
      id: m.id,
      type: m.type,
      isDefault: m.isDefault,
      bankName: m.bankName,
      accountName: m.accountName,
      accountNumber: m.accountNumber,
      network: m.network,
      address: m.address,
    })) ?? []
  );
}
