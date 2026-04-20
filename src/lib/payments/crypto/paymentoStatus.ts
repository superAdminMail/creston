import {
  CryptoFundingIntentStatus,
  InvestmentOrderStatus,
  SavingsFundingIntentStatus,
} from "@/generated/prisma";
import { parsePaymentoStatus } from "@/lib/payments/crypto/paymento";

export type PaymentoNormalizedStatus =
  | "PENDING"
  | "PROCESSING"
  | "REQUIRES_ACTION"
  | "AWAITING_PROVIDER_CONFIRMATION"
  | "PAID"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED"
  | "UNKNOWN";

export type PaymentoStatusResolution = {
  rawStatus: string | number | null;
  statusCode: number | null;
  status: PaymentoNormalizedStatus;
  isSuccessful: boolean;
  shouldSettle: boolean;
  isFailed: boolean;
  isCancelled: boolean;
  isPending: boolean;
};

function normalizeStatusText(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_")
    .replace(/__+/g, "_");
}

function mapNumericStatus(statusCode: number | null): PaymentoNormalizedStatus {
  switch (statusCode) {
    case 0:
      return "PENDING";
    case 1:
      return "PROCESSING";
    case 2:
      return "PROCESSING";
    case 3:
      return "AWAITING_PROVIDER_CONFIRMATION";
    case 4:
      return "EXPIRED";
    case 5:
      return "CANCELLED";
    case 7:
    case 8:
      return "PAID";
    case 9:
      return "FAILED";
    default:
      return "UNKNOWN";
  }
}

function mapTextStatus(value: string): PaymentoNormalizedStatus {
  const normalized = normalizeStatusText(value);

  switch (normalized) {
    case "PENDING":
    case "PROCESSING":
    case "REQUIRES_ACTION":
    case "AWAITING_PROVIDER_CONFIRMATION":
    case "PAID":
    case "FAILED":
    case "EXPIRED":
    case "CANCELLED":
      return normalized;
    default:
      return "UNKNOWN";
  }
}

export function resolvePaymentoStatus(
  value: unknown,
): PaymentoStatusResolution {
  const statusCode = parsePaymentoStatus(value);

  const rawStatus =
    typeof value === "string" || typeof value === "number" ? value : null;

  const status =
    typeof value === "string"
      ? mapTextStatus(value)
      : mapNumericStatus(statusCode);

  return {
    rawStatus,
    statusCode,
    status,
    isSuccessful: status === "PAID",
    shouldSettle: status === "PAID",
    isFailed: status === "FAILED" || status === "EXPIRED",
    isCancelled: status === "CANCELLED",
    isPending:
      status === "PENDING" ||
      status === "PROCESSING" ||
      status === "REQUIRES_ACTION" ||
      status === "AWAITING_PROVIDER_CONFIRMATION" ||
      status === "UNKNOWN",
  };
}

export function mapPaymentoStatusToCryptoFundingIntentStatus(
  status: PaymentoNormalizedStatus,
): CryptoFundingIntentStatus {
  switch (status) {
    case "PAID":
      return CryptoFundingIntentStatus.FUNDED;
    case "FAILED":
      return CryptoFundingIntentStatus.FAILED;
    case "EXPIRED":
      return CryptoFundingIntentStatus.EXPIRED;
    case "CANCELLED":
      return CryptoFundingIntentStatus.CANCELED;
    case "REQUIRES_ACTION":
    case "AWAITING_PROVIDER_CONFIRMATION":
      return CryptoFundingIntentStatus.AWAITING_PROVIDER_CONFIRMATION;
    case "PROCESSING":
      return CryptoFundingIntentStatus.PROCESSING;
    case "PENDING":
    case "UNKNOWN":
    default:
      return CryptoFundingIntentStatus.PENDING;
  }
}

export function mapPaymentoStatusToInvestmentOrderStatus(
  status: PaymentoNormalizedStatus,
): InvestmentOrderStatus {
  switch (status) {
    case "PAID":
      return InvestmentOrderStatus.PAID;
    case "CANCELLED":
      return InvestmentOrderStatus.CANCELLED;
    default:
      return InvestmentOrderStatus.PENDING_PAYMENT;
  }
}

export function mapPaymentoStatusToSavingsFundingIntentStatus(
  status: PaymentoNormalizedStatus,
): SavingsFundingIntentStatus {
  switch (status) {
    case "PAID":
      return SavingsFundingIntentStatus.PAID;
    case "FAILED":
      return SavingsFundingIntentStatus.FAILED;
    case "CANCELLED":
      return SavingsFundingIntentStatus.CANCELLED;
    default:
      return SavingsFundingIntentStatus.SUBMITTED;
  }
}
