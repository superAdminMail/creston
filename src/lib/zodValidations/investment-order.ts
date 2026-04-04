import { z } from "zod";

const decimalAmountPattern = /^\d+(?:\.\d{1,2})?$/;

export const createInvestmentOrderSchema = z.object({
  investmentId: z.string().trim().min(1, "Select an investment."),
  investmentPlanId: z.string().trim().min(1, "Select an investment plan."),
  investmentPlanTierId: z.string().trim().min(1, "Select an investment tier."),
  amount: z
    .string()
    .trim()
    .min(1, "Enter an investment amount.")
    .refine(
      (value) => decimalAmountPattern.test(normalizeAmountInput(value)),
      "Enter a valid amount with up to 2 decimal places.",
    ),
});

export type CreateInvestmentOrderInput = z.infer<
  typeof createInvestmentOrderSchema
>;

export function normalizeAmountInput(value: string) {
  return value.replace(/,/g, "").trim();
}

export function parseInvestmentOrderAmount(value: string) {
  const normalized = normalizeAmountInput(value);

  if (!decimalAmountPattern.test(normalized)) {
    return null;
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return amount;
}
