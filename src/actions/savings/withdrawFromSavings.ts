"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

export async function withdrawFromSavings(accountId: string, amount: number) {
  const user = await getCurrentSessionUser();

  if (!user?.id) throw new Error("Unauthorized");

  const account = await prisma.savingsAccount.findUnique({
    where: { id: accountId },
    include: { savingsProduct: true },
  });

  if (!account) throw new Error("Account not found");

  if (!account.savingsProduct.allowsWithdrawals) {
    throw new Error("Withdrawals not allowed");
  }

  if (account.lockedUntil && new Date() < account.lockedUntil) {
    throw new Error("Funds are locked");
  }

  if (Number(account.balance) < amount) {
    throw new Error("Insufficient balance");
  }

  await prisma.$transaction([
    prisma.savingsAccount.update({
      where: { id: accountId },
      data: {
        balance: Number(account.balance) - amount,
      },
    }),

    prisma.savingsTransaction.create({
      data: {
        savingsAccountId: accountId,
        type: "WITHDRAWAL",
        amount,
      },
    }),
  ]);

  return { success: true };
}
