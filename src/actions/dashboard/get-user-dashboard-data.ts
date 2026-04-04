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
          balance: true,
          status: true,
          investmentPlan: {
            select: {
              name: true,
              currency: true,
              tiers: {
                where: {
                  isActive: true,
                },
                orderBy: {
                  minAmount: "asc",
                },
                select: {
                  minAmount: true,
                },
              },
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
  const totalAccountBalance = investmentAccounts.reduce(
    (sum, account) => sum + toNumber(account.balance),
    0,
  );
  const currentAccountBalance = activeAccount
    ? toNumber(activeAccount.balance)
    : 0;
  const activeAccountTierFloor =
    activeAccount?.investmentPlan.tiers[0]?.minAmount ?? null;
  const totalInvestmentCommitment = investmentAccounts.reduce(
    (sum, account) =>
      sum + toNumber(account.investmentPlan.tiers[0]?.minAmount ?? 0),
    0,
  );
  const investmentType =
    activeAccount?.investmentPlan.investment.name ??
    formatLabel(activeAccount?.investmentPlan.investment.type) ??
    activeAccount?.investmentPlan.name;

  return {
    userName: user.name?.trim() || "Investor",
    stats: {
      investmentsCount: investmentAccounts.length,
      currentInvestment:
        toNumber(activeAccountTierFloor) || currentAccountBalance,
      accountBalance: totalAccountBalance,
      totalInvestment: totalInvestmentCommitment || totalAccountBalance,
      investmentType: investmentType || "Not selected",
    },
  };
}
