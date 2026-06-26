export type WithdrawalCommissionSourceType =
  | "INVESTMENT_ORDER"
  | "SAVINGS_ACCOUNT"
  | "MIXED";

export type WithdrawalCommissionAllocationInput = {
  sourceType: "INVESTMENT_ORDER" | "SAVINGS_ACCOUNT";
  sourceGrossAmount: number;
};

export type WithdrawalCommissionFieldName =
  | "commissionPercent"
  | "feeAmount";

export type WithdrawalCommissionFieldConfig = {
  fieldName: WithdrawalCommissionFieldName;
  label: string;
  helperText: string;
  placeholder: string;
  emptyMessage: string;
  positiveMessage: string;
  maxMessage: string | null;
};

export function getWithdrawalCommissionSourceType(input: {
  investmentOrderId: string | null | undefined;
  sourceType?: string | null | undefined;
  allocationMode?: string | null | undefined;
}): WithdrawalCommissionSourceType {
  if (input.allocationMode === "AUTO" || input.sourceType === "AUTO") {
    return "MIXED";
  }

  if (input.sourceType === "MIXED") {
    return "MIXED";
  }

  if (input.sourceType === "INVESTMENT_POOL") {
    return "INVESTMENT_ORDER";
  }

  if (input.sourceType === "SAVINGS_POOL") {
    return "SAVINGS_ACCOUNT";
  }

  return input.investmentOrderId ? "INVESTMENT_ORDER" : "SAVINGS_ACCOUNT";
}

export function calculateWithdrawalCommissionDueAmount(input: {
  sourceType: WithdrawalCommissionSourceType;
  amount: number;
  commissionPercent: number;
  savingsFeeAmount: number | null;
  allocations?: WithdrawalCommissionAllocationInput[];
}): number {
  const allocations = input.allocations ?? [];

  if (input.sourceType === "MIXED" && allocations.length > 0) {
    let total = 0;
    let hasSavings = false;

    for (const allocation of allocations) {
      if (allocation.sourceType === "INVESTMENT_ORDER") {
        total += allocation.sourceGrossAmount * (input.commissionPercent / 100);
      }

      if (allocation.sourceType === "SAVINGS_ACCOUNT") {
        hasSavings = true;
      }
    }

    if (hasSavings && input.savingsFeeAmount !== null) {
      total += input.savingsFeeAmount;
    }

    return total;
  }

  if (input.sourceType === "SAVINGS_ACCOUNT") {
    return input.savingsFeeAmount ?? 0;
  }

  return input.amount * (input.commissionPercent / 100);
}

export function readWithdrawalSnapshotString(
  snapshot: unknown,
  key: string,
): string | null {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return null;
  }

  const value = (snapshot as Record<string, unknown>)[key];

  return typeof value === "string" ? value : null;
}

export function getWithdrawalCommissionFieldConfig(
  sourceType: WithdrawalCommissionSourceType,
): WithdrawalCommissionFieldConfig {
  if (sourceType === "INVESTMENT_ORDER") {
    return {
      fieldName: "commissionPercent",
      label: "Commission percent",
      helperText: "Enter a percent between 0 and 100.",
      placeholder: "5.00",
      emptyMessage: "Enter a commission percent.",
      positiveMessage: "Commission percent must be greater than zero.",
      maxMessage: "Commission percent cannot exceed 100.",
    };
  }

  return {
    fieldName: "feeAmount",
    label: "Fee amount",
    helperText: "Enter the fixed fee amount for this savings withdrawal.",
    placeholder: "0.00",
    emptyMessage: "Enter a fee amount.",
    positiveMessage: "Fee amount must be greater than zero.",
    maxMessage: "Fee amount cannot exceed the withdrawal amount.",
  };
}

export function normalizeWithdrawalCommissionInput(
  value: FormDataEntryValue | null,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}
