import type { FormActionState } from "@/lib/forms/actionState";
import { createInitialFormState } from "@/lib/forms/actionState";

export type InvestmentPlanFieldName =
  | "investmentId"
  | "name"
  | "slug"
  | "description"
  | "period"
  | "currency"
  | "tiers"
  | "isActive";

export type InvestmentPlanFormActionState =
  FormActionState<InvestmentPlanFieldName>;

export const initialInvestmentPlanFormActionState: InvestmentPlanFormActionState =
  createInitialFormState();
