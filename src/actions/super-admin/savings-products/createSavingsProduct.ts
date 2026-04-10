"use server";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { savingsProductSchema } from "@/lib/zodValidations/savingsProduct.schema";
import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  getFriendlyServerError,
} from "@/lib/forms/actionState";

import { SavingsProductFormState } from "./savingsProductForm.state";

export async function createSavingsProduct(
  _prevState: SavingsProductFormState,
  formData: FormData,
): Promise<SavingsProductFormState> {
  try {
    await requireSuperAdminAccess();

    const raw = Object.fromEntries(formData.entries());

    const parsed = savingsProductSchema.safeParse({
      ...raw,
      interestEnabled: raw.interestEnabled === "true",
      isLockable: raw.isLockable === "true",
      allowsWithdrawals: raw.allowsWithdrawals === "true",
      allowsDeposits: raw.allowsDeposits === "true",
      isActive: raw.isActive === "true",
    });

    if (!parsed.success) {
      return createValidationErrorState(
        parsed.error.flatten().fieldErrors,
        "Please fix the highlighted fields.",
      );
    }

    const data = parsed.data;

    await prisma.savingsProduct.create({
      data: {
        name: data.name,
        description: data.description,

        interestEnabled: data.interestEnabled,
        interestRatePercent: data.interestRatePercent,
        interestPayoutFrequency: data.interestPayoutFrequency,

        isLockable: data.isLockable,
        minimumLockDays: data.minimumLockDays,
        maximumLockDays: data.maximumLockDays,

        allowsWithdrawals: data.allowsWithdrawals,
        allowsDeposits: data.allowsDeposits,

        minBalance: data.minBalance,
        maxBalance: data.maxBalance,

        currency: data.currency,
        isActive: data.isActive,
        sortOrder: Number(data.sortOrder),
      },
    });

    return createSuccessFormState("Savings product created successfully.");
  } catch (error) {
    console.error(error);

    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Something went wrong while creating the savings product.",
      ),
    );
  }
}
