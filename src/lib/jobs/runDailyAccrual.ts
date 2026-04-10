import { prisma } from "@/lib/prisma";
import { pusherServer } from "../pusher";
import { getPrices } from "@/lib/price/getPrices";
import { getLatestPrices } from "../price/getLatestPrices";

const ACCRUAL_INTERVAL_MINUTES = 10;

function hasIntervalPassed(last: Date | null, now: Date) {
  if (!last) return true;

  const diffMs = now.getTime() - last.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes >= ACCRUAL_INTERVAL_MINUTES;
}

export async function runDailyAccrual() {
  const now = new Date();

  const orders = await prisma.investmentOrder.findMany({
    where: {
      status: "CONFIRMED",
      isMatured: false,
    },
    include: {
      investorProfile: {
        include: { user: true },
      },
      investmentPlan: {
        include: {
          investment: true,
        },
      },
      investmentPlanTier: true,
    },
  });

  // 🔥 Separate MARKET symbols (batch fetch)
  const marketSymbols = orders
    .filter((o) => o.investmentModel === "MARKET")
    .map((o) => o.investmentPlan.investment.symbol)
    .filter(Boolean) as string[];

  const priceMap =
    marketSymbols.length > 0 ? await getPrices(marketSymbols) : {};

  for (const order of orders) {
    if (!order.startDate || !order.maturityDate) continue;

    const userId = order.investorProfile.user.id;

    if (order.investmentModel === "FIXED") {
      if (!hasIntervalPassed(order.lastAccruedAt, now)) continue;

      const amount = Number(order.amount);
      const roiPercent = Number(order.investmentPlanTier.roiPercent);
      const durationDays = order.investmentPlan.durationDays;

      const dailyProfit = (amount * roiPercent) / 100 / durationDays;
      const intervalProfit = dailyProfit / (1440 / ACCRUAL_INTERVAL_MINUTES);

      const newAccrued = Number(order.accruedProfit ?? 0) + intervalProfit;

      const expectedReturn = Number(order.expectedReturn ?? 0);

      const cappedAccrued = Math.min(newAccrued, expectedReturn);

      const isMatured = now >= order.maturityDate;

      await prisma.$transaction([
        prisma.investmentOrder.update({
          where: { id: order.id },
          data: {
            accruedProfit: cappedAccrued,
            lastAccruedAt: now,
            isMatured,
            ...(isMatured && { completedAt: now }),
          },
        }),

        prisma.investmentEarning.create({
          data: {
            investmentOrderId: order.id,
            date: now,
            amount: intervalProfit,
          },
        }),

        prisma.notification.create({
          data: {
            userId,
            title: "Profit credited",
            message: `You earned $${intervalProfit.toFixed(2)} from your ${
              order.investmentPlan.investment.name
            } plan.`,
            type: "INVESTMENT_EARNING",
          },
        }),
      ]);

      await pusherServer.trigger(`user-${userId}`, "notification", {
        title: "Profit credited",
        message: `+$${intervalProfit.toFixed(2)} added`,
      });

      continue;
    }

    // 🔥 before loop
    const marketSymbols = orders
      .filter((o) => o.investmentModel === "MARKET")
      .map((o) => o.investmentPlan.investment.symbol)
      .filter(Boolean) as string[];

    const livePrices = await getPrices(marketSymbols);
    const lastPrices = await getLatestPrices(marketSymbols);

    // =========================
    // 📈 MARKET MODEL
    // =========================
    if (order.investmentModel === "MARKET") {
      const symbol = order.investmentPlan.investment.symbol;
      const units = Number(order.units ?? 0);

      if (!symbol || !units) continue;

      const price = priceMap[symbol];
      if (!price) continue;

      const newValue = units * price;
      const previousValue = Number(order.currentValue ?? order.amount);

      const delta = newValue - previousValue;

      // 🔥 ONLY positive movement
      const positiveDelta = delta > 0 ? delta : 0;

      // ❗ skip if no meaningful gain
      if (positiveDelta < 0.01) {
        // still update value, but no accumulation
        await prisma.investmentOrder.update({
          where: { id: order.id },
          data: {
            currentValue: newValue,
          },
        });

        continue;
      }

      await prisma.investmentOrder.update({
        where: { id: order.id },
        data: {
          currentValue: newValue,

          dailyProfitAccumulated: {
            increment: positiveDelta,
          },
        },
      });

      continue;
    }
  }
}
