"use server";

import { getAgeFromIsoDate } from "@/lib/formatters/age";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { normalizePhoneToE164 } from "@/lib/formatters/phone";
import type { FormFieldErrors } from "@/lib/forms/actionState";
import { prisma } from "@/lib/prisma";
import {
  onboardingSchema,
  type OnboardingSchemaType,
} from "@/lib/zodValidations/onboarding";

type UpsertCurrentUserInvestorProfileOptions = {
  markOnboardingComplete?: boolean;
};

type OnboardingFieldName =
  | "countryCallingCode"
  | "phoneNumber"
  | "dateOfBirth"
  | "confirmAdultAge"
  | "country"
  | "state"
  | "city"
  | "addressLine1"
  | "addressLine2";

export type UpsertCurrentUserInvestorProfileResult = {
  success?: true;
  error?: string;
  fieldErrors?: FormFieldErrors<OnboardingFieldName>;
};

export async function upsertCurrentUserInvestorProfile(
  input: unknown,
  options: UpsertCurrentUserInvestorProfileOptions = {},
): Promise<UpsertCurrentUserInvestorProfileResult> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  const parsed = onboardingSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "Please review the highlighted profile fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const values = parsed.data;
  const age = getAgeFromIsoDate(values.dateOfBirth);
  const normalizedPhoneNumber = values.phoneNumber
    ? normalizePhoneToE164({
        countryCallingCode: values.countryCallingCode,
        nationalNumber: values.phoneNumber,
        country: values.country,
      })
    : null;

  if (age === null || age < 18) {
    return {
      error: "You must be at least 18 years old to continue.",
      fieldErrors: {
        dateOfBirth: ["You must be at least 18 years old to continue."],
        confirmAdultAge: [
          "Age confirmation is only available for adults 18 and above.",
        ],
      },
    };
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
  return upsertCurrentUserInvestorProfile(input);
}
