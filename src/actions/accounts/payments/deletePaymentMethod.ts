"use server";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";

export async function deletePaymentMethod(id: string) {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  const profile = await prisma.investorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!profile) {
    return { error: "Investor profile not found." };
  }

  const paymentMethod = await prisma.paymentMethod.findFirst({
    where: {
      id,
      investorProfileId: profile.id,
    },
    select: {
      id: true,
      isDefault: true,
    },
  });

  if (!paymentMethod) {
    return { error: "Payment method not found." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.paymentMethod.delete({
      where: { id: paymentMethod.id },
    });

    if (!paymentMethod.isDefault) {
      return;
    }

    const replacement = await tx.paymentMethod.findFirst({
      where: {
        investorProfileId: profile.id,
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

    await tx.paymentMethod.update({
      where: { id: replacement.id },
      data: {
        isDefault: true,
      },
    });
  });

  return { success: true };
}
