"use server";

import { getAgeFromIsoDate } from "@/lib/formatters/age";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { normalizePhoneToE164 } from "@/lib/formatters/phone";
import { prisma } from "@/lib/prisma";
import {
  onboardingSchema,
  type OnboardingSchemaType,
} from "@/lib/zodValidations/onboarding";

type UpsertCurrentUserInvestorProfileOptions = {
  markOnboardingComplete?: boolean;
};

export async function upsertCurrentUserInvestorProfile(
  input: unknown,
  options: UpsertCurrentUserInvestorProfileOptions = {},
) {
  const user = await getCurrentSessionUser();

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

  const profileWriteData = {
    phoneNumber: normalizedPhoneNumber,
    dateOfBirth: new Date(values.dateOfBirth),
    age,
    country: values.country,
    state: values.state,
    city: values.city,
    addressLine1: values.addressLine1 || null,
    addressLine2: values.addressLine2 || null,
  };

  await prisma.$transaction(async (tx) => {
    await tx.investorProfile.upsert({
      where: {
        userId: user.id,
      },
      update: profileWriteData,
      create: {
        userId: user.id,
        ...profileWriteData,
      },
    });

    if (options.markOnboardingComplete) {
      await tx.user.update({
        where: { id: user.id },
        data: {
          hasCompletedOnboarding: true,
          skippedOnboardingAt: null,
        },
      });
    }
  });

  return { success: true };
}

export async function updateCurrentUserInvestorProfileAction(
  input: OnboardingSchemaType,
) {
  await upsertCurrentUserInvestorProfile(input);
  return { success: true } as const;
}
