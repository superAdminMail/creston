"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RegisterUserInput = {
  email: string;
  password: string;
};

type RegisterUserResult = { ok: true } | { ok: false; message: string };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function buildDisplayNameFromEmail(email: string) {
  return email.split("@")[0].slice(0, 50);
}

type DisposableEmailCheckResult =
  | {
      ok: true;
      isDisposable: boolean;
      provider: string | null;
      domain: string | null;
    }
  | {
      ok: false;
      provider: string | null;
      domain: string | null;
    };

async function checkDisposableEmail(
  email: string,
): Promise<DisposableEmailCheckResult> {
  const apiKey = process.env.DISPOSABLE_EMAIL_API_KEY;
  const endpoint = process.env.DISPOSABLE_EMAIL_API_URL;

  const domain = email.split("@")[1] ?? null;

  if (!apiKey || !endpoint) {
    return {
      ok: false,
      provider: endpoint ?? null,
      domain,
    };
  }

  try {
    const response = await fetch(
      `${endpoint}?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        ok: false,
        provider: endpoint,
        domain,
      };
    }

    const data = (await response.json()) as {
      disposable?: boolean;
      is_disposable?: boolean;
      isDisposable?: boolean;
    };

    const isDisposable = Boolean(
      data.disposable ?? data.is_disposable ?? data.isDisposable,
    );

    return {
      ok: true,
      isDisposable,
      provider: endpoint,
      domain,
    };
  } catch {
    return {
      ok: false,
      provider: endpoint,
      domain,
    };
  }
}

export async function registerUserAction(
  input: RegisterUserInput,
): Promise<RegisterUserResult> {
  const email = normalizeEmail(input.email);
  const password = input.password;

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

  const disposableCheck = await checkDisposableEmail(email);

  if (!disposableCheck.ok) {
    return {
      ok: false,
      message:
        "We could not verify your email address right now. Please try again shortly.",
    };
  }

  if (disposableCheck.isDisposable) {
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

    await prisma.user.update({
      where: { email },
      data: {
        accountStatus: "PENDING_VERIFICATION",
        emailVerificationRequired: true,
        emailVerified: false,
        emailVerifiedAt: null,
        isDisposableEmail: false,
        disposableEmailChecked: true,
        disposableEmailDomain: disposableCheck.domain,
        disposableCheckProvider: disposableCheck.provider,
        disposableCheckedAt: new Date(),
      },
    });

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
