import { z } from "zod";

const decimalPattern = /^\d+(?:\.\d{1,2})?$/;

export const createSavingsAccountSchema = z.object({
  productId: z.string().trim().min(1, "Select a savings product."),
  name: z.string().trim().min(1, "Enter an account name.").max(80, "Account name is too long."),
  description: z
    .string()
    .trim()
    .max(240, "Description must be 240 characters or fewer.")
    .optional()
    .or(z.literal("")),
  targetAmount: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || decimalPattern.test(value),
      "Enter a valid target amount.",
    )
    .refine(
      (value) => !value || Number(value) > 0,
      "Target amount must be greater than zero.",
    ),
  lockSavings: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((value) => value === "true"),
});

export const createWithdrawalOrderSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, "Enter an amount.")
    .refine((value) => decimalPattern.test(value), "Enter a valid amount.")
    .refine((value) => Number(value) > 0, "Amount must be greater than zero."),
  methodId: z.string().trim().min(1, "Select a payment method."),
  sourceType: z
    .string()
    .trim()
    .refine(
      (value) => value === "SAVINGS_ACCOUNT" || value === "INVESTMENT_ORDER",
      "Select a withdrawal source.",
    ),
  sourceId: z.string().trim().min(1, "Select a withdrawal source."),
});

export const createPaymentMethodSchema = z
  .object({
    type: z.enum(["BANK", "CRYPTO"]),
    bankName: z.string().trim().optional().or(z.literal("")),
    accountName: z.string().trim().optional().or(z.literal("")),
    accountNumber: z.string().trim().optional().or(z.literal("")),
    network: z.string().trim().optional().or(z.literal("")),
    address: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    if (value.type === "BANK") {
      if (!value.bankName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bankName"],
          message: "Enter the bank name.",
        });
      }

      if (!value.accountName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["accountName"],
          message: "Enter the account name.",
        });
      }

      if (!value.accountNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["accountNumber"],
          message: "Enter the account number.",
        });
      } else if (!/^\d{6,20}$/.test(value.accountNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["accountNumber"],
          message: "Enter a valid account number.",
        });
      }
    }

    if (value.type === "CRYPTO") {
      if (!value.network) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["network"],
          message: "Select or enter the crypto network.",
        });
      }

      if (!value.address) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["address"],
          message: "Enter the wallet address.",
        });
      } else if (value.address.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["address"],
          message: "Wallet address looks too short.",
        });
      }
    }
  });
