"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

export async function withdrawFromSavings(accountId: string, amount: number) {
  const user = await getCurrentSessionUser();

  if (!user?.id) throw new Error("Unauthorized");

  const account = await prisma.savingsAccount.findFirst({
    where: {
      id: accountId,
      investorProfile: {
        userId: user.id,
      },
    },
    include: { savingsProduct: true },
  });

  if (!account) throw new Error("Account not found");

  if (!account.savingsProduct.allowsWithdrawals) {
    throw new Error("Withdrawals not allowed");
  }

  if (account.lockedUntil && new Date() < account.lockedUntil) {
    throw new Error("Funds are locked");
  }

  const balanceBefore = Number(account.balance);

  if (balanceBefore < amount) {
    throw new Error("Insufficient balance");
  }

  const balanceAfter = balanceBefore - amount;

  await prisma.$transaction([
    prisma.savingsAccount.update({
      where: { id: accountId },
      data: {
        balance: balanceAfter,
      },
    }),

    prisma.savingsTransaction.create({
      data: {
        savingsAccountId: accountId,
        type: "WITHDRAWAL",
        amount,
        currency: account.currency,
        balanceBefore,
        balanceAfter,
      },
    }),
  ]);

  return { success: true };
}
