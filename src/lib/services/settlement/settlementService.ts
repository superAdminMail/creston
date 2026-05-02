import { InvestmentModel, InvestmentTierLevel, Prisma } from "@/generated/prisma";

import { formatCurrency } from "@/lib/formatters/formatters";
import { createRealtimeNotification } from "@/lib/notifications/createNotification";
import { prisma } from "@/lib/prisma";
import { computeInvestmentOrderCurrentValue } from "@/lib/services/investment/valuationService";
import {
  decimalToNumber,
  toDecimal,
  ZERO_DECIMAL,
} from "@/lib/services/investment/decimal";
import {
  applyProfitSimulation,
  resolveSimulationMultiplier,
} from "@/lib/services/simulation/profitSimulationService";

export const MARKET_SETTLEMENT_INTERVAL_MINUTES = 2;

export type MarketSettlementOrderRecord = {
  id: string;
  investmentAccountId: string;
  investmentModel: InvestmentModel;
  amount: Prisma.Decimal;
  currency: string;
  units: Prisma.Decimal | null;
  currentValue: Prisma.Decimal | null;
  lastValuationAt: Date | null;
  status: string;
  investorProfile: {
    userId: string;
  };
  investmentPlanTier: {
    level: InvestmentTierLevel;
    projectedRoiMin: Prisma.Decimal | null;
    projectedRoiMax: Prisma.Decimal | null;
  };
  investmentPlan: {
    investment: {
      symbol: string | null;
    };
  };
};

export type MarketSettlementResult =
  | {
      status: "skipped";
      reason: string;
      orderId: string;
      symbol: string | null;
    }
  | {
      status: "settled";
      orderId: string;
      symbol: string;
      settledAt: Date;
      previousValue: Prisma.Decimal;
      currentValue: Prisma.Decimal;
      realizedProfit: Prisma.Decimal;
    };

function getSettlementBucket(now: Date) {
  const intervalMs = MARKET_SETTLEMENT_INTERVAL_MINUTES * 60 * 1000;
  return new Date(Math.floor(now.getTime() / intervalMs) * intervalMs);
}

export function calculateMarketSettlement(
  order: MarketSettlementOrderRecord,
  currentPrice: Prisma.Decimal | number | string | null | undefined,
  now = new Date(),
) {
  const symbol = order.investmentPlan.investment.symbol;

  if (!symbol) {
    return {
      status: "skipped" as const,
      reason: "missing-symbol",
      orderId: order.id,
      symbol: null,
    };
  }

  if (order.investmentModel !== "MARKET") {
    return {
      status: "skipped" as const,
      reason: "invalid-model",
      orderId: order.id,
      symbol,
    };
  }

  const settlementBucket = getSettlementBucket(now);
  const price = toDecimal(currentPrice);

  if (order.lastValuationAt && order.lastValuationAt >= settlementBucket) {
    return {
      status: "skipped" as const,
      reason: "already-processed",
      orderId: order.id,
      symbol,
    };
  }

  if (!price.greaterThan(0)) {
    return {
      status: "skipped" as const,
      reason: "missing-price",
      orderId: order.id,
      symbol,
    };
  }

  const previousValue = toDecimal(order.currentValue).greaterThan(0)
    ? toDecimal(order.currentValue)
    : toDecimal(order.amount);
  const currentValue = computeInvestmentOrderCurrentValue(order, price);
  const delta = currentValue.sub(previousValue);
  const realizedProfit = delta.greaterThan(0) ? delta : ZERO_DECIMAL;

  return {
    status: "settled" as const,
    orderId: order.id,
    symbol,
    settledAt: settlementBucket,
    previousValue,
    currentValue,
    realizedProfit,
  };
}

