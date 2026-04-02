"use server";

import {
  AccountStatus,
  type InvestmentAccountType,
} from "@/generated/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import type { UserDashboardStats } from "@/app/account/dashboard/user/UserDashboardPage";

type UserDashboardData = {
  userName: string;
  stats: UserDashboardStats;
};

function formatInvestmentType(type: InvestmentAccountType | null | undefined) {
  if (!type) return "Not selected";

  return type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function getUserDashboardDataAction(): Promise<UserDashboardData> {
  const user = await getCurrentUser();

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
          type: true,
          status: true,
        },
      },
    },
  });

  const investmentAccounts = investorProfile?.investmentAccounts ?? [];
  const activeAccount =
    investmentAccounts.find(
      (account) => account.status === AccountStatus.ACTIVE,
    ) ?? investmentAccounts[0];

  return {
    userName: user.name?.trim() || "Investor",
    stats: {
      investmentsCount: investmentAccounts.length,
      currentInvestment: 0,
      accountBalance: 0,
      totalInvestment: 0,
      investmentType: formatInvestmentType(activeAccount?.type),
    },
  };
}
