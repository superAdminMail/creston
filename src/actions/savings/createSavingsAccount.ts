"use server";

import { KycStatus, Prisma, SavingsStatus } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  getFriendlyServerError,
  type FormActionState,
} from "@/lib/forms/actionState";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { createSavingsAccountSchema } from "@/lib/zodValidations/account-operations";

type CreateSavingsAccountFieldName =
  | "productId"
  | "name"
  | "description"
  | "targetAmount"
  | "lockSavings";

export type CreateSavingsAccountState =
  FormActionState<CreateSavingsAccountFieldName>;

function normalizeDescription(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseTargetAmount(value: string | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return new Prisma.Decimal(trimmed);
}

export async function createSavingsAccount(
  _prevState: CreateSavingsAccountState,
  formData: FormData,
): Promise<CreateSavingsAccountState> {
  const parsed = createSavingsAccountSchema.safeParse({
    productId: formData.get("productId"),
    name: formData.get("name"),
    description: formData.get("description"),
    targetAmount: formData.get("targetAmount"),
    lockSavings: String(formData.get("lockSavings") ?? "false"),
  });

  if (!parsed.success) {
    return createValidationErrorState(
      parsed.error.flatten().fieldErrors,
      "Please review the highlighted savings account fields.",
    );
  }

  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return createErrorFormState("Please sign in to continue.");
  }

  const profile = await prisma.investorProfile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      kycStatus: true,
    },
  });

  if (!profile) {
    return createErrorFormState(
      "Complete your profile before opening a savings account.",
    );
  }

  if (profile.kycStatus !== KycStatus.VERIFIED) {
    return createErrorFormState(
      "Verify your identity before opening a savings account.",
      {
        productId: ["KYC verification is required before you can open savings."],
      },
    );
  }

  const product = await prisma.savingsProduct.findUnique({
    where: { id: parsed.data.productId },
    select: {
      id: true,
      name: true,
      isActive: true,
      currency: true,
      isLockable: true,
      minimumLockDays: true,
    },
  });

  if (!product || !product.isActive) {
    return createErrorFormState(
      "The selected savings product is no longer available.",
    );
  }

  if (parsed.data.lockSavings && !product.isLockable) {
    return createErrorFormState(
      "This savings product does not support locking.",
      {
        lockSavings: ["Choose a lockable product or disable account locking."],
      },
    );
  }

  const now = new Date();
  const lockedUntil =
    parsed.data.lockSavings && product.minimumLockDays
      ? new Date(now.getTime() + product.minimumLockDays * 24 * 60 * 60 * 1000)
      : null;

  try {
    await prisma.savingsAccount.create({
      data: {
        investorProfileId: profile.id,
        savingsProductId: product.id,
        name: parsed.data.name.trim(),
        description: normalizeDescription(parsed.data.description),
        targetAmount: parseTargetAmount(parsed.data.targetAmount),
        currency: product.currency,
        balance: new Prisma.Decimal(0),
        isLocked: Boolean(parsed.data.lockSavings),
        lockedUntil,
        status: SavingsStatus.ACTIVE,
      },
    });
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(
        error,
        "We could not open your savings account right now.",
      ),
    );
  }

  revalidatePath("/account/dashboard/user/savings");

  return createSuccessFormState("Savings account opened successfully.");
}
