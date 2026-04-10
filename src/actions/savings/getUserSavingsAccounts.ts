"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

export async function getUserSavingsAccounts() {
  const user = await getCurrentSessionUser();

  if (!user?.id) throw new Error("Unauthorized");

  const profile = await prisma.investorProfile.findUnique({
    where: { userId: user.id },
    include: {
      savingsAccounts: {
        include: {
          savingsProduct: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return (
    profile?.savingsAccounts.map((acc) => ({
      id: acc.id,
      name: acc.name,
      balance: Number(acc.balance),
      currency: acc.currency,
      productName: acc.savingsProduct.name,
      interestEnabled: acc.savingsProduct.interestEnabled,
      createdAt: acc.createdAt,
    })) ?? []
  );
}
