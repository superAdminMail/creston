import type { SavingsTransactionType } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";

export type TransactionType =
  | "INVESTMENT"
  | "WITHDRAWAL"
  | "EARNING"
  | "ADJUSTMENT"
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

type AdjustmentTransactionItem = Omit<TransactionItem, "type"> & {
  type: "ADJUSTMENT";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseInvestmentOrderAdjustmentRecord(adjustment: {
  id: string;
  reference: string;
  direction: "ADD" | "DEDUCT";
  amount: unknown;
  currency: string;
  reason: string | null;
  createdAt: Date;
  investmentOrder: {
    id: string;
    investmentPlan: {
      name: string;
    } | null;
  };
}): AdjustmentTransactionItem | null {
  const amount = Number(adjustment.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return {
    id: adjustment.id,
    type: "ADJUSTMENT",
    amount,
    currency: adjustment.currency,
    status: "COMPLETED",
    createdAt: adjustment.createdAt,
    reference: adjustment.reference,
    planName: adjustment.investmentOrder.investmentPlan?.name ?? undefined,
    description: adjustment.reason ?? "Manual investment earnings adjustment",
    direction: adjustment.direction === "DEDUCT" ? "DEBIT" : "CREDIT",
  };
}

function parseLegacyAdjustmentMetadata(order: {
  id: string;
  currency: string;
  updatedAt: Date;
  paymentMetadata: unknown;
  investmentPlan?: { name: string } | null;
}): Array<AdjustmentTransactionItem | null> {
  const metadata = isRecord(order.paymentMetadata)
    ? order.paymentMetadata
    : {};
  const adjustments = Array.isArray(metadata.adjustments)
    ? metadata.adjustments
    : [];

  return adjustments
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .filter(
      (item) =>
        item.kind === "EARNINGS_ADJUSTMENT" ||
        item.kind === "BALANCE_ADJUSTMENT",
    )
    .map((item) => {
      const amount = Number(item.amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        return null;
      }

      const createdAt =
        typeof item.adjustedAt === "string"
          ? new Date(item.adjustedAt)
          : order.updatedAt;

      if (Number.isNaN(createdAt.getTime())) {
        return null;
      }

      const reference =
        typeof item.adjustmentId === "string" && item.adjustmentId.trim()
          ? item.adjustmentId
          : `ADJ-${order.id.slice(0, 6).toUpperCase()}`;

      return {
        id: `${order.id}:${reference}`,
        type: "ADJUSTMENT" as const,
        amount,
        currency:
          typeof item.currency === "string" && item.currency.trim()
            ? item.currency
            : order.currency,
        status: "COMPLETED",
        createdAt,
        reference,
        planName:
          typeof item.investmentPlanName === "string" &&
          item.investmentPlanName.trim()
            ? item.investmentPlanName
            : order.investmentPlan?.name ?? undefined,
        description: "Manual investment earnings adjustment",
        direction: item.direction === "DEDUCT" ? "DEBIT" : "CREDIT",
      } as AdjustmentTransactionItem;
    })
    .filter((item): item is AdjustmentTransactionItem => item !== null);
}

function parseInvestmentOrderAdjustmentMetadata(order: {
  id: string;
  currency: string;
  updatedAt: Date;
  paymentMetadata: unknown;
  investmentPlan?: { name: string } | null;
}): Array<AdjustmentTransactionItem | null> {
  return parseLegacyAdjustmentMetadata(order);
}

export async function getAdminTransactions() {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const [orders, investmentAdjustments, withdrawals, earnings, savingsTransactions] =
    await Promise.all([
      prisma.investmentOrder.findMany({
        include: {
          investmentPlan: {
            select: { name: true },
          },
        },
      }),
      prisma.investmentOrderAdjustment.findMany({
        select: {
          id: true,
          reference: true,
          direction: true,
          amount: true,
          currency: true,
          reason: true,
          createdAt: true,
          investmentOrder: {
            select: {
              id: true,
              investmentPlan: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.withdrawalOrder.findMany({}),
      prisma.investmentEarning.findMany({
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

  const investmentAdjustmentTx: AdjustmentTransactionItem[] = [
    ...orders.flatMap((order) => parseLegacyAdjustmentMetadata(order)),
    ...orders.flatMap((order) => parseInvestmentOrderAdjustmentMetadata(order)),
  ].filter((item): item is AdjustmentTransactionItem => item !== null);

  const investmentAdjustmentLedgerTx: AdjustmentTransactionItem[] =
    investmentAdjustments
      .map(parseInvestmentOrderAdjustmentRecord)
      .filter((item): item is AdjustmentTransactionItem => item !== null);

  const withdrawalTx: TransactionItem[] = withdrawals.map((w) => ({
    id: w.id,
    type: "WITHDRAWAL",
    amount: Number(w.amount),
    currency: w.currency,
    status: w.status,
    createdAt: w.createdAt,
    reference:
      w.reference ?? w.externalReference ?? `WDL-${w.id.slice(0, 6).toUpperCase()}`,
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
    ...investmentAdjustmentTx,
    ...investmentAdjustmentLedgerTx,
    ...withdrawalTx,
    ...earningTx,
    ...savingsTx,
  ]
    .filter(
      (transaction, index, array) =>
        index ===
        array.findIndex(
          (candidate) =>
            candidate.type === transaction.type &&
            candidate.reference === transaction.reference &&
            candidate.createdAt.getTime() === transaction.createdAt.getTime(),
        ),
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return transactions;
}
