"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

import { getEmailVerificationStatusAction } from "@/actions/auth/verify-email/check";

type EmailVerificationWatcherProps = {
  redirectTo?: string;
  intervalMs?: number;
};

export default function EmailVerificationWatcher({
  redirectTo = "/account",
  intervalMs = 4000,
}: EmailVerificationWatcherProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    const runCheck = () => {
      startTransition(async () => {
        const result = await getEmailVerificationStatusAction();

        if (cancelled) return;

        if (
          result.authenticated &&
          result.emailVerified &&
          result.accountStatus === "ACTIVE"
        ) {
          router.replace(redirectTo);
          router.refresh();
        }
      });
    };

    runCheck();

    const interval = setInterval(runCheck, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [router, redirectTo, intervalMs]);

  return null;
}
