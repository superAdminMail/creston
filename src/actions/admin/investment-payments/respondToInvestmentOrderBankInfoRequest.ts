"use server";

import { revalidatePath } from "next/cache";

import {
  createErrorFormState,
  createSuccessFormState,
  getFriendlyServerError,
} from "@/lib/forms/actionState";
import {
  INVESTMENT_ORDER_BANK_INFO_READY_KIND,
} from "@/lib/notifications/investmentOrderBankInfo";
import { upsertSystemNotifications } from "@/lib/notifications/upsertSystemNotifications";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { prisma } from "@/lib/prisma";
import {
  normalizePlatformPaymentMethodValues,
  platformPaymentMethodSchema,
  type PlatformPaymentMethodFormInput,
} from "@/lib/zodValidations/platform-wallet";

export type RespondToInvestmentOrderBankInfoRequestState = {
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

export async function respondToInvestmentOrderBankInfoRequest(
  _previousState: RespondToInvestmentOrderBankInfoRequestState,
  formData: FormData,
): Promise<RespondToInvestmentOrderBankInfoRequestState> {
  const { userId, role } = await requireDashboardRoleAccess([
    "ADMIN",
    "SUPER_ADMIN",
  ]);

  const orderId = String(formData.get("orderId") ?? "").trim();

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
    verificationStatus: getStringValue(formData, "verificationStatus") as PlatformPaymentMethodFormInput["verificationStatus"],
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

  if (!orderId) {
    return createErrorFormState("Missing investment order id.");
  }

  const order = await prisma.investmentOrder.findUnique({
    where: { id: orderId },
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
      investmentPlan: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!order) {
    return createErrorFormState("Investment order not found.");
  }

  if (!order.investorProfile.user.id) {
    return createErrorFormState("The order owner could not be resolved.");
  }

  const values = normalizePlatformPaymentMethodValues(parsed.data);

  try {
    await prisma.$transaction(async (tx) => {
      const platformPaymentMethod = await tx.platformPaymentMethod.create({
        data: {
          type: "BANK_INFO",
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

      await tx.investmentOrder.update({
        where: { id: order.id },
        data: {
          paymentMethodType: "BANK_TRANSFER",
          platformPaymentMethodId: platformPaymentMethod.id,
        },
      });

      await upsertSystemNotifications(tx, [
        {
          key: `investment-order-bank-info-ready:${order.id}`,
          userId: order.investorProfile.user.id,
          title: "Bank details are ready",
          message: `Bank transfer details for your investment order ${order.id} are now available.`,
          link: `/account/dashboard/user/investment-orders/${order.id}/payment`,
          metadata: {
            kind: INVESTMENT_ORDER_BANK_INFO_READY_KIND,
            orderId: order.id,
            requesterId: order.investorProfile.user.id,
            platformPaymentMethodId: platformPaymentMethod.id,
            respondedByUserId: userId,
            respondedByRole: role,
          },
        },
      ]);
    });

    revalidatePath("/account/dashboard/admin/investment-payments");
    revalidatePath(`/account/dashboard/admin/investment-payments/${order.id}`);
    revalidatePath(`/account/dashboard/user/investment-orders/${order.id}/payment`);
    revalidatePath("/account/dashboard/notifications");

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
