import type { FormActionState } from "@/lib/forms/actionState";
import { createInitialFormState } from "@/lib/forms/actionState";

export type SavingsProductFieldName =
  | "name"
  | "description"
  | "interestEnabled"
  | "interestRatePercent"
  | "interestPayoutFrequency"
  | "isLockable"
  | "minimumLockDays"
  | "maximumLockDays"
  | "allowsWithdrawals"
  | "allowsDeposits"
  | "minBalance"
  | "maxBalance"
  | "currency"
  | "isActive"
  | "sortOrder";

export type SavingsProductFormState = FormActionState<SavingsProductFieldName> & {
  redirectHref?: string;
};

export const initialSavingsProductFormState: SavingsProductFormState =
  createInitialFormState();
