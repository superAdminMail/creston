"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

export async function depositToSavings(accountId: string, amount: number) {
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

  if (!account.savingsProduct.allowsDeposits) {
    throw new Error("Deposits not allowed");
  }

  const balanceBefore = Number(account.balance);
  const balanceAfter = balanceBefore + amount;

  if (
    account.savingsProduct.maxBalance &&
    balanceAfter > Number(account.savingsProduct.maxBalance)
  ) {
    throw new Error("Exceeds max balance");
  }

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
        type: "DEPOSIT",
        amount,
        currency: account.currency,
        balanceBefore,
        balanceAfter,
      },
    }),
  ]);

  return { success: true };
}
