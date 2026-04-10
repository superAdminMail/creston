import type { FormActionState } from "@/lib/forms/actionState";
import { createInitialFormState } from "@/lib/forms/actionState";

export type SavingsProductFieldName =
  | "name"
  | "description"
  | "interestRatePercent"
  | "interestPayoutFrequency"
  | "minimumLockDays"
  | "maximumLockDays"
  | "minBalance"
  | "maxBalance"
  | "currency"
  | "sortOrder";

export type SavingsProductFormState = FormActionState<SavingsProductFieldName>;

export const initialSavingsProductFormState: SavingsProductFormState =
  createInitialFormState();
