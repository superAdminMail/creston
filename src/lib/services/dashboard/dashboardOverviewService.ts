import { formatDistanceToNow } from "date-fns";

import { formatCurrency } from "@/lib/formatters/formatters";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { prisma } from "@/lib/prisma";

type DashboardOverviewRoute =
  | "/account/dashboard/admin"
  | "/account/dashboard/super-admin"
  | "/account/dashboard/admin/moderator";

export type DashboardOverviewIconKey =
  | "users"
  | "userCheck"
  | "wallet"
  | "trendingUp"
  | "dollarSign"
  | "briefcaseBusiness"
  | "shieldCheck"
  | "landmark"
  | "creditCard"
  | "building2"
  | "banknote"
  | "alertTriangle";

export type DashboardOverviewAlertTone = "warning" | "critical";

export type DashboardOverviewAlert = {
  title: string;
  description: string;
  countLabel: string;
  tone: DashboardOverviewAlertTone;
  href: string;
  actionLabel: string;
  icon: DashboardOverviewIconKey;
};

type DashboardActivityStatus = "success" | "pending" | "info";
type DashboardStatusTone = "success" | "warning" | "neutral";

export type DashboardOverviewMetric = {
  title: string;
  value: string;
  description: string;
  icon: DashboardOverviewIconKey;
};

export type DashboardOverviewLinkCard = {
  title: string;
  description: string;
  href: string;
};

export type DashboardOverviewHighlight = {
  label: string;
  value: number;
};

export type DashboardOverviewSpotlight = {
  title: string;
  description: string;
  value: string;
  icon: DashboardOverviewIconKey;
};

export type DashboardOverviewActivity = {
  title: string;
  detail: string;
  time: string;
  status: DashboardActivityStatus;
};

export type DashboardOverviewStatusItem = {
  label: string;
  value: string;
  tone: DashboardStatusTone;
};

export type DashboardOverviewModuleLink = {
  label: string;
  href: string;
  icon: DashboardOverviewIconKey;
};

export type DashboardOverviewCta = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  label: string;
};

export type DashboardOverviewData = {
  badgeLabel: string;
  title: string;
  description: string;
  alertsTitle: string;
  alertsDescription: string;
  alerts: DashboardOverviewAlert[];
  heroHighlights: DashboardOverviewHighlight[];
  metrics: DashboardOverviewMetric[];
  quickActions: DashboardOverviewLinkCard[];
  spotlightTitle: string;
  spotlightDescription: string;
  spotlights: DashboardOverviewSpotlight[];
  activityTitle: string;
  activityDescription: string;
  activities: DashboardOverviewActivity[];
  statusTitle: string;
  statusDescription: string;
  statusItems: DashboardOverviewStatusItem[];
  modulesTitle: string;
  modulesDescription: string;
  moduleLinks: DashboardOverviewModuleLink[];
  cta: DashboardOverviewCta;
};

const FUNDED_INVESTMENT_ORDER_STATUSES = [
  "CONFIRMED",
  "PAID",
  "PARTIALLY_PAID",
] as const;

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getPercentageLabel(value: number) {
  const rounded = Math.abs(value).toFixed(1);

  if (value > 0) return `+${rounded}%`;
  if (value < 0) return `-${rounded}%`;
  return "0.0%";
}

function getMonthlyGrowthLabel(
  currentPeriodCount: number,
  previousPeriodCount: number,
) {
  if (previousPeriodCount === 0) {
    return currentPeriodCount > 0 ? "+100.0%" : "0.0%";
  }

  const growth =
    ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100;

  return getPercentageLabel(growth);
}

function formatActivityTime(value: Date | null | undefined) {
  if (!value) return "Live";

  return formatDistanceToNow(value, { addSuffix: true });
}

function toNumber(value: { toNumber(): number } | null | undefined) {
  return value?.toNumber() ?? 0;
}

function getStatusTone(
  pendingCount: number,
  healthyThreshold = 0,
): DashboardStatusTone {
  if (pendingCount <= healthyThreshold) {
    return "success";
  }

  if (pendingCount <= 10) {
    return "neutral";
  }

  return "warning";
}

