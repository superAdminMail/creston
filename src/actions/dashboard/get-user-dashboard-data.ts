"use server";

import { unstable_noStore as noStore } from "next/cache";

import { InvestmentOrderStatus } from "@/generated/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import {
  decimalToNumber,
  toDecimal,
} from "@/lib/services/investment/decimal";
import { isInactiveInvestmentOrderRuntimeStatus } from "@/lib/investment/formatInvestmentOrderRuntimeStatusLabel";
import { calculateInvestmentAccountBalance } from "@/lib/services/investment/investmentBalanceService";
import {
  computeInvestmentOrderCurrentValue,
  computeInvestmentOrderRecognizedProfit,
} from "@/lib/services/investment/valuationService";
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
  inactiveInvestmentOrder: {
    id: string;
    planName: string;
    href: string;
  } | null;
  assets: UserDashboardAsset[];
};

type UserDashboardData = {
  userName: string;
  stats: UserDashboardStats;
};

export async function getUserDashboardDataAction(): Promise<UserDashboardData> {
  noStore();

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
          amountPaid: true,
          status: true,
          accruedProfit: true,
          investmentModel: true,
          runtimeStatus: true,
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

  const balanceSummary = calculateInvestmentAccountBalance(orders);
  const activeOrders = balanceSummary.activeOrders;

  const assets: UserDashboardAsset[] = activeOrders.map((order) => {
    const investment = order.investmentPlan.investment;
    const symbol = investment.symbol;
    const price = symbol ? (priceSnapshots[symbol]?.price ?? null) : null;
    const currentValue = computeInvestmentOrderCurrentValue(order, price);
    const realizedProfit = computeInvestmentOrderRecognizedProfit(order);
    const principal = toDecimal(order.amount);
    const profitPercent = principal.greaterThan(0)
      ? decimalToNumber(realizedProfit.div(principal).mul(100))
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

  const accountBalance = balanceSummary.accountBalanceNumber;
  const totalInvestment = balanceSummary.totalPrincipalNumber;
  const allEarnedProfits = balanceSummary.totalEarnedProfitsNumber;
  const latestOrder = activeOrders[0];
  const inactiveInvestmentOrder = orders.find(
    (order) => isInactiveInvestmentOrderRuntimeStatus(order.runtimeStatus),
  );
  const currentInvestment = latestOrder
    ? decimalToNumber(
        toDecimal(latestOrder.amountPaid).greaterThan(0)
          ? latestOrder.amountPaid
          : latestOrder.amount,
      )
    : 0;
  const latestActivePlan = latestOrder?.investmentPlan?.name ?? "Not selected";

  return {
    userName: user.name?.trim() || "Client",
    stats: {
      investmentsCount: activeOrders.length,
      currentInvestment,
      accountBalance,
      totalInvestment,
      totalEarnedProfits: allEarnedProfits,
      investmentPlan: latestActivePlan,
      inactiveInvestmentOrder: inactiveInvestmentOrder
        ? {
            id: inactiveInvestmentOrder.id,
            planName: inactiveInvestmentOrder.investmentPlan.name,
            href: `/account/dashboard/user/investment-orders/${inactiveInvestmentOrder.id}`,
          }
        : null,
      assets,
    },
  };
}