export async function settleMarketProfit(
  order: MarketSettlementOrderRecord,
  currentPrice: Prisma.Decimal | number | string | null | undefined,
  now = new Date(),
): Promise<MarketSettlementResult> {
  const calculation = calculateMarketSettlement(order, currentPrice, now);

  if (calculation.status === "skipped") {
    return calculation;
  }

  const simulationMultiplier = resolveSimulationMultiplier({
    tierLevel: order.investmentPlanTier.level,
    projectedRoiMin: order.investmentPlanTier.projectedRoiMin,
    projectedRoiMax: order.investmentPlanTier.projectedRoiMax,
  });

  const simulatedProfit = applyProfitSimulation({
    amount: order.amount,
    profit: calculation.realizedProfit,
    tierLevel: order.investmentPlanTier.level,
    projectedRoiMin: order.investmentPlanTier.projectedRoiMin,
    projectedRoiMax: order.investmentPlanTier.projectedRoiMax,
    simulationMultiplier,
  });

  const updateResult = await prisma.$transaction(async (tx) => {
    const orderUpdate = await tx.investmentOrder.updateMany({
      where: {
        id: order.id,
        investmentModel: InvestmentModel.MARKET,
        OR: [
          {
            lastValuationAt: null,
          },
          {
            lastValuationAt: {
              lt: calculation.settledAt,
            },
          },
        ],
      },
      data: {
        currentValue: calculation.currentValue,
        lastValuationAt: calculation.settledAt,
      },
    });

    if (orderUpdate.count === 0) {
      return orderUpdate;
    }

    if (simulatedProfit.greaterThan(0)) {
      await tx.investmentEarning.upsert({
        where: {
          investmentOrderId_date: {
            investmentOrderId: order.id,
            date: calculation.settledAt,
          },
        },
        create: {
          investmentOrderId: order.id,
          date: calculation.settledAt,
          amount: simulatedProfit,
        },
        update: {
          amount: simulatedProfit,
        },
      });

      await tx.investmentAccount.update({
        where: {
          id: order.investmentAccountId,
        },
        data: {
          balance: {
            increment: simulatedProfit,
          },
        },
      });
    }

    return orderUpdate;
  });

  if (updateResult.count === 0) {
    return {
      status: "skipped",
      reason: "already-processed",
      orderId: order.id,
      symbol: calculation.symbol,
    };
  }

  if (simulatedProfit.greaterThan(0)) {
    const formattedAmount = formatCurrency(
      decimalToNumber(simulatedProfit),
      order.currency,
    );

    await createRealtimeNotification({
      userId: order.investorProfile.userId,
      event: "INVESTMENT_ROI",
      title: "Profit update recorded",
      message: `A market-profit update of ${formattedAmount} has been posted to your investment order.`,
      link: "/account/dashboard/user/investment-orders",
      key: `market-profit:${order.id}:${calculation.settledAt.toISOString()}`,
      metadata: {
        investmentOrderId: order.id,
        amount: decimalToNumber(simulatedProfit),
        currency: order.currency,
        settledAt: calculation.settledAt.toISOString(),
        model: "MARKET",
        tierLevel: order.investmentPlanTier.level,
        symbol: calculation.symbol,
      },
    });

    return {
      ...calculation,
      realizedProfit: simulatedProfit,
    };
  }

  return {
    ...calculation,
    realizedProfit: simulatedProfit,
  };
}

export async function settleMarketProfits(
  orders: MarketSettlementOrderRecord[],
  priceBySymbol: Record<string, number>,
  now = new Date(),
) {
  const results: MarketSettlementResult[] = [];

  for (const order of orders) {
    const symbol = order.investmentPlan.investment.symbol;
    const price = symbol ? priceBySymbol[symbol] ?? null : null;
    results.push(await settleMarketProfit(order, price, now));
  }

  return {
    processed: orders.length,
    settled: results.filter((result) => result.status === "settled").length,
    skipped: results.filter((result) => result.status === "skipped").length,
    realizedProfit: results.reduce((sum, result) => {
      if (result.status !== "settled") {
        return sum;
      }

      return sum.add(result.realizedProfit);
    }, ZERO_DECIMAL),
    results,
  };
}
