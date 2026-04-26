import { prisma } from "@/lib/prisma";
import { getPrices } from "@/lib/services/price/priceService";
import { settleMarketProfits } from "@/lib/services/settlement/settlementService";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import { withCronLock } from "@/lib/services/cron/cronRuntime";

const MARKET_SETTLEMENT_CRON_KEY = "investment-market-settlement";

export async function runDailyProfitSettlement() {
  return withCronLock(MARKET_SETTLEMENT_CRON_KEY, async () => {
    const now = new Date();

    const orders = await prisma.investmentOrder.findMany({
      where: {
        status: "CONFIRMED",
        investmentModel: "MARKET",
      },
      select: {
        id: true,
        investmentAccountId: true,
        investmentModel: true,
        amount: true,
        currency: true,
        units: true,
        currentValue: true,
        lastValuationAt: true,
        status: true,
        investorProfile: {
          select: {
            userId: true,
          },
        },
        investmentPlanTier: {
          select: {
            level: true,
            projectedRoiMin: true,
            projectedRoiMax: true,
          },
        },
        investmentPlan: {
          select: {
            investment: {
              select: {
                symbol: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const symbols = Array.from(
      new Set(
        orders
          .map((order) => order.investmentPlan.investment.symbol)
          .filter((symbol): symbol is string => Boolean(symbol)),
      ),
    );
    const priceSnapshots = await getPrices(symbols, {
      preferFreshDb: false,
    });
    const priceBySymbol = Object.fromEntries(
      Object.entries(priceSnapshots).map(([symbol, snapshot]) => [symbol, snapshot.price]),
    ) as Record<string, number>;

    const summary = await settleMarketProfits(orders, priceBySymbol, now);

    console.log("runDailyProfitSettlement", {
      processed: summary.processed,
      settled: summary.settled,
      skipped: summary.skipped,
      realizedProfit: decimalToNumber(summary.realizedProfit),
    });

    return {
      processed: summary.processed,
      settled: summary.settled,
      skipped: summary.skipped,
      realizedProfit: decimalToNumber(summary.realizedProfit),
    };
  });
}
