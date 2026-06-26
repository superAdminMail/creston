export function buildWithdrawalCommissionCheckoutUrl(
  withdrawalId: string,
  options?: {
    suggestedAmount?: number | null;
  },
) {
  const params = new URLSearchParams({
    targetType: "WITHDRAWAL_ORDER",
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
