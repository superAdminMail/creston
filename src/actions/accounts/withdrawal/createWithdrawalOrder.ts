"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  type FormActionState,
} from "@/lib/forms/actionState";
import { createWithdrawalOrderSchema } from "@/lib/zodValidations/account-operations";

export type CreateWithdrawalOrderState = FormActionState<
  "amount" | "methodId"
>;

export async function createWithdrawalOrder(
  _prevState: CreateWithdrawalOrderState,
  formData: FormData,
): Promise<CreateWithdrawalOrderState> {
  const parsed = createWithdrawalOrderSchema.safeParse({
    amount: formData.get("amount"),
    methodId: formData.get("methodId"),
  });

  if (!parsed.success) {
    return createValidationErrorState(
      parsed.error.flatten().fieldErrors,
      "Please review your withdrawal details.",
    );
  }

  const user = await getCurrentSessionUser();
  if (!user?.id) {
    return createErrorFormState("Please sign in to continue.");
  }

  const profile = await prisma.investorProfile.findUnique({
    where: { userId: user.id },
    include: { paymentMethods: true },
  });

  if (!profile) {
    return createErrorFormState("Profile not found.");
  }

  if (profile.kycStatus !== "VERIFIED") {
    return createErrorFormState(
      "Complete identity verification before requesting a withdrawal.",
    );
  }

  const { amount, methodId } = parsed.data;

  const method = profile.paymentMethods.find((m) => m.id === methodId);

  if (!method) {
    return createErrorFormState("Please select a valid payment method.", {
      methodId: ["Please select a valid payment method."],
    });
  }

  const payoutSnapshot = {
    type: method.type,
    bankName: method.bankName,
    accountName: method.accountName,
    accountNumber: method.accountNumber,
    network: method.network,
    address: method.address,
  };

  await prisma.withdrawalOrder.create({
    data: {
      investorProfileId: profile.id,
      amount,
      currency: "USD",
      payoutMethodId: method.id,
      payoutSnapshot,
      status: "PENDING",
    },
  });

  return createSuccessFormState("Withdrawal request submitted.");
}
