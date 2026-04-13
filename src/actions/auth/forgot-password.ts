"use server";

import { auth } from "@/lib/auth";
import { getAppBaseUrl } from "@/lib/config/appUrl";
import { prisma } from "@/lib/prisma";

async function checkRateLimit(email: string, ip?: string | null) {
  const normalizedEmail = email.toLowerCase().trim();
  const fifteenMinutesAgo = new Date(Date.now() - 1000 * 60 * 15);

  const count = await prisma.passwordResetAttempt.count({
    where: {
      email: normalizedEmail,
      ip: ip ?? null,
      createdAt: { gte: fifteenMinutesAgo },
    },
  });

  if (count >= 5) {
    throw new Error("Too many reset attempts. Try again later.");
  }

  await prisma.passwordResetAttempt.create({
    data: {
      email: normalizedEmail,
      ip: ip ?? null,
    },
  });
}

export async function forgotPassword(email: string, ip?: string | null) {
  const normalizedEmail = email.toLowerCase().trim();

  await checkRateLimit(normalizedEmail, ip);

  await auth.api.requestPasswordReset({
    body: {
      email: normalizedEmail,
      redirectTo: `${getAppBaseUrl()}/auth/reset-password`,
    },
  });

  return {
    success: true,
    message:
      "If an account exists for that email, a password reset link has been sent.",
  };
}

export async function resetPassword(token: string, newPassword: string) {
  await auth.api.resetPassword({
    body: {
      token: token.trim(),
      newPassword,
    },
  });

  return {
    success: true,
    message: "Your password was changed. If this wasn't you, contact support.",
  };
}
