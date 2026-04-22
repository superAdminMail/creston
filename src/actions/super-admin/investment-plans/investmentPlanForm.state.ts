import type { FormActionState } from "@/lib/forms/actionState";
import { createInitialFormState } from "@/lib/forms/actionState";

export type InvestmentPlanFieldName =
  | "investmentId"
  | "name"
  | "slug"
  | "description"
  | "period"
  | "investmentModel"
  | "penaltyFreePeriodDays"
  | "penaltyType"
  | "earlyWithdrawalPenaltyValue"
  | "maxPenaltyAmount"
  | "expectedReturnMin"
  | "expectedReturnMax"
  | "isLocked"
  | "allowWithdrawal"
  | "currency"
  | "seoTitle"
  | "seoDescription"
  | "seoImageFileId"
  | "sortOrder"
  | "durationDays"
  | "tiers"
  | "isActive";

export type InvestmentPlanFormActionState =
  FormActionState<InvestmentPlanFieldName> & {
    redirectHref?: string;
  };

export const initialInvestmentPlanFormActionState: InvestmentPlanFormActionState =
  createInitialFormState();
