import type { FormActionState } from "@/lib/forms/actionState";
import { createInitialFormState } from "@/lib/forms/actionState";

export type InvestmentFieldName =
  | "name"
  | "slug"
  | "description"
  | "symbol"
  | "type"
  | "period"
  | "status"
  | "iconFileAssetId"
  | "sortOrder"
  | "isActive";

export type InvestmentFormActionState = FormActionState<InvestmentFieldName>;

export const initialInvestmentFormActionState: InvestmentFormActionState =
  createInitialFormState();
