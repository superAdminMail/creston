import { z } from "zod";

export const platformPaymentMethodTypeSchema = z.enum([
  "BANK_INFO",
  "WALLET_ADDRESS",
]);

export const platformPaymentVerificationStatusSchema = z.enum([
  "UNVERIFIED",
  "VERIFIED",
  "SUSPENDED",
]);

export const cryptoAssetSchema = z.enum(["BTC"]);
export const cryptoNetworkSchema = z.enum(["BITCOIN"]);

const optionalText = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  });

const basePlatformPaymentMethodSchema = z.object({
  type: platformPaymentMethodTypeSchema,
  label: z.string().trim().min(1, "Payment method label is required."),
  providerName: optionalText,
  accountName: optionalText,
  currency: z.string().trim().min(1, "Currency is required."),
  country: optionalText,
  instructions: optionalText,
  notes: optionalText,
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  sortOrder: z.coerce
    .number()
    .int()
    .min(0, "Sort order must be zero or greater.")
    .default(0),
  verificationStatus:
    platformPaymentVerificationStatusSchema.default("UNVERIFIED"),
  bankName: optionalText,
  bankCode: optionalText,
  accountNumber: optionalText,
  iban: optionalText,
  swiftCode: optionalText,
  routingNumber: optionalText,
  branchName: optionalText,
  cryptoAsset: cryptoAssetSchema.optional().or(z.literal("")),
  cryptoNetwork: cryptoNetworkSchema.optional().or(z.literal("")),
  walletAddress: optionalText,
  walletTag: optionalText,
});

export const platformPaymentMethodSchema =
  basePlatformPaymentMethodSchema.superRefine((value, ctx) => {
    if (value.type === "BANK_INFO") {
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
      }
    }

    if (value.type === "WALLET_ADDRESS") {
      if (!value.cryptoAsset) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cryptoAsset"],
          message: "Select the crypto asset.",
        });
      }

      if (!value.cryptoNetwork) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cryptoNetwork"],
          message: "Select the crypto network.",
        });
      }

      if (!value.walletAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["walletAddress"],
          message: "Enter the wallet address.",
        });
      }
    }
  });

export type PlatformPaymentMethodFormInput = z.infer<
  typeof platformPaymentMethodSchema
>;

export const updatePlatformPaymentMethodSchema =
  platformPaymentMethodSchema.extend({
    platformPaymentMethodId: z
      .string()
      .trim()
      .min(1, "Missing platform payment method id."),
  });

export type UpdatePlatformPaymentMethodFormInput = z.infer<
  typeof updatePlatformPaymentMethodSchema
>;

export function normalizePlatformPaymentMethodValues(
  values: PlatformPaymentMethodFormInput,
) {
  return {
    type: values.type,
    label: values.label.trim(),
    providerName: values.providerName,
    accountName: values.accountName,
    currency: values.currency.trim().toUpperCase(),
    country: values.country,
    instructions: values.instructions,
    notes: values.notes,
    isActive: values.isActive ?? true,
    isDefault: values.isDefault ?? false,
    sortOrder: values.sortOrder ?? 0,
    verificationStatus: values.verificationStatus,
    bankName: values.type === "BANK_INFO" ? values.bankName : null,
    bankCode: values.type === "BANK_INFO" ? values.bankCode : null,
    accountNumber: values.type === "BANK_INFO" ? values.accountNumber : null,
    iban: values.type === "BANK_INFO" ? values.iban : null,
    swiftCode: values.type === "BANK_INFO" ? values.swiftCode : null,
    routingNumber: values.type === "BANK_INFO" ? values.routingNumber : null,
    branchName: values.type === "BANK_INFO" ? values.branchName : null,
    cryptoAsset:
      values.type === "WALLET_ADDRESS" ? values.cryptoAsset || null : null,
    cryptoNetwork:
      values.type === "WALLET_ADDRESS" ? values.cryptoNetwork || null : null,
    walletAddress:
      values.type === "WALLET_ADDRESS" ? values.walletAddress : null,
    walletTag: values.type === "WALLET_ADDRESS" ? values.walletTag : null,
  };
}
