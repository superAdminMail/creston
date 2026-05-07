import { z } from "zod";

const amountPattern = /^\d+(?:\.\d{1,2})?$/;

export const adminAccountAdjustmentSchema = z
  .object({
    accountType: z.enum(["INVESTMENT_ACCOUNT", "SAVINGS_ACCOUNT"]),
    accountId: z.string().trim().min(1, "Select an account."),
    direction: z.enum(["ADD", "DEDUCT"]),
    amount: z.string().trim().min(1, "Enter an adjustment amount."),
    reason: z.string().trim().min(3, "Enter an adjustment reason."),
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
