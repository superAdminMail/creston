"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { PaymentMethodType } from "@/generated/prisma";

export async function createPaymentMethod(formData: FormData) {
  const type = formData.get("type") as string;

  const user = await getCurrentSessionUser();
  if (!user?.id) throw new Error("Unauthorized");

  const profile = await prisma.investorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) throw new Error("Profile not found");

  await prisma.paymentMethod.create({
    data: {
      investorProfileId: profile.id,
      type: type as PaymentMethodType,
      bankName: formData.get("bankName") as string,
      accountName: formData.get("accountName") as string,
      accountNumber: formData.get("accountNumber") as string,
      network: formData.get("network") as string,
      address: formData.get("address") as string,
    },
  });
}
