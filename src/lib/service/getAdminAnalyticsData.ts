import {
  InvestmentOrderPaymentStatus,
  InvestmentOrderStatus,
  KycStatus,
  SavingsTransactionType,
  WithdrawalStatus,
} from "@/generated/prisma";

import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";

const FUNDED_ORDER_STATUSES = [
  InvestmentOrderStatus.CONFIRMED,
  InvestmentOrderStatus.PAID,
  InvestmentOrderStatus.PARTIALLY_PAID,
] as const;

export type AdminAnalyticsMonthlyPoint = {
  month: string;
  savingsDeposits: number;
  investmentFunding: number;
  withdrawalVolume: number;
  earnings: number;
  newUsers: number;
  paymentReviews: number;
};

export type AdminAnalyticsQueueItem = {
  key: "investmentPayments" | "withdrawals" | "kyc" | "investmentOrders";
  label: string;
  value: number;
};

export type AdminAnalyticsData = {
  siteName: string;
  summary: {
    totalUsers: number;
    activeInvestors: number;
    activePlans: number;
    fundedOrders: number;
    totalCapitalTracked: number;
    totalEarnings: number;
    openReviewQueue: number;
    pendingWithdrawals: number;
    pendingKyc: number;
    pendingInvestmentPayments: number;
    pendingInvestmentOrders: number;
  };
  monthly: AdminAnalyticsMonthlyPoint[];
  reviewQueue: AdminAnalyticsQueueItem[];
};

