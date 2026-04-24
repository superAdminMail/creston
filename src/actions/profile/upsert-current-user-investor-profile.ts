"use server";

import { getAgeFromIsoDate } from "@/lib/formatters/age";
import { getCurrentUser } from "@/lib/getCurrentUser";
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
  | "addressLine1";

export type UpsertCurrentUserInvestorProfileResult = {
  success?: true;
  error?: string;
  fieldErrors?: FormFieldErrors<OnboardingFieldName>;
  currentUser?: Awaited<ReturnType<typeof getCurrentUser>>;
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
  };

  const profileWrite = prisma.investorProfile
    .update({
      where: {
        userId: user.id,
      },
      data: profileWriteData,
    })
    .catch(async (error: unknown) => {
      const maybePrismaError = error as { code?: string };

      if (maybePrismaError.code !== "P2025") {
        throw error;
      }

      return prisma.investorProfile.create({
        data: {
          userId: user.id,
          ...profileWriteData,
        },
      });
    });

  if (options.markOnboardingComplete) {
    await profileWrite;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hasCompletedOnboarding: true,
        skippedOnboardingAt: null,
      },
    });
  } else {
    await profileWrite;
  }

  return {
    success: true,
    currentUser: await getCurrentUser(),
  };
}

export async function updateCurrentUserInvestorProfileAction(
  input: OnboardingSchemaType,
) {
  return upsertCurrentUserInvestorProfile(input);
}
