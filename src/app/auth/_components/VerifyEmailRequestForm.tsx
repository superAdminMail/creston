"use client";

import { useState, useTransition } from "react";
import { Loader2, Mail } from "lucide-react";

import { sendVerificationEmailAction } from "@/actions/auth/verify-email/request";
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

type VerifyEmailRequestFormProps = {
  siteName: string;
  siteLogoUrl?: string | null;
};

type VerifyEmailRequestInlineFormProps = {
  defaultEmail?: string;
};

type VerifyEmailRequestBodyProps = {
  isPending: boolean;
  error: string | null;
  success: string | null;
  email: string;
  setEmail: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  compact?: boolean;
};

export function VerifyEmailRequestBody({
  isPending,
  error,
  success,
  email,
  setEmail,
  onSubmit,
  compact = false,
}: VerifyEmailRequestBodyProps) {
  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-400">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Verify your email</p>
            <p className="text-xs text-slate-400">
              Request a new confirmation link to activate your account.
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

      <form onSubmit={onSubmit} className={compact ? "space-y-4" : "space-y-6"} noValidate>
        <FieldGroup className="gap-5">
          <Field>
            <FieldLabel className="text-sm font-medium text-slate-200">
              Email address
            </FieldLabel>
            <FieldContent>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                placeholder="Enter your email address"
                className="input-premium h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-white placeholder:text-slate-500 focus-visible:ring-[var(--ring)]"
              />
              {!error ? (
                <FieldDescription className="text-xs text-slate-500">
                  We&apos;ll only send a link if your account still needs verification.
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
              Sending link...
            </span>
          ) : (
            "Send verification link"
          )}
        </Button>
      </form>
    </div>
  );
}

function useVerifyEmailRequestForm(defaultEmail = "") {
  const [email, setEmail] = useState(defaultEmail);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await sendVerificationEmailAction(email);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setSuccess(
        result?.message ??
          "If an account exists and still needs verification, a new link has been sent.",
      );
    });
  }

  return {
    email,
    setEmail,
    isPending,
    error,
    success,
    handleSubmit,
  };
}

export function VerifyEmailRequestInlineForm({
  defaultEmail,
}: VerifyEmailRequestInlineFormProps) {
  const { email, setEmail, isPending, error, success, handleSubmit } =
    useVerifyEmailRequestForm(defaultEmail);

  return (
    <VerifyEmailRequestBody
      isPending={isPending}
      error={error}
      success={success}
      email={email}
      setEmail={setEmail}
      onSubmit={handleSubmit}
    />
  );
}

export default function VerifyEmailRequestForm({
  siteName,
  siteLogoUrl,
}: VerifyEmailRequestFormProps) {
  const { email, setEmail, isPending, error, success, handleSubmit } =
    useVerifyEmailRequestForm();

  return (
    <AuthShell
      eyebrow="Account Security"
      title="Verify your email"
      description={`Request a fresh verification link for your ${siteName} account.`}
      siteName={siteName}
      siteLogoUrl={siteLogoUrl}
    >
      <VerifyEmailRequestBody
        isPending={isPending}
        error={error}
        success={success}
        email={email}
        setEmail={setEmail}
        onSubmit={handleSubmit}
      />
    </AuthShell>
  );
}