function getMonthKeyUtc(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabelUtc(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function buildMonthlyBuckets(months = 12) {
  const now = new Date();
  const currentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startMonth = new Date(
    Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() - (months - 1), 1),
  );

  return Array.from({ length: months }, (_, index) => {
    const monthDate = new Date(
      Date.UTC(startMonth.getUTCFullYear(), startMonth.getUTCMonth() + index, 1),
    );

    return {
      key: getMonthKeyUtc(monthDate),
      month: formatMonthLabelUtc(monthDate),
      savingsDeposits: 0,
      investmentFunding: 0,
      withdrawalVolume: 0,
      earnings: 0,
      newUsers: 0,
      paymentReviews: 0,
    };
  });
}

export async function getAdminAnalyticsData(): Promise<AdminAnalyticsData> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const site = await getSiteSeoConfig();
  const now = new Date();
  const windowStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1),
  );

  const [
    totalUsers,
    activeInvestors,
    activePlans,
    fundedOrders,
    totalSavingsDeposits,
    totalFundedInvestmentVolume,
    totalEarnings,
    pendingWithdrawals,
    pendingKyc,
    pendingInvestmentPayments,
    pendingInvestmentOrders,
    monthlyUsers,
    monthlySavingsTransactions,
    monthlyInvestmentOrders,
    monthlyWithdrawals,
    monthlyEarnings,
    monthlyPaymentReviews,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: "USER",
      },
    }),
    prisma.investorProfile.count({
      where: {
        OR: [
          {
            investmentOrders: {
              some: {
                status: {
                  in: [...FUNDED_ORDER_STATUSES],
                },
              },
            },
          },
          {
            savingsAccounts: {
              some: {
                balance: {
                  gt: 0,
                },
              },
            },
          },
        ],
      },
    }),
    prisma.investmentPlan.count({
      where: {
        isActive: true,
      },
    }),
    prisma.investmentOrder.count({
      where: {
        status: {
          in: [...FUNDED_ORDER_STATUSES],
        },
      },
    }),
    prisma.savingsTransaction.aggregate({
      where: {
        type: SavingsTransactionType.DEPOSIT,
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.investmentOrder.aggregate({
      where: {
        status: {
          in: [...FUNDED_ORDER_STATUSES],
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.investmentEarning.aggregate({
      _sum: {
        amount: true,
      },
    }),
    prisma.withdrawalOrder.count({
      where: {
        status: WithdrawalStatus.PENDING,
      },
    }),
    prisma.investorProfile.count({
      where: {
        kycStatus: KycStatus.PENDING_REVIEW,
      },
    }),
    prisma.investmentOrderPayment.count({
      where: {
        status: InvestmentOrderPaymentStatus.PENDING_REVIEW,
      },
    }),
    prisma.investmentOrder.count({
      where: {
        status: {
          in: [InvestmentOrderStatus.PENDING_PAYMENT, InvestmentOrderStatus.PARTIALLY_PAID],
        },
      },
    }),
    prisma.user.findMany({
      where: {
        role: "USER",
        createdAt: {
          gte: windowStart,
        },
      },
      select: {
        createdAt: true,
      },
    }),
    prisma.savingsTransaction.findMany({
      where: {
        type: SavingsTransactionType.DEPOSIT,
        createdAt: {
          gte: windowStart,
        },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    }),
    prisma.investmentOrder.findMany({
      where: {
        status: {
          in: [...FUNDED_ORDER_STATUSES],
        },
        OR: [
          {
            confirmedAt: {
              gte: windowStart,
            },
          },
          {
            paidAt: {
              gte: windowStart,
            },
          },
          {
            createdAt: {
              gte: windowStart,
            },
          },
        ],
      },
      select: {
        amount: true,
        confirmedAt: true,
        paidAt: true,
        createdAt: true,
      },
    }),
    prisma.withdrawalOrder.findMany({
      where: {
        requestedAt: {
          gte: windowStart,
        },
      },
      select: {
        amount: true,
        requestedAt: true,
      },
    }),
    prisma.investmentEarning.findMany({
      where: {
        date: {
          gte: windowStart,
        },
      },
      select: {
        amount: true,
        date: true,
      },
    }),
    prisma.investmentOrderPayment.findMany({
      where: {
        submittedAt: {
          gte: windowStart,
        },
      },
      select: {
        submittedAt: true,
      },
    }),
  ]);

  const monthly = buildMonthlyBuckets();
  const monthIndex = new Map(monthly.map((item, index) => [item.key, index]));

  for (const item of monthlyUsers) {
    const bucket = monthly[monthIndex.get(getMonthKeyUtc(item.createdAt)) ?? -1];
    if (bucket) bucket.newUsers += 1;
  }

  for (const item of monthlySavingsTransactions) {
    const bucket = monthly[monthIndex.get(getMonthKeyUtc(item.createdAt)) ?? -1];
    if (bucket) bucket.savingsDeposits += decimalToNumber(item.amount);
  }

  for (const item of monthlyInvestmentOrders) {
    const bucketDate = item.confirmedAt ?? item.paidAt ?? item.createdAt;
    const bucket = monthly[monthIndex.get(getMonthKeyUtc(bucketDate)) ?? -1];
    if (bucket) bucket.investmentFunding += decimalToNumber(item.amount);
  }

  for (const item of monthlyWithdrawals) {
    const bucket = monthly[monthIndex.get(getMonthKeyUtc(item.requestedAt)) ?? -1];
    if (bucket) bucket.withdrawalVolume += decimalToNumber(item.amount);
  }

  for (const item of monthlyEarnings) {
    const bucket = monthly[monthIndex.get(getMonthKeyUtc(item.date)) ?? -1];
    if (bucket) bucket.earnings += decimalToNumber(item.amount);
  }

  for (const item of monthlyPaymentReviews) {
    const bucket = monthly[monthIndex.get(getMonthKeyUtc(item.submittedAt)) ?? -1];
    if (bucket) bucket.paymentReviews += 1;
  }

  const totalSavingsVolume = decimalToNumber(totalSavingsDeposits._sum.amount);
  const totalInvestmentVolume = decimalToNumber(totalFundedInvestmentVolume._sum.amount);
  const totalCapitalTracked = totalSavingsVolume + totalInvestmentVolume;
  const totalEarningsVolume = decimalToNumber(totalEarnings._sum.amount);
  const openReviewQueue =
    pendingWithdrawals +
    pendingKyc +
    pendingInvestmentPayments +
    pendingInvestmentOrders;

  return {
    siteName: site.siteName,
    summary: {
      totalUsers,
      activeInvestors,
      activePlans,
      fundedOrders,
      totalCapitalTracked,
      totalEarnings: totalEarningsVolume,
      openReviewQueue,
      pendingWithdrawals,
      pendingKyc,
      pendingInvestmentPayments,
      pendingInvestmentOrders,
    },
    monthly: monthly.map((point) => ({
      month: point.month,
      savingsDeposits: point.savingsDeposits,
      investmentFunding: point.investmentFunding,
      withdrawalVolume: point.withdrawalVolume,
      earnings: point.earnings,
      newUsers: point.newUsers,
      paymentReviews: point.paymentReviews,
    })),
    reviewQueue: [
      {
        key: "investmentPayments",
        label: "Investment payment reviews",
        value: pendingInvestmentPayments,
      },
      {
        key: "withdrawals",
        label: "Withdrawal requests",
        value: pendingWithdrawals,
      },
      {
        key: "kyc",
        label: "KYC reviews",
        value: pendingKyc,
      },
      {
        key: "investmentOrders",
        label: "Pending investment orders",
        value: pendingInvestmentOrders,
      },
    ],
  };
}
