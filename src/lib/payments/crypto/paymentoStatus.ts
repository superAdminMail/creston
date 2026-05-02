import {
  CryptoFundingIntentStatus,
  InvestmentOrderStatus,
  SavingsFundingIntentStatus,
} from "@/generated/prisma";

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

const PAYMENTO_TEXT_STATUSES = new Set<PaymentoNormalizedStatus>([
  "PENDING",
  "PROCESSING",
  "REQUIRES_ACTION",
  "AWAITING_PROVIDER_CONFIRMATION",
  "PAID",
  "FAILED",
  "EXPIRED",
  "CANCELLED",
]);

const PAYMENTO_NUMERIC_STATUS_MAP: Partial<
  Record<number, PaymentoNormalizedStatus>
> = {
  0: "PENDING",
  1: "PROCESSING",
  2: "PROCESSING",
  3: "AWAITING_PROVIDER_CONFIRMATION",
  4: "EXPIRED",
  5: "CANCELLED",
  7: "PAID",
  8: "PAID",
  9: "FAILED",
};

function normalizeStatusText(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_")
    .replace(/__+/g, "_");
}

function mapNumericStatus(statusCode: number | null): PaymentoNormalizedStatus {
  return statusCode === null
    ? "UNKNOWN"
    : PAYMENTO_NUMERIC_STATUS_MAP[statusCode] ?? "UNKNOWN";
}

function mapTextStatus(value: string): PaymentoNormalizedStatus {
  const normalized = normalizeStatusText(value);

  return PAYMENTO_TEXT_STATUSES.has(normalized as PaymentoNormalizedStatus)
    ? (normalized as PaymentoNormalizedStatus)
    : "UNKNOWN";
}

function parsePaymentoStatus(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }
  return null;
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
