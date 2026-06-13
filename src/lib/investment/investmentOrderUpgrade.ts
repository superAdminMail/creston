import {
  Prisma,
  RuntimeStatus,
  type InvestmentOrderUpgradeStatus,
} from "@/generated/prisma";

import { asJsonObject, toJsonValue } from "@/lib/payments/paymentJson";
import { isInactiveInvestmentOrderRuntimeStatus } from "@/lib/investment/formatInvestmentOrderRuntimeStatusLabel";

export type InvestmentOrderUpgradeSettings = {
  status: InvestmentOrderUpgradeStatus;
  allowUpgrade: boolean;
  amount: number | null;
  paymentId: string | null;
  requestedAt: string | null;
  reviewedAt: string | null;
};

function parsePositiveNumber(value: unknown): number | null {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : null;

  if (numeric === null || !Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return numeric;
}

function parseIsoString(value: unknown): string | null {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function parseUpgradeStatus(
  value: unknown,
): InvestmentOrderUpgradeStatus | null {
  return value === "DISABLED" ||
    value === "AVAILABLE" ||
    value === "PENDING_REVIEW" ||
    value === "APPROVED" ||
    value === "REJECTED"
    ? value
    : null;
}

function resolveLegacyUpgradeStatus(metadata: Record<string, unknown>): InvestmentOrderUpgradeStatus {
  const legacyUpgrade = asJsonObject(metadata.upgrade);
  const allowUpgrade = legacyUpgrade.allowUpgrade === true;
  const amount = parsePositiveNumber(legacyUpgrade.amount);
  const approvedAt = parseIsoString(legacyUpgrade.approvedAt);
  const pendingPaymentId = parseIsoString(legacyUpgrade.pendingPaymentId);

  if (!allowUpgrade || amount === null) {
    return "DISABLED";
  }

  if (approvedAt !== null) {
    return "APPROVED";
  }

  if (pendingPaymentId !== null) {
    return "PENDING_REVIEW";
  }

  return "AVAILABLE";
}

function readUpgradeFields(
  source: {
    upgradeStatus?: string | null;
    upgradeAmount?: unknown;
    upgradePaymentId?: string | null;
    upgradeRequestedAt?: string | Date | null;
    upgradeReviewedAt?: string | Date | null;
    paymentMetadata?: unknown;
  } | null | undefined,
) {
  const metadata = asJsonObject(source?.paymentMetadata);
  const legacyUpgrade = asJsonObject(metadata.upgrade);
  const status =
    parseUpgradeStatus(source?.upgradeStatus) ??
    resolveLegacyUpgradeStatus(metadata);
  const amount =
    parsePositiveNumber(source?.upgradeAmount) ??
    parsePositiveNumber(legacyUpgrade.amount);

  return {
    status,
    allowUpgrade: status !== "DISABLED",
    amount,
    paymentId:
      source?.upgradePaymentId ??
      parseIsoString(legacyUpgrade.pendingPaymentId),
    requestedAt:
      parseIsoString(source?.upgradeRequestedAt) ??
      parseIsoString(legacyUpgrade.submittedAt),
    reviewedAt:
      parseIsoString(source?.upgradeReviewedAt) ??
      parseIsoString(legacyUpgrade.approvedAt),
  };
}

export function getInvestmentOrderUpgradeSettings(
  source:
    | {
        upgradeStatus?: string | null;
        upgradeAmount?: unknown;
        upgradePaymentId?: string | null;
        upgradeRequestedAt?: string | Date | null;
        upgradeReviewedAt?: string | Date | null;
        paymentMetadata?: unknown;
      }
    | unknown,
): InvestmentOrderUpgradeSettings {
  if (!source || typeof source !== "object") {
    return {
      status: "DISABLED",
      allowUpgrade: false,
      amount: null,
      paymentId: null,
      requestedAt: null,
      reviewedAt: null,
    };
  }

  const read = readUpgradeFields(source as Record<string, unknown>);

  return {
    status: read.status,
    allowUpgrade: read.allowUpgrade,
    amount: read.amount,
    paymentId: read.paymentId,
    requestedAt: read.requestedAt,
    reviewedAt: read.reviewedAt,
  };
}

export function hasInvestmentOrderUpgradeOffer(
  runtimeStatus: string,
  source:
    | {
        upgradeStatus?: string | null;
        upgradeAmount?: unknown;
        upgradePaymentId?: string | null;
        upgradeRequestedAt?: string | Date | null;
        upgradeReviewedAt?: string | Date | null;
        paymentMetadata?: unknown;
      }
    | unknown,
) {
  const settings = getInvestmentOrderUpgradeSettings(source);

  return (
    isInactiveInvestmentOrderRuntimeStatus(runtimeStatus) &&
    settings.status === "AVAILABLE" &&
    settings.amount !== null &&
    settings.paymentId === null
  );
}

export function isInvestmentOrderUpgraded(
  runtimeStatus: string,
  source:
    | {
        upgradeStatus?: string | null;
        upgradeAmount?: unknown;
        upgradePaymentId?: string | null;
        upgradeRequestedAt?: string | Date | null;
        upgradeReviewedAt?: string | Date | null;
        paymentMetadata?: unknown;
      }
    | unknown,
) {
  const settings = getInvestmentOrderUpgradeSettings(source);

  return (
    (runtimeStatus === RuntimeStatus.ONGOING ||
      runtimeStatus === RuntimeStatus.ACTIVE) &&
    settings.status === "APPROVED"
  );
}

export function buildInvestmentOrderUpgradePath(orderId: string) {
  return `/account/dashboard/user/investment-orders/${orderId}/upgrade`;
}

export function setInvestmentOrderUpgradeSettings(
  paymentMetadata: unknown,
  settings: InvestmentOrderUpgradeSettings,
): Prisma.InputJsonValue {
  const metadata = asJsonObject(paymentMetadata);
  const nextMetadata: Record<string, unknown> = {
    ...metadata,
  };
  if (!settings.allowUpgrade || !settings.amount || settings.amount <= 0) {
    delete nextMetadata.upgrade;
    return toJsonValue(nextMetadata);
  }

  nextMetadata.upgrade = {
    allowUpgrade: true,
    amount: settings.amount,
    approvedAt: settings.status === "APPROVED" ? settings.reviewedAt : null,
    pendingPaymentId:
      settings.status === "PENDING_REVIEW" ? settings.paymentId : null,
    submittedAt: settings.requestedAt,
  };

  return toJsonValue(nextMetadata);
}

export function markInvestmentOrderUpgradeApproved(
  paymentMetadata: unknown,
  approvedAt: Date,
): Prisma.InputJsonValue {
  const metadata = asJsonObject(paymentMetadata);
  const upgrade = asJsonObject(metadata.upgrade);

  if (upgrade.allowUpgrade !== true || parsePositiveNumber(upgrade.amount) === null) {
    return toJsonValue(metadata);
  }

  return toJsonValue({
    ...metadata,
    upgrade: {
      ...upgrade,
      approvedAt: parseIsoString(upgrade.approvedAt) ?? approvedAt.toISOString(),
      pendingPaymentId: null,
    },
  });
}

export function markInvestmentOrderUpgradePending(
  paymentMetadata: unknown,
  paymentId: string,
  submittedAt: Date,
): Prisma.InputJsonValue {
  const metadata = asJsonObject(paymentMetadata);
  const upgrade = asJsonObject(metadata.upgrade);

  if (upgrade.allowUpgrade !== true || parsePositiveNumber(upgrade.amount) === null) {
    return toJsonValue(metadata);
  }

  return toJsonValue({
    ...metadata,
    upgrade: {
      ...upgrade,
      pendingPaymentId: paymentId,
      submittedAt: submittedAt.toISOString(),
      approvedAt: null,
    },
  });
}

export function markInvestmentOrderUpgradeRejected(
  paymentMetadata: unknown,
): Prisma.InputJsonValue {
  const metadata = asJsonObject(paymentMetadata);
  const upgrade = asJsonObject(metadata.upgrade);

  if (upgrade.allowUpgrade !== true || parsePositiveNumber(upgrade.amount) === null) {
    return toJsonValue(metadata);
  }

  return toJsonValue({
    ...metadata,
    upgrade: {
      ...upgrade,
      pendingPaymentId: null,
    },
  });
}
