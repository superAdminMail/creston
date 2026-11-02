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

export type InvestmentOrderCapitalUpdateSettings =
  InvestmentOrderUpgradeSettings & {
    enabled: boolean;
    reason: string | null;
  };

type InvestmentOrderOfferSource = {
  upgradeStatus?: string | null;
  upgradeAmount?: unknown;
  upgradePaymentId?: string | null;
  upgradeRequestedAt?: string | Date | null;
  upgradeReviewedAt?: string | Date | null;

  capitalUpdateStatus?: string | null;
  capitalUpdateAmount?: unknown;
  capitalUpdatePaymentId?: string | null;
  capitalUpdateRequestedAt?: string | Date | null;
  capitalUpdateReviewedAt?: string | Date | null;

  paymentMetadata?: unknown;
};

function parsePositiveNumber(value: unknown): number | null {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : value !== null &&
            typeof value === "object" &&
            "toNumber" in value &&
            typeof value.toNumber === "function"
          ? value.toNumber()
          : null;

  if (numeric === null || !Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return numeric;
}

function parseIsoString(value: unknown): string | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function parseText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
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

function resolveLegacyUpgradeStatus(
  metadata: Record<string, unknown>,
): InvestmentOrderUpgradeStatus {
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

function readUpgradeFields(source: InvestmentOrderOfferSource | null) {
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

function readOfferSource(source: unknown): InvestmentOrderOfferSource | null {
  if (!source || typeof source !== "object") {
    return null;
  }

  return source as InvestmentOrderOfferSource;
}

export function getInvestmentOrderUpgradeSettings(
  source: unknown,
): InvestmentOrderUpgradeSettings {
  const offerSource = readOfferSource(source);

  if (!offerSource) {
    return {
      status: "DISABLED",
      allowUpgrade: false,
      amount: null,
      paymentId: null,
      requestedAt: null,
      reviewedAt: null,
    };
  }

  return readUpgradeFields(offerSource);
}

export function hasInvestmentOrderUpgradeOffer(
  runtimeStatus: string,
  source: unknown,
): boolean {
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
  source: unknown,
): boolean {
  const settings = getInvestmentOrderUpgradeSettings(source);

  return (
    (runtimeStatus === RuntimeStatus.ONGOING ||
      runtimeStatus === RuntimeStatus.ACTIVE) &&
    settings.status === "APPROVED"
  );
}

export function getInvestmentOrderCapitalUpdateSettings(
  source: unknown,
): InvestmentOrderCapitalUpdateSettings {
  const offerSource = readOfferSource(source);

  if (!offerSource) {
    return {
      status: "DISABLED",
      allowUpgrade: false,
      amount: null,
      paymentId: null,
      requestedAt: null,
      reviewedAt: null,
      enabled: false,
      reason: null,
    };
  }

  const metadata = asJsonObject(offerSource.paymentMetadata);
  const capitalUpdate = asJsonObject(metadata.capitalUpdate);
  const enabled = capitalUpdate.enabled === true;

  /*
   * Capital Update now uses its own database fields.
   *
   * The upgrade* and legacy metadata fallbacks below are retained
   * for orders created before Capital Update received separate fields.
   * New writes should use capitalUpdate* fields exclusively.
   */
  const legacyUpgrade = asJsonObject(metadata.upgrade);

  const status =
    parseUpgradeStatus(offerSource.capitalUpdateStatus) ??
    parseUpgradeStatus(capitalUpdate.status) ??
    (enabled
      ? (parseUpgradeStatus(offerSource.upgradeStatus) ??
        resolveLegacyUpgradeStatus(metadata))
      : "DISABLED");

  const amount =
    parsePositiveNumber(offerSource.capitalUpdateAmount) ??
    parsePositiveNumber(capitalUpdate.amount) ??
    (enabled
      ? (parsePositiveNumber(offerSource.upgradeAmount) ??
        parsePositiveNumber(legacyUpgrade.amount))
      : null);

  const paymentId =
    offerSource.capitalUpdatePaymentId ??
    parseIsoString(capitalUpdate.pendingPaymentId) ??
    (enabled
      ? (offerSource.upgradePaymentId ??
        parseIsoString(legacyUpgrade.pendingPaymentId))
      : null);

  const requestedAt =
    parseIsoString(offerSource.capitalUpdateRequestedAt) ??
    parseIsoString(capitalUpdate.submittedAt) ??
    (enabled
      ? (parseIsoString(offerSource.upgradeRequestedAt) ??
        parseIsoString(legacyUpgrade.submittedAt))
      : null);

  const reviewedAt =
    parseIsoString(offerSource.capitalUpdateReviewedAt) ??
    parseIsoString(capitalUpdate.approvedAt) ??
    (enabled
      ? (parseIsoString(offerSource.upgradeReviewedAt) ??
        parseIsoString(legacyUpgrade.approvedAt))
      : null);

  return {
    status,
    allowUpgrade: enabled && status !== "DISABLED",
    amount,
    paymentId,
    requestedAt,
    reviewedAt,
    enabled,
    reason: parseText(capitalUpdate.reason),
  };
}

export function hasInvestmentOrderCapitalUpdateOffer(
  _runtimeStatus: string,
  source: unknown,
): boolean {
  const settings = getInvestmentOrderCapitalUpdateSettings(source);

  return (
    settings.enabled &&
    settings.status === "AVAILABLE" &&
    settings.amount !== null &&
    settings.paymentId === null
  );
}

export function isInvestmentOrderCapitalUpdated(
  _runtimeStatus: string,
  source: unknown,
): boolean {
  const settings = getInvestmentOrderCapitalUpdateSettings(source);

  return settings.enabled && settings.status === "APPROVED";
}

export function buildInvestmentOrderUpgradePath(orderId: string): string {
  return `/account/dashboard/user/investment-orders/${orderId}/upgrade`;
}

export function buildInvestmentOrderCapitalUpdatePath(orderId: string): string {
  return `/account/dashboard/user/investment-orders/${orderId}/update-capital`;
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

  if (
    upgrade.allowUpgrade !== true ||
    parsePositiveNumber(upgrade.amount) === null
  ) {
    return toJsonValue(metadata);
  }

  return toJsonValue({
    ...metadata,
    upgrade: {
      ...upgrade,
      approvedAt:
        parseIsoString(upgrade.approvedAt) ?? approvedAt.toISOString(),
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

  if (
    upgrade.allowUpgrade !== true ||
    parsePositiveNumber(upgrade.amount) === null
  ) {
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

  if (
    upgrade.allowUpgrade !== true ||
    parsePositiveNumber(upgrade.amount) === null
  ) {
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
