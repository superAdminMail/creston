"use server";

import { PaymentMethodType } from "@/generated/prisma";
import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  getFriendlyServerError,
  type FormActionState,
} from "@/lib/forms/actionState";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { createPaymentMethodSchema } from "@/lib/zodValidations/account-operations";

type PaymentMethodField =
  | "type"
  | "bankName"
  | "accountName"
  | "accountNumber"
  | "network"
  | "address";

export async function createPaymentMethod(
  _previousState: FormActionState<PaymentMethodField>,
  formData: FormData,
): Promise<FormActionState<PaymentMethodField>> {
  const getStringValue = (key: PaymentMethodField) => {
    const value = formData.get(key);

    return typeof value === "string" ? value : "";
  };

  const submittedValues = {
    type: getStringValue("type"),
    bankName: getStringValue("bankName"),
    accountName: getStringValue("accountName"),
    accountNumber: getStringValue("accountNumber"),
    network: getStringValue("network"),
    address: getStringValue("address"),
  };

  const parsed = createPaymentMethodSchema.safeParse(submittedValues);

  if (!parsed.success) {
    return createValidationErrorState(
      parsed.error.flatten().fieldErrors as Record<PaymentMethodField, string[]>,
      "Please review the payment method details.",
    );
  }

  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return createErrorFormState("Unauthorized");
  }

  const profile = await prisma.investorProfile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      kycStatus: true,
      paymentMethods: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!profile) {
    return createErrorFormState("Investor profile not found.");
  }

  if (profile.kycStatus !== "VERIFIED") {
    return createErrorFormState("Complete identity verification before adding a payment method.");
  }

  const values = parsed.data;

  try {
    await prisma.paymentMethod.create({
      data: {
        investorProfileId: profile.id,
        type: values.type as PaymentMethodType,
        bankName: values.type === "BANK" ? values.bankName : null,
        accountName: values.type === "BANK" ? values.accountName : null,
        accountNumber: values.type === "BANK" ? values.accountNumber : null,
        network: values.type === "CRYPTO" ? values.network : null,
        address: values.type === "CRYPTO" ? values.address : null,
        isDefault: profile.paymentMethods.length === 0,
      },
    });

    return createSuccessFormState("Payment method added successfully.");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Unable to add this payment method right now. Please try again.",
      ),
    );
  }
}
