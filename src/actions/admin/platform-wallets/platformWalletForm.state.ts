import { createInitialFormState, type FormActionState } from "@/lib/forms/actionState";

export type PlatformPaymentMethodFieldName =
  | "type"
  | "label"
  | "providerName"
  | "accountName"
  | "currency"
  | "country"
  | "instructions"
  | "notes"
  | "isActive"
  | "isDefault"
  | "sortOrder"
  | "verificationStatus"
  | "bankName"
  | "bankCode"
  | "accountNumber"
  | "iban"
  | "swiftCode"
  | "routingNumber"
  | "branchName"
  | "cryptoAsset"
  | "cryptoNetwork"
  | "walletAddress"
  | "walletTag"
  | "platformPaymentMethodId";

export type PlatformPaymentMethodFormActionState =
  FormActionState<PlatformPaymentMethodFieldName>;

export const initialPlatformPaymentMethodFormState: PlatformPaymentMethodFormActionState =
  createInitialFormState();
