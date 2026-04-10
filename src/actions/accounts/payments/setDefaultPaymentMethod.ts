"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

export async function setDefaultPaymentMethod(formData: FormData) {
  const id = formData.get("id") as string;

  const user = await getCurrentSessionUser();
  if (!user?.id) throw new Error("Unauthorized");

  const profile = await prisma.investorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) throw new Error("Profile not found");

  await prisma.paymentMethod.updateMany({
    where: { investorProfileId: profile.id },
    data: { isDefault: false },
  });

  await prisma.paymentMethod.update({
    where: { id },
    data: { isDefault: true },
  });
}
