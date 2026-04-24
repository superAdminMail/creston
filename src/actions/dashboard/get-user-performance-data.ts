"use server";

import {
  InvestmentOrderStatus,
  Prisma,
  ReferralRewardStatus,
} from "@/generated/prisma";
import { formatDateLabel, formatEnumLabel } from "@/lib/formatters/formatters";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { getUserTransactions } from "@/lib/service/getUserTransactions";
import {
  decimalToNumber,
  sumDecimals,
  toDecimal,
} from "@/lib/services/investment/decimal";
import { computeInvestmentOrderCurrentValue } from "@/lib/services/investment/valuationService";
import { getPrices } from "@/lib/services/price/priceService";
import { redirect } from "next/navigation";

const ANALYTICS_MONTH_COUNT = 6;

type PerformanceOrderRecord = {
  id: string;
  amount: Prisma.Decimal;
  currency: string;
  investmentModel: "FIXED" | "MARKET";
  accruedProfit: Prisma.Decimal;
  units: Prisma.Decimal | null;
  currentValue: Prisma.Decimal | null;
  isMatured: boolean;
  confirmedAt: Date | null;
  createdAt: Date;
  investmentEarnings: Array<{
    amount: Prisma.Decimal;
    date: Date;
  }>;
  investmentPlan: {
    name: string;
    period: string;
    investment: {
      name: string;
      type: string;
      symbol: string | null;
    };
  };
};

export type UserPerformanceAsset = {
  orderId: string;
  name: string;
  planName: string;
  symbol: string | null;
  typeLabel: string;
  periodLabel: string;
  model: "FIXED" | "MARKET";
  value: number;
  principal: number;
  profit: number;
  profitPercent: number;
  isMatured: boolean;
};

export type UserPerformanceActivity = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  direction: "CREDIT" | "DEBIT";
  dateLabel: string;
  reference: string;
};

export type UserPerformanceAnalyticsPoint = {
  month: string;
  investedCapital: number;
  realizedProfit: number;
};

export type UserPerformanceData = {
  userName: string;
  summary: {
    totalPortfolioValue: number;
    totalProfit: number;
    changePercent: number;
    totalInvestedCapital: number;
    activeOrdersCount: number;
    maturedOrdersCount: number;
    profitableAssetsCount: number;
  };
  referral: {
    referralCode: string | null;
    referredUsersCount: number;
    creditedRewardsCount: number;
    pendingRewardsCount: number;
    totalRewards: number;
  };
  assets: UserPerformanceAsset[];
  activities: UserPerformanceActivity[];
  analytics: {
    monthly: UserPerformanceAnalyticsPoint[];
    allocation: Array<{
      name: string;
      value: number;
      profitPercent: number;
      model: "FIXED" | "MARKET";
    }>;
  };
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(date);
}

function getRecentMonthBuckets(count: number) {
  const currentMonth = startOfMonth(new Date());

  return Array.from({ length: count }, (_, index) => {
    const bucketDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - (count - index - 1),
      1,
    );

    return {
      key: `${bucketDate.getFullYear()}-${String(bucketDate.getMonth() + 1).padStart(2, "0")}`,
      label: formatMonthLabel(bucketDate),
      investedCapital: 0,
      realizedProfit: 0,
    };
  });
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function mapActivityTitle(type: "INVESTMENT" | "WITHDRAWAL" | "EARNING") {
  switch (type) {
    case "EARNING":
      return "Profit recorded";
    case "WITHDRAWAL":
      return "Withdrawal request";
    case "INVESTMENT":
    default:
      return "Investment order";
  }
}

