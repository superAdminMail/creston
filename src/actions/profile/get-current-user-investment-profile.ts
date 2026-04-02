"use server";

import { format } from "date-fns";
import { KycStatus } from "@/generated/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { splitE164PhoneNumber } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import type { OnboardingSchemaInput } from "@/lib/zod/onboarding";

export type CurrentUserInvestmentProfileData = {
  userName: string;
  email: string;
  profileStatusLabel: string;
  kycStatusLabel: string;
  profileComplete: boolean;
  completionPercent: number;
  completedFieldCount: number;
  totalFieldCount: number;
  details: {
    fullName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    country: string;
    state: string;
    city: string;
    addressLine1: string;
    addressLine2: string;
  };
  editDefaults: OnboardingSchemaInput;
};

const PROFILE_COMPLETION_FIELDS = [
  "fullName",
  "email",
  "phoneNumber",
  "dateOfBirth",
  "country",
  "state",
  "city",
  "addressLine1",
  "addressLine2",
] as const;

function formatKycStatus(status: KycStatus | null | undefined) {
  if (!status) return "Not started";

  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toIsoDate(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function formatDisplayDate(value: Date | null | undefined) {
  return value ? format(value, "MMMM d, yyyy") : "";
}

function getCompletionSnapshot(details: CurrentUserInvestmentProfileData["details"]) {
  const completedFieldCount = PROFILE_COMPLETION_FIELDS.filter((field) =>
    Boolean(details[field]?.trim()),
  ).length;
  const totalFieldCount = PROFILE_COMPLETION_FIELDS.length;
  const completionPercent = Math.round(
    (completedFieldCount / totalFieldCount) * 100,
  );

  return {
    completedFieldCount,
    totalFieldCount,
    completionPercent,
    profileComplete: completedFieldCount === totalFieldCount,
  };
}

export async function getCurrentUserInvestmentProfileData(): Promise<CurrentUserInvestmentProfileData> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const investorProfile = await prisma.investorProfile.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      phoneNumber: true,
      dateOfBirth: true,
      country: true,
      state: true,
      city: true,
      addressLine1: true,
      addressLine2: true,
      kycStatus: true,
    },
  });

  const phoneParts = splitE164PhoneNumber(
    investorProfile?.phoneNumber,
    investorProfile?.country,
  );

  const details = {
    fullName: user.name?.trim() || "",
    email: user.email?.trim() || "",
    phoneNumber: investorProfile?.phoneNumber?.trim() || "",
    dateOfBirth: formatDisplayDate(investorProfile?.dateOfBirth),
    country: investorProfile?.country?.trim() || "",
    state: investorProfile?.state?.trim() || "",
    city: investorProfile?.city?.trim() || "",
    addressLine1: investorProfile?.addressLine1?.trim() || "",
    addressLine2: investorProfile?.addressLine2?.trim() || "",
  };

  const completionSnapshot = getCompletionSnapshot(details);

  return {
    userName: details.fullName || "Havenstone User",
    email: details.email || "No email address",
    profileStatusLabel: completionSnapshot.profileComplete
      ? "Profile complete"
      : "Profile incomplete",
    kycStatusLabel: formatKycStatus(investorProfile?.kycStatus),
    profileComplete: completionSnapshot.profileComplete,
    completionPercent: completionSnapshot.completionPercent,
    completedFieldCount: completionSnapshot.completedFieldCount,
    totalFieldCount: completionSnapshot.totalFieldCount,
    details,
    editDefaults: {
      countryCallingCode: phoneParts.countryCallingCode,
      phoneNumber: phoneParts.nationalNumber,
      dateOfBirth: toIsoDate(investorProfile?.dateOfBirth),
      confirmAdultAge: Boolean(investorProfile?.dateOfBirth),
      country: details.country || "United States",
      state: details.state,
      city: details.city,
      addressLine1: details.addressLine1,
      addressLine2: details.addressLine2,
    },
  };
}
