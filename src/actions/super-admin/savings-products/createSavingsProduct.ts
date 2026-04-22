"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit/logAuditEvent";
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
import { getSavingsProductFormData } from "./savingsProductFormValues";

export async function createSavingsProduct(
  _prevState: SavingsProductFormState,
  formData: FormData,
): Promise<SavingsProductFormState> {
  try {
    const { userId } = await requireSuperAdminAccess();

    const parsed = savingsProductSchema.safeParse(getSavingsProductFormData(formData));

    if (!parsed.success) {
      return createValidationErrorState(
        parsed.error.flatten().fieldErrors,
        "Please fix the highlighted fields.",
      );
    }

    const data = parsed.data;

    const product = await prisma.savingsProduct.create({
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
      select: {
        id: true,
      },
    });

    await logAuditEvent({
      actorUserId: userId,
      action: "savings-product.created",
      entityType: "SavingsProduct",
      entityId: product.id,
      description: `Created savings product ${data.name}.`,
      metadata: {
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
        sortOrder: data.sortOrder,
      },
    });

    revalidatePath("/account/dashboard/super-admin/savings-products");
    revalidatePath(`/account/dashboard/super-admin/savings-products/${product.id}`);

    return {
      status: "success",
      message: "Savings product created successfully.",
      redirectHref: `/account/dashboard/super-admin/savings-products/${product.id}`,
    };
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
