export type OrderFieldName =
  | "investmentId"
  | "investmentPlanId"
  | "investmentPlanTierId"
  | "amount";

export type CreateInvestmentOrderActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<OrderFieldName, string>>;
};

export const initialCreateInvestmentOrderActionState: CreateInvestmentOrderActionState =
  {
    status: "idle",
  };
