export type CheckoutFundingMethodType =
  | "BANK_TRANSFER"
  | "CRYPTO_PROVIDER";

export type CheckoutPaymentMode = "FULL" | "PARTIAL";

export function isCheckoutFundingMethodType(
  value: string | null | undefined,
): value is CheckoutFundingMethodType {
  return value === "BANK_TRANSFER" || value === "CRYPTO_PROVIDER";
}

export function isCheckoutPaymentMode(
  value: string | null | undefined,
): value is CheckoutPaymentMode {
  return value === "FULL" || value === "PARTIAL";
}

export function getCheckoutFundingMethodLabel(
  value: CheckoutFundingMethodType | null | undefined,
): string {
  if (value === "CRYPTO_PROVIDER") return "Crypto wallet";
  if (value === "BANK_TRANSFER") return "Bank transfer";
  return "Choose funding method";
}

export function getCheckoutPaymentModeLabel(
  value: CheckoutPaymentMode | null | undefined,
): string {
  if (value === "PARTIAL") return "Partial Payment";
  if (value === "FULL") return "Full Payment";
  return "Choose payment mode";
}
