"use server";

import { InvestmentOrderStatus } from "@/generated/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import type { UserDashboardStats } from "@/app/account/dashboard/user/_components/UserDashboardPage";

type UserDashboardData = {
  userName: string;
  stats: UserDashboardStats;
};

function formatLabel(value: string | null | undefined) {
  if (!value) return "Not selected";

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toNumber(value: { toNumber(): number } | number | null | undefined) {
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
    where: {
      userId: user.id,
    },
    select: {
      investmentOrders: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          amount: true,
          accruedProfit: true,
          status: true,
          investmentPlan: {
            select: {
              name: true,
              investment: {
                select: {
                  name: true,
                  type: true,
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

  const totalInvested = confirmedOrders.reduce(
    (sum, order) => sum + toNumber(order.amount),
    0,
  );

  const totalEarnedProfits = confirmedOrders.reduce(
    (sum, order) => sum + toNumber(order.accruedProfit),
    0,
  );

  const currentInvestment = totalInvested;

  const investmentsCount = confirmedOrders.length;

  const latestOrder = confirmedOrders[0];

  const investmentPlan = latestOrder?.investmentPlan?.name ?? "Not selected";

  const accountBalance = totalInvested + totalEarnedProfits;

  return {
    userName: user.name?.trim() || "Client",
    stats: {
      investmentsCount,
      currentInvestment,
      totalInvestment: totalInvested,
      totalEarnedProfits,
      accountBalance,
      investmentPlan,
    },
  };
}
