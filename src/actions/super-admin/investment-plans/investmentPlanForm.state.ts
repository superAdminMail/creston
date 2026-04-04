export type InvestmentPlanFieldName =
  | "investmentId"
  | "name"
  | "slug"
  | "description"
  | "category"
  | "period"
  | "currency"
  | "tiers"
  | "isActive";

export type InvestmentPlanFormActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<InvestmentPlanFieldName, string>>;
};

export const initialInvestmentPlanFormActionState: InvestmentPlanFormActionState =
  {
    status: "idle",
  };
