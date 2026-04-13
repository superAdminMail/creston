"use server";

import { createErrorFormState, createSuccessFormState } from "@/lib/forms/actionState";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
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

  await prisma.$transaction(async (tx) => {
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

  revalidatePath("/account/dashboard/admin/platform-wallets");
  revalidatePath("/account/dashboard/super-admin/platform-wallets");

  return createSuccessFormState("Platform payment method removed successfully.");
}

export const deletePlatformWallet = deletePlatformPaymentMethod;
