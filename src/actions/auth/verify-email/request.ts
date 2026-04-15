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
        "If your account exists and still requires verification, we’ve sent a fresh confirmation link to your inbox.",
    };
  } catch {
    return {
      error:
        "We couldn’t send a new verification email right now. Please try again in a moment.",
    };
  }
}
