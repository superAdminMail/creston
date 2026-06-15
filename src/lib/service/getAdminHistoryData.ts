"use server";

import { InvestmentOrderStatus, Prisma } from "@/generated/prisma";
import { formatDateLabel } from "@/lib/formatters/formatters";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { prisma } from "@/lib/prisma";
import { calculateInvestmentAccountBalance } from "@/lib/services/investment/investmentBalanceService";

const confirmedInvestmentOrderSelect =
  Prisma.validator<Prisma.InvestmentOrderSelect>()({
    id: true,
    amount: true,
    amountPaid: true,
    accruedProfit: true,
    currency: true,
    status: true,
    investmentModel: true,
    confirmedAt: true,
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
  });

type ConfirmedInvestmentOrderRecord = Prisma.InvestmentOrderGetPayload<{
  select: typeof confirmedInvestmentOrderSelect;
}>;

type AdminHistoryInvestorRow = {
  id: string;
  name: string;
  email: string;
  confirmedOrdersCount: number;
  totalPrincipal: number;
  totalEarnedProfit: number;
  accountBalance: number;
  currency: string;
  latestPlanName: string;
  latestConfirmedAtLabel: string;
};

export type AdminHistoryData = {
  summary: {
    activeInvestors: number;
    confirmedOrders: number;
    totalPrincipal: number;
    totalEarnedProfit: number;
    totalAccountBalance: number;
    currency: string;
  };
  investors: AdminHistoryInvestorRow[];
};

export async function getAdminHistoryData(): Promise<AdminHistoryData> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const investorProfiles = await prisma.investorProfile.findMany({
    where: {
      investmentOrders: {
        some: {
          status: InvestmentOrderStatus.CONFIRMED,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      investmentOrders: {
        where: {
          status: InvestmentOrderStatus.CONFIRMED,
        },
        orderBy: {
          confirmedAt: "desc",
        },
        select: confirmedInvestmentOrderSelect,
      },
    },
  });

  const investorsWithSortKeys = investorProfiles
    .map((profile) => {
      const confirmedOrders = profile.investmentOrders as ConfirmedInvestmentOrderRecord[];
      const balanceSummary = calculateInvestmentAccountBalance(confirmedOrders);
      const latestOrder = confirmedOrders[0] ?? null;
      const currency = latestOrder?.currency ?? "USD";
      const latestConfirmedAt = latestOrder?.confirmedAt ?? null;

      return {
        id: profile.id,
        name: profile.user.name?.trim() || "Unnamed investor",
        email: profile.user.email,
        confirmedOrdersCount: confirmedOrders.length,
        totalPrincipal: balanceSummary.totalPrincipalNumber,
        totalEarnedProfit: balanceSummary.totalEarnedProfitsNumber,
        accountBalance: balanceSummary.accountBalanceNumber,
        currency,
        latestPlanName: latestOrder?.investmentPlan.name ?? "Not selected",
        latestConfirmedAtLabel: formatDateLabel(
          latestConfirmedAt,
          "Not confirmed yet",
        ),
        latestConfirmedAtSortKey: latestConfirmedAt?.getTime() ?? 0,
      };
    })
    .sort((left, right) => {
      if (right.accountBalance !== left.accountBalance) {
        return right.accountBalance - left.accountBalance;
      }

      if (right.confirmedOrdersCount !== left.confirmedOrdersCount) {
        return right.confirmedOrdersCount - left.confirmedOrdersCount;
      }

      if (right.latestConfirmedAtSortKey !== left.latestConfirmedAtSortKey) {
        return right.latestConfirmedAtSortKey - left.latestConfirmedAtSortKey;
      }

      return left.name.localeCompare(right.name);
    })
    .map(({ latestConfirmedAtSortKey, ...row }) => {
      void latestConfirmedAtSortKey;
      return row;
    });

  const summary = investorsWithSortKeys.reduce(
    (acc, investor) => {
      acc.confirmedOrders += investor.confirmedOrdersCount;
      acc.totalPrincipal += investor.totalPrincipal;
      acc.totalEarnedProfit += investor.totalEarnedProfit;
      acc.totalAccountBalance += investor.accountBalance;
      return acc;
    },
    {
      activeInvestors: investorsWithSortKeys.length,
      confirmedOrders: 0,
      totalPrincipal: 0,
      totalEarnedProfit: 0,
      totalAccountBalance: 0,
      currency: investorsWithSortKeys[0]?.currency ?? "USD",
    },
  );

  return {
    summary,
    investors: investorsWithSortKeys,
  };
}
