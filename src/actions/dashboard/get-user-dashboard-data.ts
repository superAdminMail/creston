"use server";

import { AccountStatus } from "@/generated/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import type { UserDashboardStats } from "@/app/account/dashboard/user/UserDashboardPage";

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
      investmentAccounts: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          status: true,
          investmentPlan: {
            select: {
              name: true,
              minAmount: true,
              maxAmount: true,
              currency: true,
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

  const investmentAccounts = investorProfile?.investmentAccounts ?? [];
  const activeAccount =
    investmentAccounts.find(
      (account) => account.status === AccountStatus.ACTIVE,
    ) ?? investmentAccounts[0];
  const totalInvestment = investmentAccounts.reduce(
    (sum, account) => sum + toNumber(account.investmentPlan.minAmount),
    0,
  );
  const currentInvestment = activeAccount
    ? toNumber(activeAccount.investmentPlan.minAmount)
    : 0;
  const investmentType =
    activeAccount?.investmentPlan.investment.name ??
    formatLabel(activeAccount?.investmentPlan.investment.type) ??
    activeAccount?.investmentPlan.name;

  return {
    userName: user.name?.trim() || "Investor",
    stats: {
      investmentsCount: investmentAccounts.length,
      currentInvestment,
      accountBalance: 0,
      totalInvestment,
      investmentType: investmentType || "Not selected",
    },
  };
}
