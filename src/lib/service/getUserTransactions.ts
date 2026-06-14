import type { SavingsTransactionType } from "@/generated/prisma";
import { asJsonObject } from "@/lib/payments/paymentJson";
import { prisma } from "@/lib/prisma";

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

function parseInvestmentOrderAdjustmentMetadata(order: {
  id: string;
  currency: string;
  updatedAt: Date;
  paymentMetadata: unknown;
}): Array<AdjustmentTransactionItem | null> {
  const metadata = asJsonObject(order.paymentMetadata);
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

      const direction: "CREDIT" | "DEBIT" =
        item.direction === "DEDUCT" ? "DEBIT" : "CREDIT";
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
            : undefined,
        description: "Manual investment earnings adjustment",
        direction,
      } as AdjustmentTransactionItem;
    })
    .filter((item): item is AdjustmentTransactionItem => item !== null);
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
    type: "ADJUSTMENT" as const,
    amount,
    currency: adjustment.currency,
    status: "COMPLETED",
    createdAt: adjustment.createdAt,
    reference: adjustment.reference,
    planName: adjustment.investmentOrder.investmentPlan?.name ?? undefined,
    description:
      adjustment.reason ?? "Manual investment earnings adjustment",
    direction: adjustment.direction === "DEDUCT" ? "DEBIT" : "CREDIT",
  } as AdjustmentTransactionItem;
}

