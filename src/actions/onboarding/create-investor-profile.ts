"use server";

import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/zod/onboarding";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function createInvestorProfileAction(input: unknown) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const values = onboardingSchema.parse(input);

  await prisma.$transaction([
    prisma.investorProfile.upsert({
      where: {
        userId: user.id,
      },
      update: {
        phoneNumber: values.phoneNumber || null,
        dateOfBirth: new Date(values.dateOfBirth),
        country: values.country,
        state: values.state,
        city: values.city,
        addressLine1: values.addressLine1 || null,
        addressLine2: values.addressLine2 || null,
      },
      create: {
        userId: user.id,
        phoneNumber: values.phoneNumber || null,
        dateOfBirth: new Date(values.dateOfBirth),
        country: values.country,
        state: values.state,
        city: values.city,
        addressLine1: values.addressLine1 || null,
        addressLine2: values.addressLine2 || null,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        hasCompletedOnboarding: true,
        skippedOnboardingAt: null,
      },
    }),
  ]);

  return { success: true };
}
