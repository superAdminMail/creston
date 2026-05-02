"use server";

import { revalidatePath } from "next/cache";

import {
  createErrorFormState,
  createSuccessFormState,
  getFriendlyServerError,
} from "@/lib/forms/actionState";
import { SAVINGS_FUNDING_BANK_INFO_REQUEST_ACK_KIND } from "@/lib/notifications/savingsFundingBankInfo";
import { upsertSystemNotifications } from "@/lib/notifications/upsertSystemNotifications";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { prisma } from "@/lib/prisma";
import {
  normalizePlatformPaymentMethodValues,
  platformPaymentMethodSchema,
  type PlatformPaymentMethodFormInput,
} from "@/lib/zodValidations/platform-wallet";
import { PlatformPaymentMethodType } from "@/generated/prisma";

export type RespondToSavingsFundingBankInfoRequestState = {
  status: "idle" | "success" | "error";
  message?: string;
};

type PlatformPaymentMethodField = keyof PlatformPaymentMethodFormInput;

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

export async function respondToSavingsFundingBankInfoRequest(
  _previousState: RespondToSavingsFundingBankInfoRequestState,
  formData: FormData,
): Promise<RespondToSavingsFundingBankInfoRequestState> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const savingsAccountId = String(formData.get("savingsAccountId") ?? "").trim();

  const submittedValues: PlatformPaymentMethodFormInput = {
    type: "BANK_INFO",
    label: getStringValue(formData, "label"),
    providerName: getStringValue(formData, "providerName"),
    accountName: getStringValue(formData, "accountName"),
    reference: getStringValue(formData, "reference"),
    bankAddress: getStringValue(formData, "bankAddress"),
    currency: getStringValue(formData, "currency"),
    country: getStringValue(formData, "country"),
    instructions: getStringValue(formData, "instructions"),
    notes: getStringValue(formData, "notes"),
    isPrivate: true,
    isActive: getBooleanValue(formData, "isActive", true),
    isDefault: getBooleanValue(formData, "isDefault", false),
    sortOrder: getNumberValue(formData, "sortOrder"),
    verificationStatus:
      getStringValue(formData, "verificationStatus") as PlatformPaymentMethodFormInput["verificationStatus"],
    bankName: getStringValue(formData, "bankName"),
    bankCode: getStringValue(formData, "bankCode"),
    accountNumber: getStringValue(formData, "accountNumber"),
    iban: getStringValue(formData, "iban"),
    swiftCode: getStringValue(formData, "swiftCode"),
    routingNumber: getStringValue(formData, "routingNumber"),
    branchName: getStringValue(formData, "branchName"),
    cryptoAsset: "",
    cryptoNetwork: "",
    walletAddress: "",
    walletTag: "",
  };

  const parsed = platformPaymentMethodSchema.safeParse(submittedValues);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return createErrorFormState(
      firstIssue?.message ?? "Please review the bank details before sending them.",
    );
  }

  if (!savingsAccountId) {
    return createErrorFormState("Missing savings account id.");
  }

  const account = await prisma.savingsAccount.findUnique({
    where: { id: savingsAccountId },
    select: {
      id: true,
      currency: true,
      investorProfile: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      savingsProduct: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!account) {
    return createErrorFormState("Savings account not found.");
  }

  if (!account.investorProfile.user.id) {
    return createErrorFormState("The account owner could not be resolved.");
  }

  const values = normalizePlatformPaymentMethodValues(parsed.data);
  const checkoutUrl = `/account/dashboard/checkout?targetType=SAVINGS_FUNDING&targetId=${encodeURIComponent(account.id)}&fundingMethodType=BANK_TRANSFER`;

  try {
    await prisma.$transaction(async (tx) => {
      const platformPaymentMethod = await tx.platformPaymentMethod.create({
        data: {
          type: PlatformPaymentMethodType.BANK_INFO,
          label: values.label,
          providerName: values.providerName,
          accountName: values.accountName,
          reference: values.reference,
          bankAddress: values.bankAddress,
          currency: values.currency,
          country: values.country,
          instructions: values.instructions,
          notes: values.notes,
          isPrivate: true,
          isActive: values.isActive,
          isDefault: false,
          sortOrder: values.sortOrder,
          verificationStatus: "VERIFIED",
          bankName: values.bankName,
          bankCode: values.bankCode,
          accountNumber: values.accountNumber,
          iban: values.iban,
          swiftCode: values.swiftCode,
          routingNumber: values.routingNumber,
          branchName: values.branchName,
          cryptoAsset: null,
          cryptoNetwork: null,
          walletAddress: null,
          walletTag: null,
        },
        select: {
          id: true,
        },
      });

      await upsertSystemNotifications(tx, [
        {
          key: `savings-funding-bank-info-request-ack:${account.id}:${account.investorProfile.user.id}`,
          userId: account.investorProfile.user.id,
          title: "Bank details are ready",
          message: `Bank transfer details for your savings account ${account.id} are now available.`,
          link: checkoutUrl,
          metadata: {
            kind: SAVINGS_FUNDING_BANK_INFO_REQUEST_ACK_KIND,
            savingsAccountId: account.id,
            requesterId: account.investorProfile.user.id,
            platformPaymentMethodId: platformPaymentMethod.id,
          },
        },
      ]);
    });

    revalidatePath("/account/dashboard/checkout");
    revalidatePath("/account/dashboard/notifications");
    revalidatePath("/account/dashboard/admin/payment-methods");
    revalidatePath("/account/dashboard/super-admin/payment-methods");

    return createSuccessFormState("Bank details sent to the requesting user.");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Unable to send bank details right now. Please try again.",
      ),
    );
  }
}
