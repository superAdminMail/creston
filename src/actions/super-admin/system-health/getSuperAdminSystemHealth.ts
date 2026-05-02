"use server";

import { formatDistanceToNow } from "date-fns";

import { DIDIT_STATUSES, isDiditSessionStale } from "@/lib/kyc/didit";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { prisma } from "@/lib/prisma";

export type HealthTone = "healthy" | "warning" | "critical";

export type SystemHealthIconKey =
  | "activity"
  | "database"
  | "creditCard"
  | "wallet"
  | "refreshCw"
  | "shieldCheck"
  | "bell"
  | "hardDrive"
  | "server"
  | "mail"
  | "files"
  | "waves"
  | "clock3"
  | "checkCircle2"
  | "alertTriangle"
  | "shieldAlert";

export type SystemHealthOverviewCard = {
  title: string;
  value: string;
  tone: HealthTone;
  description: string;
  meta: string;
  icon: SystemHealthIconKey;
};

export type SystemHealthQueueMetric = {
  label: string;
  count: number;
  helper: string;
};

export type SystemHealthIncident = {
  title: string;
  severity: HealthTone;
  description: string;
  time: string;
  owner: string;
};

export type SystemHealthIntegrityCheck = {
  label: string;
  count: number;
  tone: HealthTone;
  helper: string;
};

export type SystemHealthService = {
  name: string;
  status: string;
  tone: HealthTone;
  detail: string;
  icon: Exclude<SystemHealthIconKey, "activity" | "creditCard" | "wallet" | "bell" | "hardDrive">;
};

export type SystemHealthCronCard = {
  label: string;
  kind: "job" | "schedule";
  status: string;
  time: string;
  tone: HealthTone;
  icon: "refreshCw" | "shieldCheck" | "clock3";
};

export type SuperAdminSystemHealthData = {
  checkedAtLabel: string;
  overallState: {
    label: string;
    tone: HealthTone;
  };
  kycSignals: {
    pendingReview: number;
    verified: number;
    rejected: number;
    staleSessions: number;
    failedLast24h: number;
  };
  securitySignals: {
    suspendedUsers: number;
    pendingEmailVerification: number;
    recentAdminAuditActions: number;
  };
  overviewCards: SystemHealthOverviewCard[];
  queueMetrics: SystemHealthQueueMetric[];
  incidents: SystemHealthIncident[];
  integrityChecks: SystemHealthIntegrityCheck[];
  services: SystemHealthService[];
  cronCards: SystemHealthCronCard[];
};

const CRON_LOCK_STALE_AFTER_MS = 15 * 60 * 1000;
const CRYPTO_WEBHOOK_PENDING_AFTER_MS = 15 * 60 * 1000;
const WEBHOOK_FAILURE_LOOKBACK_MS = 24 * 60 * 60 * 1000;
const KYC_PENDING_REVIEW_STALE_AFTER_MS = 12 * 60 * 60 * 1000;
const KYC_FAILURE_LOOKBACK_MS = 24 * 60 * 60 * 1000;
const PROMOTION_LOOKBACK_MS = 24 * 60 * 60 * 1000;
const FILE_UPLOAD_LOOKBACK_MS = 24 * 60 * 60 * 1000;
const CRON_OVERDUE_AFTER_MS = 36 * 60 * 60 * 1000;

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatRelativeTime(value: Date | null | undefined) {
  if (!value) {
    return "Live";
  }

  return formatDistanceToNow(value, { addSuffix: true });
}

function formatUtcDateTime(value: Date | null | undefined) {
  if (!value) {
    return "—";
  }

  return `${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(value)} UTC`;
}

function getToneFromCount(
  value: number,
  thresholds: { warningAt: number; criticalAt?: number },
): HealthTone {
  if (typeof thresholds.criticalAt === "number" && value >= thresholds.criticalAt) {
    return "critical";
  }

  if (value >= thresholds.warningAt) {
    return "warning";
  }

  return "healthy";
}

function getStatusLabel(tone: HealthTone) {
  switch (tone) {
    case "healthy":
      return "Healthy";
    case "warning":
      return "Warning";
    case "critical":
      return "Critical";
  }
}

function isCronJobOverdue(lastRunAt: Date | null | undefined, now: Date) {
  if (!lastRunAt) {
    return true;
  }

  return now.getTime() - lastRunAt.getTime() > CRON_OVERDUE_AFTER_MS;
}

