import type { SavingsTransactionType } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export type TransactionType =
  | "INVESTMENT"
  | "WITHDRAWAL"
  | "EARNING"
  | "SAVINGS";

export type TransactionItem = {
  id: string;
  type: TransactionType;
  savingsType?: SavingsTransactionType;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;

  reference: string;
  planName?: string;
  description?: string;

  direction: "CREDIT" | "DEBIT";
};

export async function getUserTransactions(userId: string) {
  const profile = await prisma.investorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) return [];

  const [orders, withdrawals, earnings, savingsTransactions] = await Promise.all([
    prisma.investmentOrder.findMany({
      where: { investorProfileId: profile.id },
      include: {
        investmentPlan: {
          select: { name: true },
        },
      },
    }),

    prisma.withdrawalOrder.findMany({
      where: { investorProfileId: profile.id },
    }),

    prisma.investmentEarning.findMany({
      where: {
        investmentOrder: {
          investorProfileId: profile.id,
        },
      },
      include: {
        investmentOrder: {
          include: {
            investmentPlan: {
              select: { name: true },
            },
          },
        },
      },
    }),
    prisma.savingsTransaction.findMany({
      where: {
        savingsAccount: {
          investorProfileId: profile.id,
        },
      },
      include: {
        savingsAccount: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const investmentTx: TransactionItem[] = orders.map((order) => ({
    id: order.id,
    type: "INVESTMENT",
    amount: Number(order.amount),
    currency: order.currency,
    status: order.status,
    createdAt: order.createdAt,
    reference:
      order.paymentReference ?? `INV-${order.id.slice(0, 6).toUpperCase()}`,
    planName: order.investmentPlan?.name,
    description: `Investment into ${order.investmentPlan?.name ?? "plan"}`,
    direction: "DEBIT",
  }));

  const withdrawalTx: TransactionItem[] = withdrawals.map((w) => ({
    id: w.id,
    type: "WITHDRAWAL",
    amount: Number(w.amount),
    currency: w.currency,
    status: w.status,
    createdAt: w.createdAt,
    reference:
      w.reference ??
      w.externalReference ??
      `WDL-${w.id.slice(0, 6).toUpperCase()}`,
    description: "Withdrawal request",
    direction: "DEBIT",
  }));

  const earningTx: TransactionItem[] = earnings.map((e) => ({
    id: e.id,
    type: "EARNING",
    amount: Number(e.amount),
    currency: e.investmentOrder.currency,
    status: "COMPLETED",
    createdAt: e.date,
    reference: `ERN-${e.id.slice(0, 6).toUpperCase()}`,
    planName: e.investmentOrder?.investmentPlan?.name,
    description: "Investment profit",
    direction: "CREDIT",
  }));

  const savingsTx: TransactionItem[] = savingsTransactions.map((transaction) => {
    const direction =
      transaction.type === "WITHDRAWAL" || transaction.type === "FEE"
        ? "DEBIT"
        : "CREDIT";

    return {
      id: transaction.id,
      type: "SAVINGS",
      savingsType: transaction.type,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      status: "COMPLETED",
      createdAt: transaction.createdAt,
      reference:
        transaction.reference ??
        `SAV-${transaction.id.slice(0, 6).toUpperCase()}`,
      planName: transaction.savingsAccount.name,
      description: transaction.note ?? `Savings ${transaction.type.toLowerCase()}`,
      direction,
    };
  });

  const transactions = [
    ...investmentTx,
    ...withdrawalTx,
    ...earningTx,
    ...savingsTx,
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return transactions;
}
