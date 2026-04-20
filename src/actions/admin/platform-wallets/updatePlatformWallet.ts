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
  updatePlatformPaymentMethodSchema,
  type UpdatePlatformPaymentMethodFormInput,
} from "@/lib/zodValidations/platform-wallet";
import { PlatformPaymentMethodFormActionState } from "./platformWalletForm.state";

type PlatformPaymentMethodField = keyof Omit<
  UpdatePlatformPaymentMethodFormInput,
  "platformPaymentMethodId"
>;

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

export async function updatePlatformPaymentMethod(
  _previousState: PlatformPaymentMethodFormActionState,
  formData: FormData,
): Promise<PlatformPaymentMethodFormActionState> {
  const parsed = updatePlatformPaymentMethodSchema.safeParse({
    platformPaymentMethodId: formData.get("platformPaymentMethodId"),
    type: getStringValue(formData, "type"),
    label: getStringValue(formData, "label"),
    providerName: getStringValue(formData, "providerName"),
    accountName: getStringValue(formData, "accountName"),
    currency: getStringValue(formData, "currency"),
    country: getStringValue(formData, "country"),
    instructions: getStringValue(formData, "instructions"),
    notes: getStringValue(formData, "notes"),
    isPrivate: getBooleanValue(formData, "isPrivate", false),
    isActive: getBooleanValue(formData, "isActive", true),
    isDefault: getBooleanValue(formData, "isDefault", false),
    sortOrder: getNumberValue(formData, "sortOrder"),
    verificationStatus: getStringValue(formData, "verificationStatus"),
    bankName: getStringValue(formData, "bankName"),
    bankCode: getStringValue(formData, "bankCode"),
    accountNumber: getStringValue(formData, "accountNumber"),
    iban: getStringValue(formData, "iban"),
    swiftCode: getStringValue(formData, "swiftCode"),
    routingNumber: getStringValue(formData, "routingNumber"),
    branchName: getStringValue(formData, "branchName"),
    cryptoAsset: getStringValue(formData, "cryptoAsset"),
    cryptoNetwork: getStringValue(formData, "cryptoNetwork"),
    walletAddress: getStringValue(formData, "walletAddress"),
    walletTag: getStringValue(formData, "walletTag"),
  });

  if (!parsed.success) {
    return createValidationErrorState(
      parsed.error.flatten().fieldErrors as Record<PlatformPaymentMethodField | "platformPaymentMethodId", string[]>,
      "Please review the platform payment method details.",
    );
  }

  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return createErrorFormState("Unauthorized");
  }

  const { platformPaymentMethodId, ...values } = parsed.data;

  const normalized = normalizePlatformPaymentMethodValues(values);

  try {
    await prisma.$transaction(async (tx) => {
      if (normalized.isDefault) {
        await tx.platformPaymentMethod.updateMany({
          where: {
            type: normalized.type as PlatformPaymentMethodType,
          },
          data: { isDefault: false },
        });
      }

      await tx.platformPaymentMethod.update({
        where: { id: platformPaymentMethodId },
        data: {
          type: normalized.type as PlatformPaymentMethodType,
          label: normalized.label,
          providerName: normalized.providerName,
          accountName: normalized.accountName,
          currency: normalized.currency,
          country: normalized.country,
          instructions: normalized.instructions,
          notes: normalized.notes,
          isPrivate: normalized.isPrivate,
          isActive: normalized.isActive,
          isDefault: normalized.isDefault,
          sortOrder: normalized.sortOrder,
          verificationStatus: normalized.verificationStatus,
          bankName: normalized.bankName,
          bankCode: normalized.bankCode,
          accountNumber: normalized.accountNumber,
          iban: normalized.iban,
          swiftCode: normalized.swiftCode,
          routingNumber: normalized.routingNumber,
          branchName: normalized.branchName,
          cryptoAsset: normalized.cryptoAsset,
          cryptoNetwork: normalized.cryptoNetwork,
          walletAddress: normalized.walletAddress,
          walletTag: normalized.walletTag,
        },
      });
    });

    revalidatePath("/account/dashboard/admin/platform-wallets");
    revalidatePath("/account/dashboard/super-admin/platform-wallets");

    return createSuccessFormState("Platform payment method updated successfully.");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Unable to update this platform payment method right now. Please try again.",
      ),
    );
  }
}

export const updatePlatformWallet = updatePlatformPaymentMethod;
