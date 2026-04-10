import { z } from "zod";

const accountStatusValues = ["PENDING", "ACTIVE", "FROZEN", "CLOSED"] as const;

export const createInvestmentAccountSchema = z.object({
  investmentPlanId: z.string().min(1, "Select an investment plan."),
});

export const updateInvestmentAccountSchema = z.object({
  status: z.enum(accountStatusValues),
});

export type CreateInvestmentAccountInput = z.infer<
  typeof createInvestmentAccountSchema
>;

export type UpdateInvestmentAccountInput = z.infer<
  typeof updateInvestmentAccountSchema
>;
