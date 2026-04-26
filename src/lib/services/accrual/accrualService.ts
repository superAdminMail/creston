import { InvestmentModel, Prisma, RuntimeStatus } from "@/generated/prisma";

import { formatCurrency } from "@/lib/formatters/formatters";
import { createRealtimeNotification } from "@/lib/notifications/createNotification";
import { prisma } from "@/lib/prisma";
import { minDecimal, toDecimal, ZERO_DECIMAL } from "@/lib/services/investment/decimal";

export const FIXED_ACCRUAL_INTERVAL_MINUTES = 2;

export type FixedAccrualOrderRecord = {
  id: string;
  investmentAccountId: string;
  investmentModel: InvestmentModel;
  amount: Prisma.Decimal;
  currency: string;
  accruedProfit: Prisma.Decimal;
  expectedReturn: Prisma.Decimal | null;
  startDate: Date | null;
  maturityDate: Date | null;
  lastAccruedAt: Date | null;
  completedAt: Date | null;
  runtimeStatus: RuntimeStatus;
  isMatured: boolean;
  investorProfile: {
    userId: string;
  };
  investmentPlan: {
    durationDays: number;
  };
};

export type FixedAccrualResult =
  | {
      status: "skipped";
      reason: string;
      orderId: string;
    }
  | {
      status: "accrued";
      orderId: string;
      accruedAmount: Prisma.Decimal;
      totalAccruedProfit: Prisma.Decimal;
      accruedUntil: Date;
      matured: boolean;
    };

function getAccrualCutoff(now: Date) {
  const intervalMs = FIXED_ACCRUAL_INTERVAL_MINUTES * 60 * 1000;
  return new Date(Math.floor(now.getTime() / intervalMs) * intervalMs);
}

export function calculateFixedAccrual(
  order: FixedAccrualOrderRecord,
  now = new Date(),
) {
  if (!order.startDate || !order.maturityDate) {
    return {
      status: "skipped" as const,
      reason: "missing-dates",
      orderId: order.id,
    };
  }

  if (order.investmentModel !== "FIXED") {
    return {
      status: "skipped" as const,
      reason: "invalid-model",
      orderId: order.id,
    };
  }

  if (order.isMatured) {
    return {
      status: "skipped" as const,
      reason: "already-matured",
      orderId: order.id,
    };
  }

  const expectedProfit = toDecimal(order.expectedReturn);

  if (!expectedProfit.greaterThan(0)) {
    return {
      status: "skipped" as const,
      reason: "no-expected-profit",
      orderId: order.id,
    };
  }

  const currentAccruedProfit = minDecimal(order.accruedProfit, expectedProfit);
  const accrualCutoff = minDecimal(
    order.maturityDate.getTime(),
    getAccrualCutoff(now).getTime(),
  );
  const accrualUntil = new Date(accrualCutoff.toNumber());
  const accrualFrom = order.lastAccruedAt ?? order.startDate;

  if (accrualUntil <= accrualFrom) {
    return {
      status: "skipped" as const,
      reason: "interval-not-reached",
      orderId: order.id,
    };
  }

  const totalDurationMs = order.investmentPlan.durationDays * 24 * 60 * 60 * 1000;

  if (totalDurationMs <= 0) {
    return {
      status: "skipped" as const,
      reason: "invalid-duration",
      orderId: order.id,
    };
  }

  const elapsedMs = accrualUntil.getTime() - accrualFrom.getTime();
  const proportionalProfit = expectedProfit
    .mul(new Prisma.Decimal(elapsedMs))
    .div(new Prisma.Decimal(totalDurationMs));

  if (!proportionalProfit.greaterThan(0)) {
    return {
      status: "skipped" as const,
      reason: "non-positive-accrual",
      orderId: order.id,
    };
  }

  let totalAccruedProfit = minDecimal(
    currentAccruedProfit.add(proportionalProfit),
    expectedProfit,
  );
  const matured = accrualUntil >= order.maturityDate;

  if (matured) {
    totalAccruedProfit = expectedProfit;
  }

  const accruedAmount = totalAccruedProfit.sub(currentAccruedProfit);

  if (!accruedAmount.greaterThan(0) && !matured) {
    return {
      status: "skipped" as const,
      reason: "already-at-cap",
      orderId: order.id,
    };
  }

  return {
    status: "accrued" as const,
    orderId: order.id,
    accruedAmount,
    totalAccruedProfit,
    accruedUntil: accrualUntil,
    matured,
  };
}

export async function accrueFixedOrder(
  order: FixedAccrualOrderRecord,
  now = new Date(),
): Promise<FixedAccrualResult> {
  const calculation = calculateFixedAccrual(order, now);

  if (calculation.status === "skipped") {
    return calculation;
  }

  const updateResult = await prisma.$transaction(async (tx) => {
    const orderUpdate = await tx.investmentOrder.updateMany({
      where: {
        id: order.id,
        investmentModel: InvestmentModel.FIXED,
        isMatured: false,
        OR: [
          {
            lastAccruedAt: null,
          },
          {
            lastAccruedAt: {
              lt: calculation.accruedUntil,
            },
          },
        ],
      },
      data: {
        accruedProfit: calculation.totalAccruedProfit,
        lastAccruedAt: calculation.accruedUntil,
        isMatured: calculation.matured,
        completedAt: calculation.matured
          ? calculation.accruedUntil
          : order.completedAt,
        runtimeStatus: calculation.matured
          ? RuntimeStatus.COMPLETED
          : order.runtimeStatus,
      },
    });

    if (orderUpdate.count === 0) {
      return orderUpdate;
    }

    return orderUpdate;
  });

  if (updateResult.count === 0) {
    return {
      status: "skipped",
      reason: "already-processed",
      orderId: order.id,
    };
  }

  if (calculation.accruedAmount.greaterThan(0)) {
    const formattedAmount = formatCurrency(
      calculation.accruedAmount.toNumber(),
      order.currency,
    );

    await createRealtimeNotification({
      userId: order.investorProfile.userId,
      event: "INVESTMENT_ROI",
      title: "Profit update recorded",
      message: `A fixed-profit update of ${formattedAmount} has been posted to your investment order.`,
      link: "/account/dashboard/user/investment-orders",
      key: `fixed-profit:${order.id}:${calculation.accruedUntil.toISOString()}`,
      metadata: {
        investmentOrderId: order.id,
        amount: calculation.accruedAmount.toNumber(),
        currency: order.currency,
        totalAccruedProfit: calculation.totalAccruedProfit.toNumber(),
        accruedUntil: calculation.accruedUntil.toISOString(),
        model: "FIXED",
      },
    });
  }

  return calculation;
}

export async function accrueFixedOrders(
  orders: FixedAccrualOrderRecord[],
  now = new Date(),
) {
  const results: FixedAccrualResult[] = [];

  for (const order of orders) {
    results.push(await accrueFixedOrder(order, now));
  }

  return {
    processed: orders.length,
    accrued: results.filter((result) => result.status === "accrued").length,
    skipped: results.filter((result) => result.status === "skipped").length,
    totalAccruedProfit: results.reduce((sum, result) => {
      if (result.status !== "accrued") {
        return sum;
      }

      return sum.add(result.accruedAmount);
    }, ZERO_DECIMAL),
    results,
  };
}
