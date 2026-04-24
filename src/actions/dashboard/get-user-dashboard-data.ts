"use server";

import { InvestmentOrderStatus } from "@/generated/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, sumDecimals, toDecimal } from "@/lib/services/investment/decimal";
import { computeInvestmentOrderCurrentValue } from "@/lib/services/investment/valuationService";
import { getPrices } from "@/lib/services/price/priceService";

export type UserDashboardAsset = {
  orderId: string;
  name: string;
  symbol: string | null;
  type: string;
  model: "FIXED" | "MARKET";
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

type UserDashboardData = {
  userName: string;
  stats: UserDashboardStats;
};

export async function getUserDashboardDataAction(): Promise<UserDashboardData> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const investorProfile = await prisma.investorProfile.findUnique({
    where: {
      userId: user.id,
    },
    select: {
        investmentOrders: {
        where: {
          status: {
            in: [InvestmentOrderStatus.PAID, InvestmentOrderStatus.CONFIRMED],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          amount: true,
          accruedProfit: true,
          investmentModel: true,
          units: true,
          currentValue: true,
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
  const symbols = Array.from(
    new Set(
      orders
        .filter((order) => order.investmentModel === "MARKET")
        .map((order) => order.investmentPlan.investment.symbol)
        .filter((symbol): symbol is string => Boolean(symbol)),
    ),
  );

  const priceSnapshots = symbols.length
    ? await getPrices(symbols, { preferFreshDb: true })
    : {};

  const assets: UserDashboardAsset[] = orders.map((order) => {
    const investment = order.investmentPlan.investment;
    const symbol = investment.symbol;
    const price = symbol ? priceSnapshots[symbol]?.price ?? null : null;
    const currentValue = computeInvestmentOrderCurrentValue(order, price);
    const realizedProfit =
      order.investmentModel === "FIXED"
        ? toDecimal(order.accruedProfit)
        : sumDecimals(order.investmentEarnings.map((earning) => earning.amount));
    const principal = toDecimal(order.amount);
    const profitPercent = principal.greaterThan(0)
      ? realizedProfit.div(principal).mul(100).toNumber()
      : 0;

    return {
      orderId: order.id,
      name: investment.name,
      symbol,
      type: investment.type,
      model: order.investmentModel,
      value: decimalToNumber(currentValue),
      profit: decimalToNumber(realizedProfit),
      profitPercent,
    };
  });

  const totalInvestment = orders.reduce(
    (sum, order) => sum + decimalToNumber(order.amount),
    0,
  );
  const totalEarnedProfits = assets.reduce((sum, asset) => sum + asset.profit, 0);
  const accountBalance = orders.reduce((sum, order) => {
    const realizedProfit =
      order.investmentModel === "FIXED"
        ? toDecimal(order.accruedProfit)
        : sumDecimals(order.investmentEarnings.map((earning) => earning.amount));
    const principal = toDecimal(order.amount);
    const orderBalance = realizedProfit.greaterThan(0)
      ? principal.add(realizedProfit)
      : principal;

    return sum + decimalToNumber(orderBalance);
  }, 0);
  const latestOrder = orders[0];

  return {
    userName: user.name?.trim() || "Client",
    stats: {
      investmentsCount: orders.length,
      currentInvestment: latestOrder ? decimalToNumber(latestOrder.amount) : 0,
      accountBalance,
      totalInvestment,
      totalEarnedProfits,
      investmentPlan: latestOrder?.investmentPlan?.name ?? "Not selected",
      assets,
    },
  };
}
