type WithdrawalSourceAllocationSnapshot = {
  sourceType?: string | null;
} | null;

export type WithdrawalSourceDisplaySnapshot = {
  sourceType?: string | null;
  sourceLabel?: string | null;
  allocations?: WithdrawalSourceAllocationSnapshot[] | null;
} | null | undefined;

function normalizeLabel(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function resolveWithdrawalSourceDisplayLabel(
  snapshot: WithdrawalSourceDisplaySnapshot,
  fallback = "Withdrawal source",
) {
  const sourceType = normalizeLabel(snapshot?.sourceType);
  const sourceLabel = normalizeLabel(snapshot?.sourceLabel);

  if (sourceType === "SAVINGS_POOL") {
    return sourceLabel ?? "Savings balance";
  }

  if (sourceType === "INVESTMENT_POOL") {
    return sourceLabel ?? "Investment balance";
  }

  const allocationTypes = new Set<"INVESTMENT_ORDER" | "SAVINGS_ACCOUNT">();

  for (const allocation of snapshot?.allocations ?? []) {
    const allocationSourceType = normalizeLabel(allocation?.sourceType);

    if (
      allocationSourceType === "INVESTMENT_ORDER" ||
      allocationSourceType === "SAVINGS_ACCOUNT"
    ) {
      allocationTypes.add(allocationSourceType);
    }
  }

  if (
    allocationTypes.has("INVESTMENT_ORDER") &&
    allocationTypes.has("SAVINGS_ACCOUNT")
  ) {
    return "Savings balance and investment balance";
  }

  if (allocationTypes.has("SAVINGS_ACCOUNT")) {
    return "Savings balance";
  }

  if (allocationTypes.has("INVESTMENT_ORDER")) {
    return "Investment balance";
  }

  return sourceLabel ?? fallback;
}
