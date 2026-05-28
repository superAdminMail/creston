"use server";

import { createErrorFormState, createSuccessFormState } from "@/lib/forms/actionState";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { cleanupDeletedBankInfoRequestState } from "@/lib/payments/bank/cleanupDeletedBankInfoRequestState";
import { revalidatePath } from "next/cache";
import { PlatformPaymentMethodFormActionState } from "./platformWalletForm.state";

type DeletePlatformPaymentMethodState = PlatformPaymentMethodFormActionState;

export async function deletePlatformPaymentMethod(
  _: DeletePlatformPaymentMethodState,
  formData: FormData,
): Promise<DeletePlatformPaymentMethodState> {
  const id = String(formData.get("platformPaymentMethodId") ?? "").trim();

  if (!id) {
    return createErrorFormState("Missing platform payment method id.");
  }

  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return createErrorFormState("Unauthorized");
  }

  const paymentMethod = await prisma.platformPaymentMethod.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      isDefault: true,
      type: true,
    },
  });

  if (!paymentMethod) {
    return createErrorFormState("Platform payment method not found.");
  }

  const revalidatePaths = new Set<string>();

  try {
    await prisma.$transaction(async (tx) => {
      const cleanupResult = await cleanupDeletedBankInfoRequestState(tx, {
        platformPaymentMethodId: paymentMethod.id,
        paymentMethodType: paymentMethod.type,
      });

      cleanupResult.revalidatePaths.forEach((path) => {
        revalidatePaths.add(path);
      });

      await tx.platformPaymentMethod.delete({
        where: { id: paymentMethod.id },
      });

      if (!paymentMethod.isDefault) {
        return;
      }

      const replacement = await tx.platformPaymentMethod.findFirst({
        where: {
          type: paymentMethod.type,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
        },
      });

      if (!replacement) {
        return;
      }

      await tx.platformPaymentMethod.update({
        where: { id: replacement.id },
        data: {
          isDefault: true,
        },
      });
    });
  } catch (error) {
    return createErrorFormState(
      error instanceof Error
        ? error.message
        : "Unable to remove this payment method right now.",
    );
  }

  revalidatePath("/account/dashboard/admin/payment-methods");
  revalidatePath("/account/dashboard/super-admin/payment-methods");
  revalidatePath("/account/dashboard/super-admin/platform-wallets");

  for (const path of revalidatePaths) {
    revalidatePath(path);
  }

  return createSuccessFormState("Platform payment method removed successfully.");
}

export const deletePlatformWallet = deletePlatformPaymentMethod;
