"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { redirect } from "next/navigation";
import {
  createErrorFormState,
  createValidationErrorState,
  type FormActionState,
} from "@/lib/forms/actionState";
import { createSavingsAccountSchema } from "@/lib/zodValidations/account-operations";

export type CreateSavingsAccountState = FormActionState<"productId">;

export async function createSavingsAccount(
  _prevState: CreateSavingsAccountState,
  formData: FormData,
): Promise<CreateSavingsAccountState> {
  const parsed = createSavingsAccountSchema.safeParse({
    productId: formData.get("productId"),
  });

  if (!parsed.success) {
    return createValidationErrorState(
      parsed.error.flatten().fieldErrors,
      "Please select a savings product to continue.",
    );
  }

  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return createErrorFormState("Please sign in to continue.");
  }

  const investorProfile = await prisma.investorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!investorProfile) {
    return createErrorFormState(
      "Complete your profile before opening a savings account.",
    );
  }

  const { productId } = parsed.data;

  const product = await prisma.savingsProduct.findUnique({
    where: { id: productId },
  });

  if (!product || !product.isActive) {
    return createErrorFormState(
      "The selected savings product is no longer available.",
    );
  }

  const existing = await prisma.savingsAccount.findFirst({
    where: {
      investorProfileId: investorProfile.id,
      savingsProductId: productId,
    },
  });

  if (existing) {
    return createErrorFormState("You already have this savings account.");
  }

  await prisma.savingsAccount.create({
    data: {
      investorProfileId: investorProfile.id,
      savingsProductId: productId,
      name: product.name,
      currency: product.currency,
      balance: 0,
    },
  });

  redirect("/account/dashboard/user/savings");
}
