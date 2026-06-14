import { z } from "zod";

const amountPattern = /^\d+(?:\.\d{1,2})?$/;

export const adminAccountAdjustmentSchema = z
  .object({
    accountType: z.enum(["INVESTMENT_ORDER", "SAVINGS_ACCOUNT"]),
    accountId: z.string().trim().min(1, "Select a target."),
    direction: z.enum(["ADD", "DEDUCT"]),
    amount: z.string().trim().min(1, "Enter an adjustment amount."),
    reason: z.preprocess((value) => {
      if (typeof value !== "string") {
        return undefined;
      }

      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }, z.string().min(3, "Enter an adjustment reason.").optional()),
  })
  .superRefine((value, ctx) => {
    if (!amountPattern.test(value.amount)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Enter a valid adjustment amount.",
      });
      return;
    }

    const amount = Number(value.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Adjustment amount must be greater than zero.",
      });
    }
  });

export type AdminAccountAdjustmentFormInput = z.infer<
  typeof adminAccountAdjustmentSchema
>;
