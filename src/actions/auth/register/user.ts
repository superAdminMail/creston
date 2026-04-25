"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loadDisposableDomainsLocal } from "@/lib/data/loadDisposableDomainsLocal";
import {
  createPendingPlatformPromoRewardForUser,
  createReferralForNewUser,
} from "@/lib/referrals/referralRewardService";

type RegisterUserInput = {
  email: string;
  password: string;
  referralCode?: string | null;
  promoCode?: string | null;
};

type RegisterUserResult = { ok: true } | { ok: false; message: string };

const SAFE_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
]);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function buildDisplayNameFromEmail(email: string) {
  return email.split("@")[0].slice(0, 50);
}

function getEmailDomain(email: string) {
  return email.trim().toLowerCase().split("@")[1] ?? "";
}

function normalizeInviteCode(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.toUpperCase();
}

export async function registerUserAction(
  input: RegisterUserInput,
): Promise<RegisterUserResult> {
  const email = normalizeEmail(input.email);
  const password = input.password;
  const referralCode = normalizeInviteCode(input.referralCode);
  const promoCode = normalizeInviteCode(input.promoCode);

  if (!email || !password) {
    return {
      ok: false,
      message: "Email and password are required.",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      ok: false,
      message: "An account already exists for this email.",
    };
  }

  const domains = loadDisposableDomainsLocal();
  const domain = getEmailDomain(email);

  if (!SAFE_DOMAINS.has(domain) && domains.has(domain)) {
    return {
      ok: false,
      message: "Please use a valid personal or business email address.",
    };
  }

  try {
    await auth.api.signUpEmail({
      headers: await headers(),
      body: {
        name: buildDisplayNameFromEmail(email),
        email,
        password,
      },
    });

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        accountStatus: "PENDING_VERIFICATION",
        emailVerificationRequired: true,
        emailVerified: false,
        emailVerifiedAt: null,
        isDisposableEmail: false,
        disposableEmailChecked: true,
        disposableEmailDomain: domain,
        disposableCheckProvider: "local_blocklist",
        disposableCheckedAt: new Date(),
      },
      select: {
        id: true,
      },
    });

    if (referralCode) {
      await createReferralForNewUser({
        newUserId: updatedUser.id,
        referralCode,
      });
    } else if (promoCode) {
      await createPendingPlatformPromoRewardForUser({
        userId: updatedUser.id,
        promoCode,
      });
    }

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create account.";

    return {
      ok: false,
      message,
    };
  }
}