function parseLegacyFixedProfitNotification(notification: {
  id: string;
  createdAt: Date;
  key: string | null;
  metadata: unknown;
}) {
  if (!isRecord(notification.metadata)) {
    return null;
  }

  if (notification.metadata.model !== "FIXED") {
    return null;
  }

  const amount = Number(notification.metadata.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const currency =
    typeof notification.metadata.currency === "string" &&
    notification.metadata.currency.trim()
      ? notification.metadata.currency
      : "USD";

  let investmentOrderId =
    typeof notification.metadata.investmentOrderId === "string"
      ? notification.metadata.investmentOrderId
      : null;

  let accruedUntilValue =
    typeof notification.metadata.accruedUntil === "string"
      ? notification.metadata.accruedUntil
      : null;

  if ((!investmentOrderId || !accruedUntilValue) && notification.key) {
    const keyPrefix = "fixed-profit:";

    if (notification.key.startsWith(keyPrefix)) {
      const keyPayload = notification.key.slice(keyPrefix.length);
      const separatorIndex = keyPayload.indexOf(":");

      if (separatorIndex > 0) {
        investmentOrderId ||= keyPayload.slice(0, separatorIndex);
        accruedUntilValue ||= keyPayload.slice(separatorIndex + 1);
      }
    }
  }

  const createdAt = accruedUntilValue
    ? new Date(accruedUntilValue)
    : notification.createdAt;

  if (Number.isNaN(createdAt.getTime())) {
    return null;
  }

  return {
    id: notification.id,
    amount,
    currency,
    investmentOrderId,
    createdAt,
    reference: `FIX-${notification.id.slice(0, 6).toUpperCase()}`,
  };
}

export async function getUserTransactions(userId: string) {
  const profile = await prisma.investorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) return [];

  const [
    orders,
    investmentAdjustments,
    withdrawals,
    earnings,
    legacyFixedProfitNotifications,
    savingsTransactions,
  ] =
    await Promise.all([
      prisma.investmentOrder.findMany({
        where: { investorProfileId: profile.id },
        include: {
          investmentPlan: {
            select: { name: true },
          },
        },
      }),
      prisma.investmentOrderAdjustment.findMany({
        where: {
          investmentOrder: {
            investorProfileId: profile.id,
          },
        },
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

      prisma.withdrawalOrder.findMany({
        where: { investorProfileId: profile.id },
      }),

      prisma.investmentEarning.findMany({
        where: {
          investmentOrder: {
            investorProfileId: profile.id,
          },
        },
        orderBy: {
          date: "desc",
        },
        include: {
          investmentOrder: {
            select: {
              id: true,
              currency: true,
              investmentModel: true,
              investmentPlan: {
                select: { name: true },
              },
            },
          },
        },
      }),

      prisma.notification.findMany({
        where: {
          userId,
          type: "INVESTMENT_ROI",
          key: {
            startsWith: "fixed-profit:",
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          createdAt: true,
          key: true,
          metadata: true,
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

  const earningTransactionKeys = new Set(
    earnings.map(
      (earning) => `${earning.investmentOrder.id}:${earning.date.toISOString()}`,
    ),
  );

  const orderPlanNamesById = new Map(
    orders.map((order) => [order.id, order.investmentPlan?.name ?? null]),
  );

  const legacyFixedProfitTx: TransactionItem[] = legacyFixedProfitNotifications
    .map(parseLegacyFixedProfitNotification)
    .filter(
      (
        item,
      ): item is {
        id: string;
        amount: number;
        currency: string;
        investmentOrderId: string | null;
        createdAt: Date;
        reference: string;
      } => Boolean(item),
    )
    .filter((item) => {
      if (!item.investmentOrderId) {
        return true;
      }

      return !earningTransactionKeys.has(
        `${item.investmentOrderId}:${item.createdAt.toISOString()}`,
      );
    })
    .map((item) => ({
      id: item.id,
      type: "EARNING",
      amount: item.amount,
      currency: item.currency,
      status: "COMPLETED",
      createdAt: item.createdAt,
      reference: item.reference,
      planName:
        item.investmentOrderId
          ? orderPlanNamesById.get(item.investmentOrderId) ?? undefined
          : undefined,
      description: "Daily fixed profit update",
      direction: "CREDIT",
    }));

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

  const investmentAdjustmentTx: AdjustmentTransactionItem[] = orders
    .flatMap((order) => parseInvestmentOrderAdjustmentMetadata(order))
    .filter((item): item is AdjustmentTransactionItem => item !== null);

  const investmentAdjustmentLedgerTx: AdjustmentTransactionItem[] =
    investmentAdjustments
      .map(parseInvestmentOrderAdjustmentRecord)
      .filter(
        (item): item is AdjustmentTransactionItem => item !== null,
      );

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
    reference:
      e.investmentOrder.investmentModel === "FIXED"
        ? `FIX-${e.id.slice(0, 6).toUpperCase()}`
        : `ERN-${e.id.slice(0, 6).toUpperCase()}`,
    planName: e.investmentOrder?.investmentPlan?.name,
    description:
      e.investmentOrder.investmentModel === "FIXED"
        ? "Daily fixed profit update"
        : "Investment profit",
    direction: "CREDIT",
  }));

  const savingsTx: TransactionItem[] = savingsTransactions.map((transaction) => {
    const adjustmentDirection =
      transaction.type === "ADJUSTMENT" &&
      transaction.metadata &&
      typeof transaction.metadata === "object" &&
      "adjustmentDirection" in transaction.metadata &&
      (transaction.metadata as { adjustmentDirection?: unknown }).adjustmentDirection;

    const direction =
      transaction.type === "WITHDRAWAL" || transaction.type === "FEE"
        ? "DEBIT"
        : transaction.type === "ADJUSTMENT"
          ? adjustmentDirection === "DEDUCT"
            ? "DEBIT"
            : "CREDIT"
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
      description:
        transaction.note ??
        (transaction.type === "ADJUSTMENT"
          ? "Manual balance adjustment"
          : `Savings ${transaction.type.toLowerCase()}`),
      direction,
    };
  });

  const transactions = [
    ...investmentTx,
    ...investmentAdjustmentTx,
    ...investmentAdjustmentLedgerTx,
    ...withdrawalTx,
    ...earningTx,
    ...legacyFixedProfitTx,
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
