import { z } from "zod";

const decimalPattern = /^\d+(?:\.\d{1,2})?$/;

export const createSavingsAccountSchema = z.object({
  productId: z.string().trim().min(1, "Select a savings product."),
});

export const createWithdrawalOrderSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, "Enter an amount.")
    .refine((value) => decimalPattern.test(value), "Enter a valid amount.")
    .refine((value) => Number(value) > 0, "Amount must be greater than zero."),
  methodId: z.string().trim().min(1, "Select a payment method."),
});
