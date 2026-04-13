"use server";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function setDefaultPlatformPaymentMethod(
  formData: FormData,
): Promise<void> {
  const platformPaymentMethodId = String(
    formData.get("platformPaymentMethodId") ?? "",
  ).trim();

  if (!platformPaymentMethodId) {
    throw new Error("Missing platform payment method id.");
  }

  const user = await getCurrentSessionUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const paymentMethod = await prisma.platformPaymentMethod.findUnique({
    where: {
      id: platformPaymentMethodId,
    },
    select: {
      id: true,
      type: true,
    },
  });

  if (!paymentMethod) {
    throw new Error("Platform payment method not found.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.platformPaymentMethod.updateMany({
      where: {
        type: paymentMethod.type,
      },
      data: { isDefault: false },
    });

    await tx.platformPaymentMethod.update({
      where: {
        id: paymentMethod.id,
      },
      data: {
        isDefault: true,
      },
    });
  });

  revalidatePath("/account/dashboard/admin/platform-wallets");
  revalidatePath("/account/dashboard/super-admin/platform-wallets");
}
