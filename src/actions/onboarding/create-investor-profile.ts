"use server";

import { getAgeFromIsoDate } from "@/lib/age";
import { prisma } from "@/lib/prisma";
import { normalizePhoneToE164 } from "@/lib/phone";
import { onboardingSchema } from "@/lib/zod/onboarding";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function createInvestorProfileAction(input: unknown) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const values = onboardingSchema.parse(input);
  const age = getAgeFromIsoDate(values.dateOfBirth);
  const normalizedPhoneNumber = values.phoneNumber
    ? normalizePhoneToE164({
        countryCallingCode: values.countryCallingCode,
        nationalNumber: values.phoneNumber,
      })
    : null;

  if (age === null || age < 18) {
    throw new Error("You must be at least 18 years old to continue.");
  }

  await prisma.$transaction([
    prisma.investorProfile.upsert({
      where: {
        userId: user.id,
      },
      update: {
        phoneNumber: normalizedPhoneNumber,
        dateOfBirth: new Date(values.dateOfBirth),
        age,
        country: values.country,
        state: values.state,
        city: values.city,
        addressLine1: values.addressLine1 || null,
        addressLine2: values.addressLine2 || null,
      },
      create: {
        userId: user.id,
        phoneNumber: normalizedPhoneNumber,
        dateOfBirth: new Date(values.dateOfBirth),
        age,
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
