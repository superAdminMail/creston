"use server";

import { auth } from "@/lib/auth";
import { getAppBaseUrl } from "@/lib/config/appUrl";

export async function sendVerificationEmailAction(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  if (!normalizedEmail) {
    return { error: "Email is required." };
  }

  try {
    await auth.api.sendVerificationEmail({
      body: {
        email: normalizedEmail,
        callbackURL: `${getAppBaseUrl()}/auth/verify-email`,
      },
    });

    return {
      success: true,
      message:
        "If an account exists and still needs verification, a new link has been sent.",
    };
  } catch {
    return {
      error: "Unable to send verification email right now. Please try again.",
    };
  }
}
