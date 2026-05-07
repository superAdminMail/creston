export function buildWithdrawalCommissionCheckoutUrl(withdrawalId: string) {
  const params = new URLSearchParams({
    targetType: "WITHDRAWAL_ORDER",
    targetId: withdrawalId,
  });

  return `/account/dashboard/checkout?${params.toString()}`;
}
