"use server";

import {
  upsertCurrentUserInvestorProfile,
  type UpsertCurrentUserInvestorProfileResult,
} from "@/actions/profile/upsert-current-user-investor-profile";

export async function createInvestorProfileAction(
  input: unknown,
): Promise<UpsertCurrentUserInvestorProfileResult> {
  return upsertCurrentUserInvestorProfile(input, {
    markOnboardingComplete: true,
  });
}
