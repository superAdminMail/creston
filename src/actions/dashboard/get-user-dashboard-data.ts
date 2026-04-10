"use server";

import { InvestmentOrderStatus } from "@/generated/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { getPrices } from "@/lib/price/getPrices";

export type UserDashboardAsset = {
  name: string;
  symbol: string | null;
  type: string;
  value: number;
  profit: number;
  profitPercent: number;
};

export type UserDashboardStats = {
  investmentsCount: number;
  currentInvestment: number;
  accountBalance: number;
  totalInvestment: number;
  investmentPlan: string;
  totalEarnedProfits: number;
  assets: UserDashboardAsset[];
};

type Decimalish = {
  toNumber(): number;
};

type UserDashboardData = {
  userName: string;
  stats: UserDashboardStats;
};

function safeToNumber(value: Decimalish | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return value.toNumber();
}

export async function getUserDashboardDataAction(): Promise<UserDashboardData> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const investorProfile = await prisma.investorProfile.findUnique({
    where: { userId: user.id },
    select: {
      investmentOrders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amount: true,
          accruedProfit: true,
          status: true,
          units: true,
          investmentModel: true,

          // ✅ IMPORTANT: per-order earnings
          investmentEarnings: {
            select: {
              amount: true,
            },
          },

          investmentPlan: {
            select: {
              name: true,
              investment: {
                select: {
                  name: true,
                  type: true,
                  symbol: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const orders = investorProfile?.investmentOrders ?? [];

  const confirmedOrders = orders.filter(
    (order) => order.status === InvestmentOrderStatus.CONFIRMED,
  );

  // 🔥 Batch fetch prices
  const symbols = confirmedOrders
    .map((o) => o.investmentPlan?.investment?.symbol)
    .filter(Boolean) as string[];

  const priceMap = await getPrices(symbols);

  let totalInvested = 0;
  let totalProfit = 0;

  const assets: UserDashboardAsset[] = [];

  for (const order of confirmedOrders) {
    const amount = safeToNumber(order.amount);
    totalInvested += amount;

    const investment = order.investmentPlan?.investment;
    const name = investment?.name ?? "Unknown";
    const symbol = investment?.symbol ?? null;
    const type = investment?.type ?? "UNKNOWN";

    let value = 0;
    let profit = 0;

    // 💰 FIXED MODEL
    if (order.investmentModel === "FIXED") {
      const accrued = safeToNumber(order.accruedProfit);
      value = amount + accrued;
      profit = accrued;
    }

    // 📈 MARKET MODEL
    if (order.investmentModel === "MARKET") {
      const units = Number(order.units ?? 0);
      const price = symbol ? priceMap[symbol] : null;

      value = price && units ? units * price : amount;

      // ✅ REALIZED profit from DB (ledger)
      const earnings = order.investmentEarnings ?? [];

      const earned = earnings.reduce(
        (sum, e) => sum + safeToNumber(e.amount),
        0,
      );

      profit = earned;
    }

    totalProfit += profit;

    const profitPercent = amount > 0 ? (profit / amount) * 100 : 0;

    assets.push({
      name,
      symbol,
      type,
      value,
      profit,
      profitPercent,
    });
  }

  const investmentsCount = confirmedOrders.length;

  const latestOrder = confirmedOrders[0];
  const currentInvestment = latestOrder ? safeToNumber(latestOrder.amount) : 0;

  const investmentPlan = latestOrder?.investmentPlan?.name ?? "Not selected";

  const accountBalance = assets.reduce((sum, asset) => sum + asset.value, 0);

  return {
    userName: user.name?.trim() || "Client",
    stats: {
      investmentsCount,
      currentInvestment,
      accountBalance,
      totalInvestment: totalInvested,
      totalEarnedProfits: totalProfit,
      investmentPlan,
      assets,
    },
  };
}
