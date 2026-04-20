"use server";

import { PlatformPaymentMethodType } from "@/generated/prisma";
import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  getFriendlyServerError,
} from "@/lib/forms/actionState";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  normalizePlatformPaymentMethodValues,
  platformPaymentMethodSchema,
  type PlatformPaymentMethodFormInput,
} from "@/lib/zodValidations/platform-wallet";
import { PlatformPaymentMethodFormActionState } from "./platformWalletForm.state";

type PlatformPaymentMethodField =
  | "type"
  | "label"
  | "providerName"
  | "accountName"
  | "reference"
  | "bankAddress"
  | "currency"
  | "country"
  | "instructions"
  | "notes"
  | "isPrivate"
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
  | "walletTag";

function getStringValue(formData: FormData, key: PlatformPaymentMethodField) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getBooleanValue(
  formData: FormData,
  key: PlatformPaymentMethodField,
  fallback = false,
) {
  const value = formData.get(key);
  if (typeof value === "string") {
    return value === "true";
  }

  return fallback;
}

function getNumberValue(formData: FormData, key: PlatformPaymentMethodField) {
  const value = getStringValue(formData, key);
  return value === "" ? 0 : Number(value);
}

export async function createPlatformPaymentMethod(
  _previousState: PlatformPaymentMethodFormActionState,
  formData: FormData,
): Promise<PlatformPaymentMethodFormActionState> {
  const submittedValues: PlatformPaymentMethodFormInput = {
    type: getStringValue(formData, "type") as PlatformPaymentMethodFormInput["type"],
    label: getStringValue(formData, "label"),
    providerName: getStringValue(formData, "providerName"),
    accountName: getStringValue(formData, "accountName"),
    reference: getStringValue(formData, "reference"),
    bankAddress: getStringValue(formData, "bankAddress"),
    currency: getStringValue(formData, "currency"),
    country: getStringValue(formData, "country"),
    instructions: getStringValue(formData, "instructions"),
    notes: getStringValue(formData, "notes"),
    isPrivate: getBooleanValue(formData, "isPrivate", false),
    isActive: getBooleanValue(formData, "isActive", true),
    isDefault: getBooleanValue(formData, "isDefault", false),
    sortOrder: getNumberValue(formData, "sortOrder"),
    verificationStatus: getStringValue(formData, "verificationStatus") as PlatformPaymentMethodFormInput["verificationStatus"],
    bankName: getStringValue(formData, "bankName"),
    bankCode: getStringValue(formData, "bankCode"),
    accountNumber: getStringValue(formData, "accountNumber"),
    iban: getStringValue(formData, "iban"),
    swiftCode: getStringValue(formData, "swiftCode"),
    routingNumber: getStringValue(formData, "routingNumber"),
    branchName: getStringValue(formData, "branchName"),
    cryptoAsset: getStringValue(formData, "cryptoAsset") as PlatformPaymentMethodFormInput["cryptoAsset"],
    cryptoNetwork: getStringValue(formData, "cryptoNetwork") as PlatformPaymentMethodFormInput["cryptoNetwork"],
    walletAddress: getStringValue(formData, "walletAddress"),
    walletTag: getStringValue(formData, "walletTag"),
  };

  const parsed = platformPaymentMethodSchema.safeParse(submittedValues);

  if (!parsed.success) {
    return createValidationErrorState(
      parsed.error.flatten().fieldErrors as Record<PlatformPaymentMethodField, string[]>,
      "Please review the platform payment method details.",
    );
  }

  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return createErrorFormState("Unauthorized");
  }

  const values = normalizePlatformPaymentMethodValues(parsed.data);

  try {
    await prisma.$transaction(async (tx) => {
      if (values.isDefault) {
        await tx.platformPaymentMethod.updateMany({
          where: {
            type: values.type as PlatformPaymentMethodType,
          },
          data: { isDefault: false },
        });
      }

      await tx.platformPaymentMethod.create({
        data: {
          type: values.type as PlatformPaymentMethodType,
          label: values.label,
          providerName: values.providerName,
          accountName: values.accountName,
          reference: values.reference,
          bankAddress: values.bankAddress,
          currency: values.currency,
          country: values.country,
          instructions: values.instructions,
          notes: values.notes,
          isPrivate: values.isPrivate,
          isActive: values.isActive,
          isDefault: values.isDefault,
          sortOrder: values.sortOrder,
          verificationStatus: values.verificationStatus,
          bankName: values.bankName,
          bankCode: values.bankCode,
          accountNumber: values.accountNumber,
          iban: values.iban,
          swiftCode: values.swiftCode,
          routingNumber: values.routingNumber,
          branchName: values.branchName,
          cryptoAsset: values.cryptoAsset,
          cryptoNetwork: values.cryptoNetwork,
          walletAddress: values.walletAddress,
          walletTag: values.walletTag,
        },
      });
    });

    revalidatePath("/account/dashboard/admin/platform-wallets");
    revalidatePath("/account/dashboard/super-admin/platform-wallets");

    return createSuccessFormState("Platform payment method added successfully.");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Unable to add this platform payment method right now. Please try again.",
      ),
    );
  }
}

export const createPlatformWallet = createPlatformPaymentMethod;
