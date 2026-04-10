import { prisma } from "@/lib/prisma";
import { pusherServer } from "../pusher";

export async function runDailyProfitSettlement() {
  const now = new Date();

  const orders = await prisma.investmentOrder.findMany({
    where: {
      status: "CONFIRMED",
      investmentModel: "MARKET",
    },
    include: {
      investorProfile: {
        include: { user: true },
      },
      investmentPlan: {
        include: { investment: true },
      },
    },
  });

  for (const order of orders) {
    const dailyProfit = Number(order.dailyProfitAccumulated ?? 0);

    if (Math.abs(dailyProfit) < 0.01) continue;

    const userId = order.investorProfile.user.id;

    await prisma.$transaction([
      // ✅ store in earning ledger
      prisma.investmentEarning.create({
        data: {
          investmentOrderId: order.id,
          date: now,
          amount: dailyProfit,
        },
      }),

      // ✅ reset accumulator
      prisma.investmentOrder.update({
        where: { id: order.id },
        data: {
          dailyProfitAccumulated: 0,
          lastProfitResetAt: now,
        },
      }),

      // 🔔 single clean notification
      prisma.notification.create({
        data: {
          userId,
          title: "Investment update",
          message: `You ${
            dailyProfit >= 0 ? "earned" : "lost"
          } $${Math.abs(dailyProfit).toFixed(2)} from ${order.investmentPlan.investment.name}.`,
          type: "INVESTMENT_EARNING",
        },
      }),
    ]);

    await pusherServer.trigger(`user-${userId}`, "notification", {
      title: "Investment update",
      message: `${dailyProfit >= 0 ? "+" : "-"}$${Math.abs(dailyProfit).toFixed(
        2,
      )} from ${order.investmentPlan.investment.name} today`,
    });
  }
}
