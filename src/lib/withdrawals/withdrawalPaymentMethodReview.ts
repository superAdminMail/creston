import { asJsonObject } from "@/lib/payments/paymentJson";

type NullableString = string | null;

export type WithdrawalPaymentMethodReviewStatus =
  | "AVAILABLE"
  | "UNAVAILABLE"
  | "UPDATED";

export type WithdrawalPaymentMethodOverride =
  | {
      type: "WESTERN_UNION";
      receiverName: NullableString;
      receiverCountry: NullableString;
      receiverCity: NullableString;
      receiverPhone: NullableString;
      transferReference: NullableString;
      note: NullableString;
    }
  | {
      type: "CASH_DELIVERY";
      recipientName: NullableString;
      deliveryCountry: NullableString;
      deliveryCity: NullableString;
      deliveryAddress: NullableString;
      contactPhone: NullableString;
      deliveryInstructions: NullableString;
      note: NullableString;
    };

export type WithdrawalPaymentMethodReviewSnapshot = {
  status: WithdrawalPaymentMethodReviewStatus;
  reason: NullableString;
  updatedAt: NullableString;
  updatedByUserId: NullableString;
};

export type WithdrawalPaymentMethodSnapshot = {
  review: WithdrawalPaymentMethodReviewSnapshot;
  override: WithdrawalPaymentMethodOverride | null;
};

type WithdrawalMethodLike = {
  type?: string | null;
  bankName?: string | null;
  network?: string | null;
};

function readNullableString(value: unknown): NullableString {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function readReviewStatus(value: unknown): WithdrawalPaymentMethodReviewStatus {
  if (value === "AVAILABLE" || value === "UNAVAILABLE" || value === "UPDATED") {
    return value;
  }

  return "AVAILABLE";
}

function readPaymentMethodOverride(
  value: unknown,
): WithdrawalPaymentMethodOverride | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const snapshot = value as Record<string, unknown>;
  const type = snapshot.type;

  if (type === "WESTERN_UNION") {
    return {
      type,
      receiverName: readNullableString(snapshot.receiverName),
      receiverCountry: readNullableString(snapshot.receiverCountry),
      receiverCity: readNullableString(snapshot.receiverCity),
      receiverPhone: readNullableString(snapshot.receiverPhone),
      transferReference: readNullableString(snapshot.transferReference),
      note: readNullableString(snapshot.note),
    };
  }

  if (type === "CASH_DELIVERY") {
    return {
      type,
      recipientName: readNullableString(snapshot.recipientName),
      deliveryCountry: readNullableString(snapshot.deliveryCountry),
      deliveryCity: readNullableString(snapshot.deliveryCity),
      deliveryAddress: readNullableString(snapshot.deliveryAddress),
      contactPhone: readNullableString(snapshot.contactPhone),
      deliveryInstructions: readNullableString(snapshot.deliveryInstructions),
      note: readNullableString(snapshot.note),
    };
  }

  return null;
}

export function readWithdrawalPaymentMethodSnapshot(
  payoutSnapshot: unknown,
): WithdrawalPaymentMethodSnapshot {
  const snapshot = asJsonObject(payoutSnapshot);
  const review = snapshot.paymentMethodReview;

  return {
    review: {
      status: readReviewStatus(
        review && typeof review === "object" && !Array.isArray(review)
          ? (review as Record<string, unknown>).status
          : null,
      ),
      reason: readNullableString(
        review && typeof review === "object" && !Array.isArray(review)
          ? (review as Record<string, unknown>).reason
          : null,
      ),
      updatedAt: readNullableString(
        review && typeof review === "object" && !Array.isArray(review)
          ? (review as Record<string, unknown>).updatedAt
          : null,
      ),
      updatedByUserId: readNullableString(
        review && typeof review === "object" && !Array.isArray(review)
          ? (review as Record<string, unknown>).updatedByUserId
          : null,
      ),
    },
    override: readPaymentMethodOverride(snapshot.paymentMethodOverride),
  };
}

function getBankMethodLabel(method: WithdrawalMethodLike | null | undefined) {
  if (!method) {
    return "Bank transfer";
  }

  return method.bankName?.trim() || "Bank transfer";
}

function getCryptoMethodLabel(method: WithdrawalMethodLike | null | undefined) {
  if (!method) {
    return "Crypto wallet";
  }

  return method.network?.trim() || "Crypto wallet";
}

export function resolveWithdrawalPaymentMethodLabel(
  originalMethod: WithdrawalMethodLike | null | undefined,
  snapshot: WithdrawalPaymentMethodSnapshot | null | undefined,
) {
  if (snapshot?.review.status === "UPDATED" && snapshot.override) {
    if (snapshot.override.type === "WESTERN_UNION") {
      return (
        snapshot.override.receiverName?.trim()
          ? `Western Union - ${snapshot.override.receiverName}`
          : "Western Union"
      );
    }

    if (snapshot.override.type === "CASH_DELIVERY") {
      return (
        snapshot.override.recipientName?.trim()
          ? `Cash delivery - ${snapshot.override.recipientName}`
          : "Cash delivery"
      );
    }
  }

  if (originalMethod?.type === "BANK") {
    return getBankMethodLabel(originalMethod);
  }

  if (originalMethod?.type === "CRYPTO") {
    return getCryptoMethodLabel(originalMethod);
  }

  return "Payment method";
}

export function getWithdrawalPaymentMethodStatusTone(
  status: WithdrawalPaymentMethodReviewStatus,
) {
  switch (status) {
    case "AVAILABLE":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
    case "UNAVAILABLE":
      return "border-amber-400/20 bg-amber-500/10 text-amber-200";
    case "UPDATED":
      return "border-blue-400/20 bg-blue-500/10 text-blue-200";
  }
}

export function getWithdrawalPaymentMethodStatusLabel(
  status: WithdrawalPaymentMethodReviewStatus,
) {
  switch (status) {
    case "AVAILABLE":
      return "Available";
    case "UNAVAILABLE":
      return "Unavailable";
    case "UPDATED":
      return "Updated";
  }
}