export async function getDashboardOverviewByHref(
  href: DashboardOverviewRoute,
): Promise<DashboardOverviewData> {
  if (href === "/account/dashboard/super-admin") {
    await requireDashboardRoleAccess(["SUPER_ADMIN"]);
  } else {
    await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);
  }

  const site = await getSiteSeoConfig();
  const siteName = site.siteName;
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers,
    activeInvestors,
    fundedInvestmentOrdersCount,
    pendingInvestmentPayments,
    pendingSavingsPayments,
    paidInvestmentOrders,
    paidSavingsFundingIntents,
    pendingWithdrawals,
    processingWithdrawals,
    pendingKyc,
    approvedKyc,
    rejectedKyc,
    activePlans,
    activePlatformPaymentMethods,
    activeManagementMembers,
    savingsDepositAggregate,
    fundedInvestmentAggregate,
    currentMonthUsers,
    previousMonthUsers,
    latestPlan,
    latestPendingWithdrawal,
    latestVerifiedKyc,
    latestPlatformPaymentMethod,
    latestPendingKyc,
    latestDeposit,
    latestInvestmentOrder,
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
                  in: [...FUNDED_INVESTMENT_ORDER_STATUSES],
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
    prisma.investmentOrder.count({
      where: {
        status: {
          in: [...FUNDED_INVESTMENT_ORDER_STATUSES],
        },
      },
    }),
    prisma.investmentOrderPayment.count({
      where: {
        status: "PENDING_REVIEW",
      },
    }),
    prisma.savingsTransactionPayment.count({
      where: {
        status: "PENDING_REVIEW",
      },
    }),
    prisma.investmentOrder.findMany({
      where: {
        status: "PAID",
      },
      select: {
        amountPaid: true,
        amount: true,
      },
    }),
    prisma.savingsFundingIntent.count({
      where: {
        status: "PAID",
      },
    }),
    prisma.withdrawalOrder.count({
      where: {
        status: "PENDING",
      },
    }),
    prisma.withdrawalOrder.count({
      where: {
        status: "PROCESSING",
      },
    }),
    prisma.investorProfile.count({
      where: {
        kycStatus: "PENDING_REVIEW",
      },
    }),
    prisma.investorProfile.count({
      where: {
        kycStatus: "VERIFIED",
      },
    }),
    prisma.investorProfile.count({
      where: {
        kycStatus: "REJECTED",
      },
    }),
    prisma.investmentPlan.count({
      where: {
        isActive: true,
      },
    }),
    prisma.platformPaymentMethod.count({
      where: {
        isActive: true,
      },
    }),
    prisma.management.count({
      where: {
        isActive: true,
      },
    }),
    prisma.savingsTransaction.aggregate({
      where: {
        type: "DEPOSIT",
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.investmentOrder.aggregate({
      where: {
        status: {
          in: [...FUNDED_INVESTMENT_ORDER_STATUSES],
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: currentMonthStart,
        },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: previousMonthStart,
          lt: currentMonthStart,
        },
      },
    }),
    prisma.investmentPlan.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        name: true,
        createdAt: true,
      },
    }),
    prisma.withdrawalOrder.findFirst({
      where: {
        status: "PENDING",
      },
      orderBy: {
        requestedAt: "desc",
      },
      select: {
        amount: true,
        currency: true,
        requestedAt: true,
        investorProfile: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.investorProfile.findFirst({
      where: {
        kycStatus: "VERIFIED",
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        updatedAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.platformPaymentMethod.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        label: true,
        updatedAt: true,
        isDefault: true,
      },
    }),
    prisma.investorProfile.findFirst({
      where: {
        kycStatus: "PENDING_REVIEW",
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        updatedAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.savingsTransaction.findFirst({
      where: {
        type: "DEPOSIT",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        amount: true,
        currency: true,
        createdAt: true,
        savingsAccount: {
          select: {
            name: true,
            investorProfile: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.investmentOrder.findFirst({
      where: {
        status: {
          in: [...FUNDED_INVESTMENT_ORDER_STATUSES],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        amount: true,
        currency: true,
        createdAt: true,
        investmentPlan: {
          select: {
            name: true,
          },
        },
        investorProfile: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const savingsDeposits = toNumber(savingsDepositAggregate._sum.amount);
  const fundedInvestments = toNumber(fundedInvestmentAggregate._sum.amount);
  const totalDeposits = savingsDeposits + fundedInvestments;
  const monthlyGrowth = getMonthlyGrowthLabel(
    currentMonthUsers,
    previousMonthUsers,
  );
  const totalReviewedKyc = approvedKyc + pendingKyc + rejectedKyc;
  const kycApprovalRate =
    totalReviewedKyc > 0 ? (approvedKyc / totalReviewedKyc) * 100 : 0;
  const openWithdrawals = pendingWithdrawals + processingWithdrawals;

  if (href === "/account/dashboard/super-admin") {
    const alerts: DashboardOverviewAlert[] = [];

    if (pendingInvestmentPayments > 0) {
      alerts.push({
        title: "Investment payments pending review",
        description:
          "Investor payment proofs are still waiting for admin approval.",
        countLabel: `${formatCount(pendingInvestmentPayments)} open`,
        tone: "warning",
        href: "/account/dashboard/admin/investment-payments",
        actionLabel: "Review payments",
        icon: "wallet",
      });
    }

    if (pendingSavingsPayments > 0) {
      alerts.push({
        title: "Savings payments pending review",
        description:
          "Savings funding proofs are still waiting for admin approval.",
        countLabel: `${formatCount(pendingSavingsPayments)} open`,
        tone: "warning",
        href: "/account/dashboard/admin/savings-payments",
        actionLabel: "Review payments",
        icon: "wallet",
      });
    }

    if (paidInvestmentOrders.length > 0) {
      alerts.push({
        title: "Investment orders awaiting confirmation",
        description:
          "These orders are marked PAID and still need admin confirmation.",
        countLabel: `${formatCount(paidInvestmentOrders.length)} orders`,
        tone: "critical",
        href: "/account/dashboard/admin/investment-payments",
        actionLabel: "Review orders",
        icon: "alertTriangle",
      });
    }

    if (paidSavingsFundingIntents > 0) {
      alerts.push({
        title: "Savings funding awaiting crediting",
        description:
          "These funding intents are marked PAID and still need to be credited.",
        countLabel: `${formatCount(paidSavingsFundingIntents)} intents`,
        tone: "critical",
        href: "/account/dashboard/admin/savings-payments",
        actionLabel: "Review savings",
        icon: "alertTriangle",
      });
    }

    const activities: DashboardOverviewActivity[] = [
      latestPlan
        ? {
            title: "New investment plan added",
            detail: `${latestPlan.name} was added to the active catalog.`,
            time: formatActivityTime(latestPlan.createdAt),
            status: "success",
          }
        : {
            title: "Investment catalog is awaiting setup",
            detail:
              "Create your first investment plan to begin onboarding capital.",
            time: "Live",
            status: "info",
          },
      latestPendingWithdrawal
        ? {
            title: "Withdrawal request awaiting review",
            detail: `${
              latestPendingWithdrawal.investorProfile.user.name ?? "An investor"
            } requested ${formatCurrency(
              latestPendingWithdrawal.amount.toNumber(),
              latestPendingWithdrawal.currency,
            )}.`,
            time: formatActivityTime(latestPendingWithdrawal.requestedAt),
            status: "pending",
          }
        : {
            title: "Withdrawal queue is clear",
            detail: "There are no pending withdrawal requests right now.",
            time: "Live",
            status: "success",
          },
      latestVerifiedKyc
        ? {
            title: "KYC verification completed",
            detail: `${
              latestVerifiedKyc.user.name ?? "An investor"
            } was marked as verified.`,
            time: formatActivityTime(latestVerifiedKyc.updatedAt),
            status: "success",
          }
        : {
            title: "KYC approvals pending first review",
            detail:
              "Verified investor records will surface here as reviews complete.",
            time: "Live",
            status: "info",
          },
      latestPlatformPaymentMethod
        ? {
            title: latestPlatformPaymentMethod.isDefault
              ? "Default payment method updated"
              : "Platform payment method configuration touched",
            detail: `${latestPlatformPaymentMethod.label} is currently available for funding operations.`,
            time: formatActivityTime(latestPlatformPaymentMethod.updatedAt),
            status: "info",
          }
        : {
            title: "Platform payment methods still need setup",
            detail:
              "Add a platform payment method to support bank and crypto funding flows.",
            time: "Live",
            status: "pending",
          },
    ];

    return {
      badgeLabel: `${siteName} Super Admin`,
      title: "Platform control center",
      description:
        "Monitor investments, user growth, operational health, KYC activity, deposits, withdrawals, and platform-wide performance from one place.",
      alertsTitle: "Review alerts",
      alertsDescription:
        "Payments and settlements that still need administrative attention.",
      alerts,
      heroHighlights: [
        {
          label: "Total Deposits",
          value: totalDeposits,
        },
        {
          label: "Total Invested",
          value: fundedInvestments,
        },
      ],
      metrics: [
        {
          title: "Total Users",
          value: formatCount(totalUsers),
          description: "Registered accounts across the platform",
          icon: "users",
        },
        {
          title: "Active Investors",
          value: formatCount(activeInvestors),
          description: "Users currently holding active savings or investments",
          icon: "userCheck",
        },
        {
          title: "Pending Withdrawals",
          value: formatCount(pendingWithdrawals),
          description: "Requests waiting for super admin attention",
          icon: "wallet",
        },
        {
          title: "Monthly Growth",
          value: monthlyGrowth,
          description: "Net account growth against the previous month",
          icon: "trendingUp",
        },
      ],
      quickActions: [
        {
          title: "Manage Investment Products",
          description:
            "Create, update, or retire platform investment products.",
          href: "/account/dashboard/super-admin/investments",
        },
        {
          title: "Manage Investment Plans",
          description: "Adjust plan structure, pricing windows, and durations.",
          href: "/account/dashboard/super-admin/investment-plans",
        },
        {
          title: "Manage Leadership Profiles",
          description: "Update the public management team shown on the site.",
          href: "/account/dashboard/super-admin/management",
        },
        {
          title: "Platform Settings",
          description: "Keep branding, SEO, and site configuration aligned.",
          href: "/account/dashboard/super-admin/settings",
        },
      ],
      spotlightTitle: "Platform performance overview",
      spotlightDescription:
        `A live snapshot of capital, verification, and catalog readiness across ${siteName}.`,
      spotlights: [
        {
          title: "Capital Inflow",
          description: "Savings deposits plus funded investment order volume.",
          value: formatCurrency(totalDeposits),
          icon: "dollarSign",
        },
        {
          title: "Assets Under Management",
          description:
            "Currently funded investment capital across active orders.",
          value: formatCurrency(fundedInvestments),
          icon: "briefcaseBusiness",
        },
        {
          title: "Approved KYC",
          description: "Investor accounts that have completed verification.",
          value: formatCount(approvedKyc),
          icon: "shieldCheck",
        },
        {
          title: "Active Plans",
          description: "Investment plans currently available on the platform.",
          value: formatCount(activePlans),
          icon: "landmark",
        },
      ],
      activityTitle: "Recent administrative activity",
      activityDescription:
        "Important operational updates across the platform based on live records.",
      activities,
      statusTitle: "System status",
      statusDescription:
        "Operational visibility across critical platform control areas.",
      statusItems: [
        {
          label: "Investment Catalog",
          value:
            activePlans > 0
              ? `${formatCount(activePlans)} active`
              : "Needs setup",
          tone: activePlans > 0 ? "success" : "warning",
        },
        {
          label: "Withdrawal Queue",
          value:
            openWithdrawals > 0
              ? `${formatCount(openWithdrawals)} open`
              : "Clear",
          tone: getStatusTone(openWithdrawals),
        },
        {
          label: "KYC Review Pipeline",
          value:
            pendingKyc > 0 ? `${formatCount(pendingKyc)} pending` : "Healthy",
          tone: getStatusTone(pendingKyc),
        },
        {
          label: "Platform Payment Methods",
          value:
            activePlatformPaymentMethods > 0
              ? `${formatCount(activePlatformPaymentMethods)} active`
              : "Not configured",
          tone: activePlatformPaymentMethods > 0 ? "success" : "warning",
        },
        {
          label: "Management Team",
          value:
            activeManagementMembers > 0
              ? `${formatCount(activeManagementMembers)} published`
              : "Needs content",
          tone: activeManagementMembers > 0 ? "success" : "neutral",
        },
      ],
      modulesTitle: "Administrative modules",
      modulesDescription: `Fast access to core ${siteName} management areas.`,
      moduleLinks: [
        {
          label: "User Management",
          href: "/account/dashboard/super-admin/users",
          icon: "users",
        },
        {
          label: "Transactions",
          href: "/account/dashboard/super-admin/transactions",
          icon: "creditCard",
        },
        {
          label: "Platform Payment Methods",
          href: "/account/dashboard/super-admin/platform-wallets",
          icon: "wallet",
        },
        {
          label: "Site Settings",
          href: "/account/dashboard/super-admin/settings",
          icon: "building2",
        },
      ],
      cta: {
        eyebrow: "Platform readiness",
        title: "Keep operations efficient and compliant",
        description:
          "Monitor active capital, keep the investment catalog current, maintain platform settings, and stay ahead of pending reviews from one executive control layer.",
        href: "/account/dashboard/super-admin/settings",
        label: "Open platform settings",
      },
    };
  }

  const activities: DashboardOverviewActivity[] = [
    latestPendingKyc
      ? {
          title: "KYC submission awaiting review",
          detail: `${
            latestPendingKyc.user.name ?? "An investor"
          } is waiting for admin verification.`,
          time: formatActivityTime(latestPendingKyc.updatedAt),
          status: "pending",
        }
      : {
          title: "KYC review queue is clear",
          detail: "There are no investor profiles waiting for manual review.",
          time: "Live",
          status: "success",
        },
    latestPendingWithdrawal
      ? {
          title: "Withdrawal request pending",
          detail: `${
            latestPendingWithdrawal.investorProfile.user.name ?? "An investor"
          } requested ${formatCurrency(
            latestPendingWithdrawal.amount.toNumber(),
            latestPendingWithdrawal.currency,
          )}.`,
          time: formatActivityTime(latestPendingWithdrawal.requestedAt),
          status: "pending",
        }
      : {
          title: "Withdrawal desk is stable",
          detail: "No new withdrawal request is waiting in the review queue.",
          time: "Live",
          status: "success",
        },
    latestDeposit
      ? {
          title: "New savings deposit recorded",
          detail: `${
            latestDeposit.savingsAccount.investorProfile.user.name ??
            "An investor"
          } funded ${latestDeposit.savingsAccount.name} with ${formatCurrency(
            latestDeposit.amount.toNumber(),
            latestDeposit.currency,
          )}.`,
          time: formatActivityTime(latestDeposit.createdAt),
          status: "success",
        }
      : {
          title: "No savings deposit activity yet",
          detail: "Confirmed deposit activity will appear here as it lands.",
          time: "Live",
          status: "info",
        },
    latestInvestmentOrder
      ? {
          title: "Investment order funded",
          detail: `${
            latestInvestmentOrder.investorProfile.user.name ?? "An investor"
          } funded ${latestInvestmentOrder.investmentPlan.name} with ${formatCurrency(
            latestInvestmentOrder.amount.toNumber(),
            latestInvestmentOrder.currency,
          )}.`,
          time: formatActivityTime(latestInvestmentOrder.createdAt),
          status: "info",
        }
      : {
          title: "Investment operations awaiting first funded order",
          detail:
            "Funded investment orders will appear here for fast visibility.",
          time: "Live",
          status: "info",
        },
  ];

  return {
    badgeLabel: `${siteName} Admin`,
    title: "Administrative operations dashboard",
    description:
      "Oversee investor activity, monitor KYC submissions, manage withdrawals, track deposits, and keep day-to-day operations moving cleanly.",
    alertsTitle: "Review alerts",
    alertsDescription:
      "Payments and settlements that still need administrative attention.",
    alerts: (() => {
      const alerts: DashboardOverviewAlert[] = [];

      if (pendingInvestmentPayments > 0) {
        alerts.push({
          title: "Investment payments pending review",
          description:
            "Investor payment proofs are still waiting for admin approval.",
          countLabel: `${formatCount(pendingInvestmentPayments)} open`,
          tone: "warning",
          href: "/account/dashboard/admin/investment-payments",
          actionLabel: "Review payments",
          icon: "wallet",
        });
      }

      if (pendingSavingsPayments > 0) {
        alerts.push({
          title: "Savings payments pending review",
          description:
            "Savings funding proofs are still waiting for admin approval.",
          countLabel: `${formatCount(pendingSavingsPayments)} open`,
          tone: "warning",
          href: "/account/dashboard/admin/savings-payments",
          actionLabel: "Review payments",
          icon: "wallet",
        });
      }

      if (paidInvestmentOrders.length > 0) {
        alerts.push({
          title: "Investment orders awaiting confirmation",
          description:
            "These orders are marked PAID and still need admin confirmation.",
          countLabel: `${formatCount(paidInvestmentOrders.length)} orders`,
          tone: "critical",
          href: "/account/dashboard/admin/investment-payments",
          actionLabel: "Review orders",
          icon: "alertTriangle",
        });
      }

      if (paidSavingsFundingIntents > 0) {
        alerts.push({
          title: "Savings funding awaiting crediting",
          description:
            "These funding intents are marked PAID and still need to be credited.",
          countLabel: `${formatCount(paidSavingsFundingIntents)} intents`,
          tone: "critical",
          href: "/account/dashboard/admin/savings-payments",
          actionLabel: "Review savings",
          icon: "alertTriangle",
        });
      }

      return alerts;
    })(),
    heroHighlights: [
      {
        label: "Pending KYC",
        value: pendingKyc,
      },
      {
        label: "Pending Withdrawals",
        value: pendingWithdrawals,
      },
    ],
    metrics: [
      {
        title: "Total Users",
        value: formatCount(totalUsers),
        description: "Registered platform users",
        icon: "users",
      },
      {
        title: "Active Investors",
        value: formatCount(activeInvestors),
        description: "Users with live savings balances or funded investments",
        icon: "userCheck",
      },
      {
        title: "Total Deposits",
        value: formatCurrency(totalDeposits),
        description: "Savings deposits plus funded investment capital",
        icon: "dollarSign",
      },
      {
        title: "Monthly Growth",
        value: monthlyGrowth,
        description: "Account growth compared with the previous month",
        icon: "trendingUp",
      },
    ],
    quickActions: [
      {
        title: "Review Investor Profiles",
        description:
          "Inspect investor records, verification state, and account readiness.",
        href: "/account/dashboard/admin/investors",
      },
      {
        title: "Manage Investment Orders",
        description:
          "Track funded orders and keep investment operations in sync.",
        href: "/account/dashboard/admin/investment-orders",
      },
      {
        title: "Handle Withdrawals",
        description: "Review requests queued for operational processing.",
        href: "/account/dashboard/admin/Withdrawals",
      },
      {
        title: "Track Transactions",
        description:
          "Monitor platform-side financial movement across accounts.",
        href: "/account/dashboard/admin/transactions",
      },
    ],
    spotlightTitle: "Operations overview",
    spotlightDescription:
      "Live signals across verification, withdrawals, deposits, and funded order activity.",
    spotlights: [
      {
        title: "KYC Approval Rate",
        description:
          "Share of reviewed investor KYC records currently approved.",
        value: getPercentageLabel(kycApprovalRate),
        icon: "shieldCheck",
      },
      {
        title: "Pending Withdrawals",
        description:
          "Requests currently waiting for admin action or processing.",
        value: formatCount(openWithdrawals),
        icon: "wallet",
      },
      {
        title: "Deposit Monitoring",
        description:
          "Total recorded platform funding across savings and orders.",
        value: formatCurrency(totalDeposits),
        icon: "creditCard",
      },
      {
        title: "Active Investments",
        description: "Funded investment orders currently under administration.",
        value: formatCount(fundedInvestmentOrdersCount),
        icon: "briefcaseBusiness",
      },
    ],
    activityTitle: "Recent activity",
    activityDescription:
      "Latest KYC, withdrawal, deposit, and funding activity across the admin area.",
    activities,
    statusTitle: "Admin status",
    statusDescription: "Live visibility into important admin workflows.",
    statusItems: [
      {
        label: "KYC Review Queue",
        value: pendingKyc > 0 ? `${formatCount(pendingKyc)} pending` : "Clear",
        tone: getStatusTone(pendingKyc),
      },
      {
        label: "Withdrawals Desk",
        value:
          openWithdrawals > 0
            ? `${formatCount(openWithdrawals)} open`
            : "Stable",
        tone: getStatusTone(openWithdrawals),
      },
      {
        label: "Investment Operations",
        value:
          fundedInvestmentOrdersCount > 0
            ? `${formatCount(fundedInvestmentOrdersCount)} active`
            : "Awaiting activity",
        tone: fundedInvestmentOrdersCount > 0 ? "success" : "neutral",
      },
      {
        label: "Platform Payment Methods",
        value:
          activePlatformPaymentMethods > 0
            ? `${formatCount(activePlatformPaymentMethods)} active`
            : "Not configured",
        tone: activePlatformPaymentMethods > 0 ? "success" : "warning",
      },
    ],
    modulesTitle: "Admin modules",
    modulesDescription: "Navigate the core operational pages used every day.",
    moduleLinks: [
      {
        label: "Users",
        href: "/account/dashboard/admin/users",
        icon: "users",
      },
      {
        label: "Investor Profiles",
        href: "/account/dashboard/admin/investors",
        icon: "briefcaseBusiness",
      },
      {
        label: "Investment Accounts",
        href: "/account/dashboard/admin/investment-accounts",
        icon: "banknote",
      },
      {
        label: "Savings Accounts",
        href: "/account/dashboard/admin/savings-accounts",
        icon: "wallet",
      },
    ],
    cta: {
      eyebrow: "Admin workflow",
      title: "Stay ahead of operational tasks",
      description:
        "Keep investor reviews moving, watch incoming capital, and manage withdrawal flow with one consistent admin control surface.",
      href: "/account/dashboard/admin/investment-orders",
      label: "Open investment orders",
    },
  };
}
