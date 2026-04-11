import { prisma } from "@/lib/prisma";
import { accrueFixedOrders } from "@/lib/services/accrual/accrualService";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import { withCronLock } from "@/lib/services/cron/cronRuntime";

const FIXED_ACCRUAL_CRON_KEY = "investment-fixed-accrual";

export async function runDailyAccrual() {
  return withCronLock(FIXED_ACCRUAL_CRON_KEY, async () => {
    const now = new Date();

    const orders = await prisma.investmentOrder.findMany({
      where: {
        status: "CONFIRMED",
        investmentModel: "FIXED",
        isMatured: false,
      },
      select: {
        id: true,
        investmentAccountId: true,
        investmentModel: true,
        amount: true,
        currency: true,
        accruedProfit: true,
        expectedReturn: true,
        startDate: true,
        maturityDate: true,
        lastAccruedAt: true,
        completedAt: true,
        isMatured: true,
        investorProfile: {
          select: {
            userId: true,
          },
        },
        investmentPlanTier: {
          select: {
            level: true,
          },
        },
        investmentPlan: {
          select: {
            durationDays: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const summary = await accrueFixedOrders(orders, now);
    const results = summary.results.map((result) =>
      result.status === "skipped"
        ? {
            orderId: result.orderId,
            status: result.status,
            reason: result.reason,
          }
        : {
            orderId: result.orderId,
            status: result.status,
            accruedAmount: decimalToNumber(result.accruedAmount),
            totalAccruedProfit: decimalToNumber(result.totalAccruedProfit),
            accruedUntil: result.accruedUntil.toISOString(),
            matured: result.matured,
          },
    );

    console.log("runDailyAccrual", {
      processed: summary.processed,
      accrued: summary.accrued,
      skipped: summary.skipped,
      totalAccruedProfit: decimalToNumber(summary.totalAccruedProfit),
      results,
    });

    return {
      processed: summary.processed,
      accrued: summary.accrued,
      skipped: summary.skipped,
      totalAccruedProfit: decimalToNumber(summary.totalAccruedProfit),
      results,
    };
  });
}
