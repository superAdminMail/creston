export type WithdrawalCommissionSourceType =
  | "INVESTMENT_ORDER"
  | "SAVINGS_ACCOUNT";

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
}): WithdrawalCommissionSourceType {
  return input.investmentOrderId ? "INVESTMENT_ORDER" : "SAVINGS_ACCOUNT";
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