function getOverallTone(params: {
  failedWebhookEvents24h: number;
  unprocessedWebhookEvents: number;
  staleCronLocks: number;
  underfundedPaidInvestmentOrders: number;
  creditedSavingsWithoutTransactions: number;
  missingProviderReferences: number;
  approvedBankSubmissionsNotReflected: number;
  pendingInvestmentPayments: number;
  pendingSavingsPayments: number;
  pendingWithdrawals: number;
  pendingKyc: number;
  staleKycSessions: number;
  failedKycSessions24h: number;
  openSupportConversations: number;
  unreadNotifications: number;
  recentUploads: number;
  paymentoFailureTone: HealthTone;
  paymentQueueTone: HealthTone;
}) {
  if (
    params.failedWebhookEvents24h > 0 ||
    params.unprocessedWebhookEvents > 0 ||
    params.staleCronLocks > 0 ||
    params.underfundedPaidInvestmentOrders > 0 ||
    params.creditedSavingsWithoutTransactions > 0 ||
    params.missingProviderReferences > 0 ||
    params.approvedBankSubmissionsNotReflected > 0 ||
    params.paymentoFailureTone === "critical"
  ) {
    return "critical" as const;
  }

  if (
    params.pendingInvestmentPayments > 0 ||
    params.pendingSavingsPayments > 0 ||
    params.pendingWithdrawals > 0 ||
    params.pendingKyc > 0 ||
    params.staleKycSessions > 0 ||
    params.failedKycSessions24h > 0 ||
    params.openSupportConversations > 0 ||
    params.unreadNotifications > 10 ||
    params.recentUploads === 0 ||
    params.paymentQueueTone !== "healthy"
  ) {
    return "warning" as const;
  }

  return "healthy" as const;
}

function hasRecentRun(lastRunAt: Date | null | undefined, now: Date) {
  if (!lastRunAt) return false;

  return now.getTime() - lastRunAt.getTime() <= CRON_OVERDUE_AFTER_MS;
}

