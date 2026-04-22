"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit/logAuditEvent";
import {
  createErrorFormState,
  createValidationErrorState,
  getFriendlyServerError,
} from "@/lib/forms/actionState";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { savingsProductSchema } from "@/lib/zodValidations/savingsProduct.schema";
import type { SavingsProductFormState } from "./savingsProductForm.state";
import { getSavingsProductFormData } from "./savingsProductFormValues";

function createErrorState(
  message: string,
  fieldErrors?: SavingsProductFormState["fieldErrors"],
): SavingsProductFormState {
  return createErrorFormState(message, fieldErrors);
}

export async function updateSavingsProduct(
  savingsProductId: string,
  _prevState: SavingsProductFormState,
  formData: FormData,
): Promise<SavingsProductFormState> {
  try {
    const { userId } = await requireSuperAdminAccess();

    const parsed = savingsProductSchema.safeParse(getSavingsProductFormData(formData));

    if (!parsed.success) {
      return createValidationErrorState(
        parsed.error.flatten().fieldErrors,
        "Please review the highlighted savings product fields.",
      );
    }

    const existingProduct = await prisma.savingsProduct.findUnique({
      where: { id: savingsProductId },
      select: {
        id: true,
        name: true,
        description: true,
        interestEnabled: true,
        interestRatePercent: true,
        interestPayoutFrequency: true,
        isLockable: true,
        minimumLockDays: true,
        maximumLockDays: true,
        allowsWithdrawals: true,
        allowsDeposits: true,
        minBalance: true,
        maxBalance: true,
        currency: true,
        isActive: true,
        sortOrder: true,
      },
    });

    if (!existingProduct) {
      return createErrorState("This savings product could not be found.");
    }

    const data = parsed.data;

    await prisma.savingsProduct.update({
      where: { id: savingsProductId },
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

    await logAuditEvent({
      actorUserId: userId,
      action: "savings-product.updated",
      entityType: "SavingsProduct",
      entityId: savingsProductId,
      description: `Updated savings product ${data.name}.`,
      metadata: {
        previous: existingProduct,
        next: {
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
      },
    });

    revalidatePath("/account/dashboard/super-admin/savings-products");
    revalidatePath(`/account/dashboard/super-admin/savings-products/${savingsProductId}`);

    return {
      status: "success",
      message: "Savings product updated successfully.",
      redirectHref: `/account/dashboard/super-admin/savings-products/${savingsProductId}`,
    };
  } catch (error) {
    return createErrorState(
      getFriendlyServerError(
        error,
        "Unable to update this savings product right now.",
      ),
    );
  }
}