export async function getUserPerformanceDataAction(): Promise<UserPerformanceData> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    redirect("/auth/login");
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
          currency: true,
          investmentModel: true,
          accruedProfit: true,
          units: true,
          currentValue: true,
          isMatured: true,
          confirmedAt: true,
          createdAt: true,
          investmentEarnings: {
            select: {
              amount: true,
              date: true,
            },
            orderBy: {
              date: "desc",
            },
          },
          investmentPlan: {
            select: {
              name: true,
              period: true,
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

  const orders = (investorProfile?.investmentOrders ??
    []) as PerformanceOrderRecord[];

  const [referralCodeRecord, referralRewardTotals, pendingReferralRewardsCount, referredUsersCount] =
    await Promise.all([
      prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          referralCode: true,
        },
      }),
      prisma.referralReward.aggregate({
        where: {
          userId: user.id,
          status: ReferralRewardStatus.CREDITED,
        },
        _sum: {
          amount: true,
        },
        _count: {
          _all: true,
        },
      }),
      prisma.referralReward.count({
        where: {
          userId: user.id,
          status: ReferralRewardStatus.PENDING,
        },
      }),
      prisma.referral.count({
        where: {
          referrerUserId: user.id,
        },
      }),
    ]);

  const symbols = Array.from(
    new Set(
      orders
        .filter((order) => order.investmentModel === "MARKET")
        .map((order) => order.investmentPlan.investment.symbol)
        .filter((symbol): symbol is string => Boolean(symbol)),
    ),
  );

  const livePrices = symbols.length
    ? await getPrices(symbols, { preferFreshDb: true })
    : {};

  const assets = orders
    .map<UserPerformanceAsset>((order) => {
      const symbol = order.investmentPlan.investment.symbol;
      const currentPrice = symbol ? (livePrices[symbol]?.price ?? null) : null;
      const currentValue = computeInvestmentOrderCurrentValue(
        order,
        currentPrice,
      );
      const realizedProfit =
        order.investmentModel === "FIXED"
          ? toDecimal(order.accruedProfit)
          : sumDecimals(
              order.investmentEarnings.map((earning) => earning.amount),
            );
      const principal = toDecimal(order.amount);

      return {
        orderId: order.id,
        name: order.investmentPlan.investment.name,
        planName: order.investmentPlan.name,
        symbol,
        typeLabel: formatEnumLabel(order.investmentPlan.investment.type),
        periodLabel: formatEnumLabel(order.investmentPlan.period),
        model: order.investmentModel,
        value: decimalToNumber(currentValue),
        principal: decimalToNumber(principal),
        profit: decimalToNumber(realizedProfit),
        profitPercent: principal.greaterThan(0)
          ? realizedProfit.div(principal).mul(100).toNumber()
          : 0,
        isMatured: order.isMatured,
      };
    })
    .sort((left, right) => right.value - left.value);

  const totalInvestedCapital = assets.reduce(
    (sum, asset) => sum + asset.principal,
    0,
  );
  const totalPortfolioValue = assets.reduce(
    (sum, asset) => sum + asset.value,
    0,
  );
  const totalProfit = assets.reduce((sum, asset) => sum + asset.profit, 0);

  const monthBuckets = getRecentMonthBuckets(ANALYTICS_MONTH_COUNT);
  const monthMap = new Map(monthBuckets.map((bucket) => [bucket.key, bucket]));

  for (const order of orders) {
    const orderDate = order.confirmedAt ?? order.createdAt;
    const bucket = monthMap.get(getMonthKey(orderDate));

    if (bucket) {
      bucket.investedCapital += decimalToNumber(order.amount);
    }

    for (const earning of order.investmentEarnings) {
      const earningBucket = monthMap.get(getMonthKey(earning.date));

      if (earningBucket) {
        earningBucket.realizedProfit += decimalToNumber(earning.amount);
      }
    }
  }

  const transactions = await getUserTransactions(user.id);
  const activities = transactions
    .filter(
      (
        transaction,
      ): transaction is typeof transaction & {
        type: "INVESTMENT" | "WITHDRAWAL" | "EARNING";
      } => transaction.type !== "SAVINGS",
    )
    .slice(0, 6)
    .map((transaction) => ({
      id: transaction.id,
      title: mapActivityTitle(transaction.type),
      subtitle:
        transaction.planName ??
        transaction.description ??
        `${formatEnumLabel(transaction.type)} activity`,
      amount: transaction.amount,
      direction: transaction.direction,
      dateLabel: formatDateLabel(transaction.createdAt),
      reference: transaction.reference,
    }));

  return {
    userName: user.name?.trim() || "Client",
    summary: {
      totalPortfolioValue,
      totalProfit,
      changePercent:
        totalInvestedCapital > 0
          ? (totalProfit / totalInvestedCapital) * 100
          : 0,
      totalInvestedCapital,
      activeOrdersCount: assets.filter((asset) => !asset.isMatured).length,
      maturedOrdersCount: assets.filter((asset) => asset.isMatured).length,
      profitableAssetsCount: assets.filter((asset) => asset.profit > 0).length,
    },
    referral: {
      referralCode: referralCodeRecord?.referralCode ?? null,
      referredUsersCount,
      creditedRewardsCount: referralRewardTotals._count._all,
      pendingRewardsCount: pendingReferralRewardsCount,
      totalRewards: decimalToNumber(referralRewardTotals._sum.amount ?? 0),
    },
    assets,
    activities,
    analytics: {
      monthly: monthBuckets.map((bucket) => ({
        month: bucket.label,
        investedCapital: bucket.investedCapital,
        realizedProfit: bucket.realizedProfit,
      })),
      allocation: assets.slice(0, 6).map((asset) => ({
        name: asset.symbol ? `${asset.name} (${asset.symbol})` : asset.name,
        value: asset.value,
        profitPercent: asset.profitPercent,
        model: asset.model,
      })),
    },
  };
}
