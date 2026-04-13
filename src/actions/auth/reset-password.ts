"use server";

import { auth } from "@/lib/auth";

export async function resetPasswordAction(token: string, newPassword: string) {
  try {
    await auth.api.resetPassword({
      body: {
        token: token.trim(),
        newPassword,
      },
    });

    return {
      success: true,
      message: "Password updated successfully.",
    };
  } catch {
    return {
      error: "Invalid or expired reset link. Please request a new one.",
    };
  }
}
