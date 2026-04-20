"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  upsertCurrentUserInvestorProfile,
  type UpsertCurrentUserInvestorProfileResult,
} from "@/actions/profile/upsert-current-user-investor-profile";

export async function createInvestorProfileAction(
  input: unknown,
): Promise<UpsertCurrentUserInvestorProfileResult> {
  const result = await upsertCurrentUserInvestorProfile(input, {
    markOnboardingComplete: true,
  });

  if (result.success) {
    revalidatePath("/account");
    redirect("/account");
  }

  return result;
}
