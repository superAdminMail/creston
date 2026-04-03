export type InvestmentFieldName =
  | "name"
  | "slug"
  | "description"
  | "type"
  | "period"
  | "status"
  | "iconFileAssetId"
  | "sortOrder"
  | "isActive";

export type InvestmentFormActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<InvestmentFieldName, string>>;
};

export const initialInvestmentFormActionState: InvestmentFormActionState = {
  status: "idle",
};
