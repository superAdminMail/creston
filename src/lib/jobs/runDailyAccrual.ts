import { prisma } from "@/lib/prisma";
import { pusherServer } from "../pusher";

const ACCRUAL_INTERVAL_MINUTES = 10; // 🔥 test mode

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
        include: {
          user: true,
        },
      },
      investmentPlan: {
        include: {
          investment: true,
        },
      },
      investmentPlanTier: true,
    },
  });

  for (const order of orders) {
    if (!order.startDate || !order.maturityDate) continue;

    // ⛔ skip if interval not passed
    if (!hasIntervalPassed(order.lastAccruedAt, now)) {
      continue;
    }

    const amount = Number(order.amount);
    const roiPercent = Number(order.investmentPlanTier.roiPercent);
    const durationDays = order.investmentPlan.durationDays;

    const dailyProfit = (amount * roiPercent) / 100 / durationDays;

    const intervalProfit = dailyProfit / (1440 / ACCRUAL_INTERVAL_MINUTES);

    const newAccrued = Number(order.accruedProfit) + intervalProfit;

    const expectedReturn = Number(order.expectedReturn);

    const cappedAccrued = Math.min(newAccrued, expectedReturn);

    const isMatured = now >= order.maturityDate;

    const userId = order.investorProfile.user.id;

    await prisma.$transaction([
      // ✅ update order
      prisma.investmentOrder.update({
        where: { id: order.id },
        data: {
          accruedProfit: cappedAccrued,
          lastAccruedAt: now,
          isMatured,
          ...(isMatured && { completedAt: now }),
        },
      }),

      // ✅ insert earning ledger
      prisma.investmentEarning.create({
        data: {
          investmentOrderId: order.id,
          date: now,
          amount: intervalProfit,
        },
      }),

      // 🔔 insert notification
      prisma.notification.create({
        data: {
          userId,
          title: "Daily profit added",
          message: `You earned $${intervalProfit.toFixed(
            2,
          )} from your ${order.investmentPlan.investment.name} investment.`,
          type: "INVESTMENT_EARNING",
        },
      }),
    ]);

    // 🔔 notify user
    await pusherServer.trigger(`user-${userId}`, "notification", {
      title: "Daily profit added",
      message: `You earned $${intervalProfit.toFixed(2)}`,
    });

    console.log(
      `Accrued $${intervalProfit.toFixed(4)} + notified user ${userId}`,
    );
  }
}
