const WITHDRAWAL_APPLIED_FEE_RATE = 0.02;

function readPositiveNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  return null;
}

export function calculateWithdrawalAppliedFeeAmount(baseAmount: number) {
  if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
    return 0;
  }

  return Math.round(baseAmount * WITHDRAWAL_APPLIED_FEE_RATE * 100) / 100;
}

export function getWithdrawalAppliedFeeBaseAmount(
  payoutSnapshot: unknown,
  requestedAmount: number,
) {
  if (!payoutSnapshot || typeof payoutSnapshot !== "object") {
    return Number.isFinite(requestedAmount) && requestedAmount > 0
      ? requestedAmount
      : 0;
  }

  const snapshot = payoutSnapshot as Record<string, unknown>;
  const netPayoutAmount = readPositiveNumber(snapshot.netPayoutAmount);

  if (netPayoutAmount !== null) {
    return netPayoutAmount;
  }

  return Number.isFinite(requestedAmount) && requestedAmount > 0
    ? requestedAmount
    : 0;
}

export function buildWithdrawalFeeCheckoutUrl(
  withdrawalId: string,
  options?: {
    suggestedAmount?: number | null;
  },
) {
  const params = new URLSearchParams({
    targetType: "WITHDRAWAL_FEE",
    targetId: withdrawalId,
  });

  if (
    typeof options?.suggestedAmount === "number" &&
    Number.isFinite(options.suggestedAmount) &&
    options.suggestedAmount > 0
  ) {
    params.set("suggestedAmount", options.suggestedAmount.toFixed(2));
  }

  return `/account/dashboard/checkout?${params.toString()}`;
}