export async function getSuperAdminSystemHealth(): Promise<SuperAdminSystemHealthData> {
  await requireSuperAdminAccess();

  const now = new Date();
  const staleCronBefore = new Date(now.getTime() - CRON_LOCK_STALE_AFTER_MS);
  const staleWebhookBefore = new Date(
    now.getTime() - CRYPTO_WEBHOOK_PENDING_AFTER_MS,
  );
  const pendingReviewKycStaleBefore = new Date(
    now.getTime() - KYC_PENDING_REVIEW_STALE_AFTER_MS,
  );
  const failedWebhookLookback = new Date(
    now.getTime() - WEBHOOK_FAILURE_LOOKBACK_MS,
  );
  const failedKycLookback = new Date(now.getTime() - KYC_FAILURE_LOOKBACK_MS);
  const promotionLookback = new Date(now.getTime() - PROMOTION_LOOKBACK_MS);
  const fileUploadLookback = new Date(now.getTime() - FILE_UPLOAD_LOOKBACK_MS);

  const activeDiditStatuses = [
    DIDIT_STATUSES.NOT_STARTED,
    DIDIT_STATUSES.IN_PROGRESS,
    DIDIT_STATUSES.IN_REVIEW,
    DIDIT_STATUSES.RESUBMITTED,
  ];

  const failedDiditStatuses = [
    DIDIT_STATUSES.DECLINED,
    DIDIT_STATUSES.EXPIRED,
    DIDIT_STATUSES.ABANDONED,
    DIDIT_STATUSES.KYC_EXPIRED,
  ];

  const [
    sessions,
    investmentOrders,
    savingsFundingIntents,
  ] = await Promise.all([
    prisma.kycVerificationSession.findMany({
      select: {
        status: true,
        lastSyncedAt: true,
        updatedAt: true,
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
    prisma.savingsFundingIntent.findMany({
      where: {
        status: "CREDITED",
      },
      select: {
        transactions: {
          select: {
            id: true,
          },
        },
      },
    }),
  ]);

  const [
    pendingInvestmentPayments,
    pendingSavingsPayments,
    pendingWithdrawals,
    pendingKyc,
    verifiedKyc,
    rejectedKyc,
    unreadNotifications,
    recentNotifications,
    supportOpenConversations,
    failedWebhookEvents24h,
    unprocessedWebhookEvents,
    activePlatformPaymentMethods,
    totalFileAssets,
    recentUploads,
    activeSessions,
    totalUsers,
    suspendedUsers,
    pendingEmailVerification,
    recentAdminAuditActions,
    failedKycSessions24h,
    staleCronLocks,
    totalCronJobs,
    activeCronJobs,
    failedPromotionDeliveries,
    deliveredPromotionDeliveries,
    missingProviderReferences,
    approvedInvestmentBankSubmissionsNotReflected,
    latestFailedWebhookEvent,
    latestPendingKyc,
    latestPendingSavingsPayment,
    latestCronDailyAccrualJob,
    latestCronProfitSettlementJob,
    latestUpload,
    stalePendingReviewKyc,
    missingSavingsProviderReferences,
    approvedSavingsNotReflected,
  ] = await Promise.all([
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
    prisma.withdrawalOrder.count({
      where: {
        status: "PENDING",
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
    prisma.notification.count({
      where: {
        read: false,
      },
    }),
    prisma.notification.count({
      where: {
        createdAt: {
          gte: fileUploadLookback,
        },
      },
    }),
    prisma.conversation.count({
      where: {
        type: "SUPPORT",
        status: {
          in: ["OPEN", "WAITING"],
        },
      },
    }),
    prisma.cryptoWebhookEvent.count({
      where: {
        processingStatus: "FAILED",
        receivedAt: {
          gte: failedWebhookLookback,
        },
      },
    }),
    prisma.cryptoWebhookEvent.count({
      where: {
        processingStatus: "RECEIVED",
        receivedAt: {
          lt: staleWebhookBefore,
        },
      },
    }),
    prisma.platformPaymentMethod.count({
      where: {
        isActive: true,
      },
    }),
    prisma.fileAsset.count(),
    prisma.fileAsset.count({
      where: {
        createdAt: {
          gte: fileUploadLookback,
        },
      },
    }),
    prisma.session.count({
      where: {
        expiresAt: {
          gt: now,
        },
      },
    }),
    prisma.user.count(),
    prisma.user.count({
      where: {
        accountStatus: "SUSPENDED",
      },
    }),
    prisma.user.count({
      where: {
        OR: [
          {
            emailVerified: false,
          },
          {
            accountStatus: "PENDING_VERIFICATION",
          },
        ],
      },
    }),
    prisma.auditLog.count({
      where: {
        createdAt: {
          gte: fileUploadLookback,
        },
        actorUser: {
          role: {
            in: ["ADMIN", "SUPER_ADMIN"],
          },
        },
      },
    }),
    prisma.kycVerificationSession.count({
      where: {
        status: {
          in: failedDiditStatuses,
        },
        updatedAt: {
          gte: failedKycLookback,
        },
      },
    }),
    prisma.cronLock.count({
      where: {
        lockedAt: {
          gt: new Date(0),
          lt: staleCronBefore,
        },
      },
    }),
    prisma.cronJob.count(),
    prisma.cronJob.count({
      where: {
        isRunning: true,
      },
    }),
    prisma.promotionDelivery.count({
      where: {
        channel: "EMAIL",
        status: "FAILED",
        createdAt: {
          gte: promotionLookback,
        },
      },
    }),
    prisma.promotionDelivery.count({
      where: {
        channel: "EMAIL",
        status: {
          in: ["DELIVERED", "READ"],
        },
        createdAt: {
          gte: promotionLookback,
        },
      },
    }),
    prisma.cryptoFundingIntent.count({
      where: {
        provider: "PAYMENTO",
        OR: [
          {
            providerSessionId: null,
          },
          {
            providerReference: null,
          },
        ],
      },
    }),
    prisma.investmentOrderPayment.count({
      where: {
        status: "APPROVED",
        investmentOrder: {
          status: {
            notIn: ["PARTIALLY_PAID", "PAID"],
          },
        },
      },
    }),
    prisma.cryptoWebhookEvent.findFirst({
      where: {
        processingStatus: "FAILED",
        receivedAt: {
          gte: failedWebhookLookback,
        },
      },
      orderBy: {
        receivedAt: "desc",
      },
      select: {
        receivedAt: true,
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
      },
    }),
    prisma.savingsTransactionPayment.findFirst({
      where: {
        status: "PENDING_REVIEW",
      },
      orderBy: {
        submittedAt: "desc",
      },
      select: {
        submittedAt: true,
      },
    }),
    prisma.cronJob.findUnique({
      where: {
        key: "investment-fixed-accrual",
      },
      select: {
        lastRunAt: true,
        nextRunAt: true,
        isRunning: true,
      },
    }),
    prisma.cronJob.findUnique({
      where: {
        key: "investment-market-settlement",
      },
      select: {
        lastRunAt: true,
        nextRunAt: true,
        isRunning: true,
      },
    }),
    prisma.fileAsset.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
      },
    }),
    prisma.investorProfile.count({
      where: {
        kycStatus: "PENDING_REVIEW",
        updatedAt: {
          lt: pendingReviewKycStaleBefore,
        },
      },
    }),
    prisma.savingsFundingIntent.count({
      where: {
        fundingMethodType: "CRYPTO_PROVIDER",
        provider: "PAYMENTO",
        OR: [
          {
            providerSessionId: null,
          },
          {
            providerReference: null,
          },
        ],
      },
    }),
    prisma.savingsTransactionPayment.count({
      where: {
        status: "APPROVED",
        savingsFundingIntent: {
          status: {
            notIn: ["PARTIALLY_PAID", "CREDITED"],
          },
        },
      },
    }),
  ]);

  const staleVerificationSessions = sessions.filter((session) => {
    const sessionStatus = session.status?.trim() || null;
    const isActiveSession = activeDiditStatuses.includes(
      sessionStatus as (typeof activeDiditStatuses)[number],
    );

    return (
      isActiveSession &&
      (session.lastSyncedAt
        ? isDiditSessionStale(session.lastSyncedAt)
        : isDiditSessionStale(session.updatedAt))
    );
  }).length;

  const staleKycSessions = staleVerificationSessions + stalePendingReviewKyc;

  const underfundedPaidInvestmentOrders = investmentOrders.filter((order) =>
    order.amountPaid.lt(order.amount),
  ).length;

  const creditedSavingsWithoutTransactions = savingsFundingIntents.filter(
    (intent) => intent.transactions.length === 0,
  ).length;

  const missingProviderReferenceCount =
    missingProviderReferences + missingSavingsProviderReferences;

  const approvedBankSubmissionsNotReflectedTotal =
    approvedInvestmentBankSubmissionsNotReflected + approvedSavingsNotReflected;

  const latestFailedWebhookTime = latestFailedWebhookEvent?.receivedAt ?? null;
  const latestPendingKycTime = latestPendingKyc?.updatedAt ?? null;
  const latestPendingSavingsPaymentTime = latestPendingSavingsPayment?.submittedAt ?? null;
  const latestCronRunAt =
    latestCronDailyAccrualJob?.lastRunAt ??
    latestCronProfitSettlementJob?.lastRunAt ??
    null;
  const nextCronRunAt = (() => {
    const candidates = [
      latestCronDailyAccrualJob?.nextRunAt,
      latestCronProfitSettlementJob?.nextRunAt,
    ].filter((value): value is Date => Boolean(value));

    if (candidates.length === 0) return null;

    return candidates.reduce((earliest, candidate) =>
      candidate.getTime() < earliest.getTime() ? candidate : earliest,
    );
  })();

  const paymentQueueTone = getToneFromCount(
    pendingInvestmentPayments + pendingSavingsPayments,
    {
      warningAt: 1,
      criticalAt: 20,
    },
  );

  const kycTone = getToneFromCount(pendingKyc + staleKycSessions, {
    warningAt: 1,
    criticalAt: 25,
  });

  const webhookTone =
    failedWebhookEvents24h > 0
      ? "critical"
      : unprocessedWebhookEvents > 0
        ? "warning"
        : "healthy";

  const cronTone =
    staleCronLocks > 0 ||
    !hasRecentRun(latestCronDailyAccrualJob?.lastRunAt, now) ||
    !hasRecentRun(latestCronProfitSettlementJob?.lastRunAt, now)
      ? "warning"
      : "healthy";

  const overallTone = getOverallTone({
    failedWebhookEvents24h,
    unprocessedWebhookEvents,
    staleCronLocks,
    underfundedPaidInvestmentOrders,
    creditedSavingsWithoutTransactions,
    missingProviderReferences: missingProviderReferenceCount,
    approvedBankSubmissionsNotReflected: approvedBankSubmissionsNotReflectedTotal,
    pendingInvestmentPayments,
    pendingSavingsPayments,
    pendingWithdrawals,
    pendingKyc,
    staleKycSessions,
    failedKycSessions24h,
    openSupportConversations: supportOpenConversations,
    unreadNotifications,
    recentUploads,
    paymentoFailureTone: webhookTone,
    paymentQueueTone,
  });

  const overallStateLabel = getStatusLabel(overallTone);

  const overviewCards: SystemHealthOverviewCard[] = [
    {
      title: "Overall platform health",
      value: overallStateLabel,
      tone: overallTone,
      description:
        overallTone === "healthy"
          ? "Core systems are healthy and no immediate intervention is required."
          : overallTone === "warning"
            ? "Core systems are online, but a few queues and checks need attention."
            : "One or more monitored subsystems need immediate attention.",
      meta: `Checked ${formatUtcDateTime(now)}`,
      icon: "activity",
    },
    {
      title: "Database",
      value: staleCronLocks > 0 ? "Warning" : "Healthy",
      tone: staleCronLocks > 0 ? "warning" : "healthy",
      description:
        `${formatCount(totalCronJobs)} cron job record(s) and ${formatCount(staleCronLocks)} stale lock(s) are currently tracked.`,
      meta: `${formatCount(activeCronJobs)} cron job(s) running`,
      icon: "database",
    },
    {
      title: "Payments",
      value: paymentQueueTone === "healthy" ? "Healthy" : "Warning",
      tone: paymentQueueTone,
      description:
        `${formatCount(pendingInvestmentPayments)} investment and ${formatCount(pendingSavingsPayments)} savings submissions are waiting review.`,
      meta: `${formatCount(pendingWithdrawals)} withdrawals queued`,
      icon: "creditCard",
    },
    {
      title: "Crypto webhooks",
      value: getStatusLabel(webhookTone),
      tone: webhookTone,
      description:
        `${formatCount(failedWebhookEvents24h)} failed and ${formatCount(unprocessedWebhookEvents)} pending webhook event(s) in the last 24 hours.`,
      meta: `Latest issue ${formatRelativeTime(latestFailedWebhookTime)}`,
      icon: "wallet",
    },
    {
      title: "Jobs & cron",
      value: cronTone === "healthy" ? "Healthy" : "Warning",
      tone: cronTone,
      description:
        `${formatCount(activeCronJobs)} cron job record(s) are active and ${formatCount(staleCronLocks)} lock(s) appear stale.`,
      meta: nextCronRunAt
        ? `Next expected run ${formatUtcDateTime(nextCronRunAt)}`
        : "No next run scheduled",
      icon: "refreshCw",
    },
    {
      title: "KYC verification",
      value: kycTone === "healthy" ? "Healthy" : "Warning",
      tone: kycTone,
      description:
        `${formatCount(pendingKyc)} pending review record(s) and ${formatCount(staleKycSessions)} stale verification session(s).`,
      meta: `${formatCount(verifiedKyc)} verified, ${formatCount(rejectedKyc)} rejected`,
      icon: "shieldCheck",
    },
    {
      title: "Notifications",
      value: unreadNotifications > 20 ? "Warning" : "Healthy",
      tone: unreadNotifications > 20 ? "warning" : "healthy",
      description:
        `${formatCount(unreadNotifications)} unread notification(s) and ${formatCount(recentNotifications)} new notification(s) in the last 24 hours.`,
      meta: `${formatCount(recentNotifications)} new in 24h`,
      icon: "bell",
    },
    {
      title: "Storage",
      value: recentUploads > 0 ? "Healthy" : "Warning",
      tone: recentUploads > 0 ? "healthy" : "warning",
      description:
        `${formatCount(recentUploads)} upload(s) landed in the last 24 hours across ${formatCount(totalFileAssets)} stored file asset(s).`,
      meta: latestUpload
        ? `Latest upload ${formatRelativeTime(latestUpload.createdAt)}`
        : "No recent uploads",
      icon: "hardDrive",
    },
  ];

  const queueMetrics: SystemHealthQueueMetric[] = [
    {
      label: "Investment bank payments pending review",
      count: pendingInvestmentPayments,
      helper: "User-submitted bank deposits awaiting admin action.",
    },
    {
      label: "Savings bank payments pending review",
      count: pendingSavingsPayments,
      helper: "Savings funding bank submissions still awaiting review.",
    },
    {
      label: "Pending withdrawals",
      count: pendingWithdrawals,
      helper: "Withdrawal orders waiting for review or payout processing.",
    },
    {
      label: "KYC pending review",
      count: pendingKyc,
      helper: "Verification records currently waiting for compliance review.",
    },
    {
      label: "Open support conversations",
      count: supportOpenConversations,
      helper: "Open or waiting support threads that still need follow-up.",
    },
    {
      label: "Failed crypto webhook events",
      count: failedWebhookEvents24h,
      helper: "Webhook deliveries that failed processing and need inspection.",
    },
  ];

  const incidents: SystemHealthIncident[] = [
    pendingSavingsPayments > 0
      ? {
          title: "Savings payment review backlog rising",
          severity:
            pendingSavingsPayments > 10 ? "critical" : ("warning" as const),
          description:
            "Savings bank submissions have crossed the internal comfort threshold and should be cleared soon.",
          time: formatRelativeTime(latestPendingSavingsPaymentTime),
          owner: "Treasury Ops",
        }
      : {
          title: "Savings payment review queue is clear",
          severity: "healthy",
          description:
            "There are no savings bank submissions waiting for manual review.",
          time: "Live",
          owner: "Treasury Ops",
        },
    staleKycSessions > 0
      ? {
          title: "Stale KYC sessions detected",
          severity: "warning",
          description:
            "Some verification sessions have not synced back recently and may need manual reconciliation.",
          time: formatRelativeTime(latestPendingKycTime),
          owner: "Compliance",
        }
      : {
          title: "KYC sessions are fresh",
          severity: "healthy",
          description:
            "No stale verification sessions were detected in the latest scan.",
          time: "Live",
          owner: "Compliance",
        },
    failedWebhookEvents24h > 0
      ? {
          title: "Paymento webhook processing failure",
          severity: "critical",
          description:
            "A verified crypto callback failed downstream settlement and should be inspected.",
          time: formatRelativeTime(latestFailedWebhookTime),
          owner: "Engineering",
        }
      : {
          title: "Paymento webhook processing is healthy",
          severity: "healthy",
          description:
            "No failed crypto webhook events were detected in the last 24 hours.",
          time: "Live",
          owner: "Engineering",
        },
    latestCronRunAt && hasRecentRun(latestCronRunAt, now)
      ? {
          title: "Daily accrual completed successfully",
          severity: "healthy",
          description:
            "The daily accrual job finished with no duplicate-settlement warnings.",
          time: formatRelativeTime(latestCronRunAt),
          owner: "Jobs",
        }
      : {
          title: "Cron jobs need attention",
          severity: "warning",
          description:
            "At least one scheduled job has not reported a fresh run within the expected window.",
          time: latestCronRunAt ? formatRelativeTime(latestCronRunAt) : "Live",
          owner: "Jobs",
        },
  ];

  const integrityChecks: SystemHealthIntegrityCheck[] = [
    {
      label: "Paid investment orders with underfunded amountPaid",
      count: underfundedPaidInvestmentOrders,
      tone: underfundedPaidInvestmentOrders > 0 ? "critical" : "healthy",
      helper:
        "Orders marked paid should always have amountPaid that matches the order total.",
    },
    {
      label: "Credited savings intents without savings transaction",
      count: creditedSavingsWithoutTransactions,
      tone: creditedSavingsWithoutTransactions > 0 ? "critical" : "healthy",
      helper:
        "Every credited savings funding intent should produce a ledger transaction.",
    },
    {
      label: "Approved bank submissions not reflected on target",
      count: approvedBankSubmissionsNotReflectedTotal,
      tone: approvedBankSubmissionsNotReflectedTotal > 0 ? "warning" : "healthy",
      helper:
        "Approved records that may not have fully updated the linked order or savings target.",
    },
    {
      label: "Active cron locks older than expected",
      count: staleCronLocks,
      tone: staleCronLocks > 0 ? "warning" : "healthy",
      helper: "Long-running cron locks may indicate stuck daily jobs.",
    },
    {
      label: "Funding intents missing provider reference",
      count: missingProviderReferenceCount,
      tone: missingProviderReferenceCount > 0 ? "warning" : "healthy",
      helper:
        "Payment records should have a provider session or external reference for traceability.",
    },
    {
      label: "Unprocessed webhook events beyond threshold",
      count: unprocessedWebhookEvents,
      tone: unprocessedWebhookEvents > 0 ? "critical" : "healthy",
      helper:
        "Webhook records stuck too long can delay order or savings settlement.",
    },
  ];

  const services: SystemHealthService[] = [
    {
      name: "App API",
      status: "Operational",
      tone: "healthy",
      detail:
        `${formatCount(totalUsers)} user record(s), ${formatCount(activePlatformPaymentMethods)} active payment method(s), and live dashboard reads are available.`,
      icon: "server",
    },
    {
      name: "Better Auth",
      status: activeSessions > 0 ? "Operational" : "Warning",
      tone: "healthy",
      detail: `${formatCount(activeSessions)} active session(s) are currently tracked.`,
      icon: "shieldCheck",
    },
    {
      name: "Database",
      status: staleCronLocks > 0 ? "Degraded" : "Operational",
      tone: staleCronLocks > 0 ? "warning" : "healthy",
      detail: `${formatCount(totalCronJobs)} cron job record(s) and ${formatCount(staleCronLocks)} stale lock(s) are currently tracked.`,
      icon: "database",
    },
    {
      name: "Paymento",
      status:
        failedWebhookEvents24h > 0 || unprocessedWebhookEvents > 0
          ? "Degraded"
          : "Operational",
      tone:
        failedWebhookEvents24h > 0 || unprocessedWebhookEvents > 0
          ? failedWebhookEvents24h > 0
            ? "critical"
            : "warning"
          : "healthy",
      detail: `${formatCount(failedWebhookEvents24h)} failed webhook event(s) and ${formatCount(unprocessedWebhookEvents)} pending event(s) in the last 24 hours.`,
      icon: "waves",
    },
    {
      name: "Email delivery",
      status:
        failedPromotionDeliveries > 0 ? "Degraded" : "Operational",
      tone: failedPromotionDeliveries > 0 ? "warning" : "healthy",
      detail: `${formatCount(deliveredPromotionDeliveries)} delivered and ${formatCount(failedPromotionDeliveries)} failed email delivery record(s) in the last 24 hours.`,
      icon: "mail",
    },
    {
      name: "File assets",
      status: recentUploads > 0 ? "Operational" : "Warning",
      tone: recentUploads > 0 ? "healthy" : "warning",
      detail: `${formatCount(recentUploads)} upload(s) in the last 24 hours across ${formatCount(totalFileAssets)} stored file asset(s).`,
      icon: "files",
    },
  ];

  const cronCards: SystemHealthCronCard[] = [
    {
      label: "Daily accrual",
      kind: "job",
      status: latestCronDailyAccrualJob?.lastRunAt
        ? "Completed successfully"
        : "Awaiting first successful run",
      time: latestCronDailyAccrualJob?.lastRunAt
        ? `Last run: ${formatUtcDateTime(latestCronDailyAccrualJob.lastRunAt)}`
        : "No successful run recorded yet",
      tone:
        latestCronDailyAccrualJob?.lastRunAt &&
        !isCronJobOverdue(latestCronDailyAccrualJob.lastRunAt, now)
          ? "healthy"
          : "warning",
      icon: "refreshCw",
    },
    {
      label: "Profit settlement",
      kind: "job",
      status: latestCronProfitSettlementJob?.lastRunAt
        ? "Completed successfully"
        : "Awaiting first successful run",
      time: latestCronProfitSettlementJob?.lastRunAt
        ? `Last run: ${formatUtcDateTime(latestCronProfitSettlementJob.lastRunAt)}`
        : "No successful run recorded yet",
      tone:
        latestCronProfitSettlementJob?.lastRunAt &&
        !isCronJobOverdue(latestCronProfitSettlementJob.lastRunAt, now)
          ? "healthy"
          : "warning",
      icon: "shieldCheck",
    },
    {
      label: "Next expected run",
      kind: "schedule",
      status: nextCronRunAt ? "Scheduled" : "Pending setup",
      time: nextCronRunAt
        ? formatUtcDateTime(nextCronRunAt)
        : "No next run scheduled",
      tone: nextCronRunAt ? "healthy" : "warning",
      icon: "clock3",
    },
  ];

  return {
    checkedAtLabel: formatUtcDateTime(now),
    overallState: {
      label: overallStateLabel,
      tone: overallTone,
    },
    kycSignals: {
      pendingReview: pendingKyc,
      verified: verifiedKyc,
      rejected: rejectedKyc,
      staleSessions: staleKycSessions,
      failedLast24h: failedKycSessions24h,
    },
    securitySignals: {
      suspendedUsers,
      pendingEmailVerification,
      recentAdminAuditActions,
    },
    overviewCards,
    queueMetrics,
    incidents,
    integrityChecks,
    services,
    cronCards,
  };
}
