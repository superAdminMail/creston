"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

import { forgotPassword } from "@/actions/auth/forgot-password";
import { AuthShell } from "@/app/auth/_components/AuthShell";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type ForgotPasswordFormProps = {
  siteName: string;
  siteLogoUrl?: string | null;
};

export default function ForgotPasswordForm({
  siteName,
  siteLogoUrl,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSuccess(null);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    startTransition(async () => {
      try {
        await forgotPassword(normalizedEmail);
        setSuccess(
          "If an account exists for this email, a password reset link has been sent.",
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
      }
    });
  };

  return (
    <AuthShell
      eyebrow="Account Recovery"
      title="Forgot your password?"
      description={`Enter your email and we'll send a secure reset link for your ${siteName} account.`}
      siteName={siteName}
      siteLogoUrl={siteLogoUrl}
      footer={
        <p className="text-center text-xs leading-5 text-white/45">
          For your security, we&apos;ll only send a reset link if an account exists
          for this email address.
        </p>
      }
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Reset link</p>
              <p className="text-xs text-slate-400">
                We&apos;ll email you a secure link to get back in.
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <Alert className="rounded-2xl border border-red-400/20 bg-red-400/10 text-red-200">
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-6">
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel className="text-sm font-medium text-slate-200">
                Email address
              </FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  className="input-premium h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-white placeholder:text-slate-500 focus-visible:ring-[var(--ring)]"
                />
                {!error ? (
                  <FieldDescription className="text-xs text-slate-500">
                    We&apos;ll only send a link if your account still needs access
                    recovery.
                  </FieldDescription>
                ) : null}
              </FieldContent>
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            disabled={isPending}
            className="btn-primary h-12 w-full rounded-2xl text-sm font-semibold text-white disabled:opacity-70"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending reset link...
              </span>
            ) : (
              "Send reset link"
            )}
          </Button>

          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </form>
      </div>
    </AuthShell>
  );
}
