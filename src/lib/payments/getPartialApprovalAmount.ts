export function getPartialApprovalAmount(
  claimedAmount: number,
  currentAmount: number,
): number | null {
  if (!Number.isFinite(claimedAmount) || claimedAmount <= 0.01) {
    return null;
  }

  if (
    Number.isFinite(currentAmount) &&
    currentAmount > 0 &&
    currentAmount < claimedAmount
  ) {
    return Number(currentAmount.toFixed(2));
  }

  const nextAmount = Math.max(claimedAmount - 0.01, 0.01);
  return Number(nextAmount.toFixed(2));
}
