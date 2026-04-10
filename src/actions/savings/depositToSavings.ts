"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

export async function depositToSavings(accountId: string, amount: number) {
  const user = await getCurrentSessionUser();

  if (!user?.id) throw new Error("Unauthorized");

  const account = await prisma.savingsAccount.findUnique({
    where: { id: accountId },
    include: { savingsProduct: true },
  });

  if (!account) throw new Error("Account not found");

  if (!account.savingsProduct.allowsDeposits) {
    throw new Error("Deposits not allowed");
  }

  const newBalance = Number(account.balance) + amount;

  if (
    account.savingsProduct.maxBalance &&
    newBalance > Number(account.savingsProduct.maxBalance)
  ) {
    throw new Error("Exceeds max balance");
  }

  await prisma.$transaction([
    prisma.savingsAccount.update({
      where: { id: accountId },
      data: {
        balance: newBalance,
      },
    }),

    prisma.savingsTransaction.create({
      data: {
        savingsAccountId: accountId,
        type: "DEPOSIT",
        amount,
      },
    }),
  ]);

  return { success: true };
}
