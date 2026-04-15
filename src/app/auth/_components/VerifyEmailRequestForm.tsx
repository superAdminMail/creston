"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

import { sendVerificationEmailAction } from "@/actions/auth/verify-email/request";
import { AuthShell } from "@/app/auth/_components/AuthShell";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type VerifyEmailRequestFormProps = {
  siteName: string;
  siteLogoUrl?: string | null;
  defaultEmail?: string;
};

type VerifyEmailRequestInlineFormProps = {
  defaultEmail?: string;
  mode?: "default" | "expired" | "invalid";
};

type VerifyEmailRequestBodyProps = {
  isPending: boolean;
  error: string | null;
  success: string | null;
  email: string;
  setEmail: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  compact?: boolean;
  mode?: "default" | "expired" | "invalid";
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function FeedbackCard({
  type,
  title,
  description,
}: {
  type: "success" | "error" | "info";
  title: string;
  description: string;
}) {
  const styles = {
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-100",
    error: "border-red-400/20 bg-red-500/10 text-red-100",
    info: "border-blue-500/20 bg-blue-500/10 text-blue-100",
  };

  const icon =
    type === "success" ? (
      <CheckCircle2 className="h-5 w-5" />
    ) : type === "error" ? (
      <AlertCircle className="h-5 w-5" />
    ) : (
      <RefreshCcw className="h-5 w-5" />
    );

  return (
    <div
      className={`rounded-3xl border px-4 py-4 backdrop-blur-sm ${styles[type]}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          {icon}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm leading-6 text-current/80">{description}</p>
        </div>
      </div>
    </div>
  );
}

function StatusIntro({
  mode = "default",
}: {
  mode?: "default" | "expired" | "invalid";
}) {
  if (mode === "expired") {
    return (
      <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-amber-300">
            <RefreshCcw className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
              This verification link has expired
            </p>
            <p className="text-sm leading-6 text-slate-300">
              Request a fresh email below to continue securing and activating
              your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "invalid") {
    return (
      <div className="rounded-3xl border border-red-400/20 bg-red-500/10 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-red-300">
            <AlertCircle className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
              This verification link is invalid
            </p>
            <p className="text-sm leading-6 text-slate-300">
              The link may be incomplete, already used, or no longer valid.
              Request a new one below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-4 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-400">
          <Mail className="h-5 w-5" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">Verify your email</p>
          <p className="text-sm leading-6 text-slate-400">
            Request a new confirmation link to activate and protect your
            account.
          </p>
        </div>
      </div>
    </div>
  );
}

export function VerifyEmailRequestBody({
  isPending,
  error,
  success,
  email,
  setEmail,
  onSubmit,
  compact = false,
  mode = "default",
}: VerifyEmailRequestBodyProps) {
  const emailError = useMemo(() => {
    if (!email.trim()) return null;
    if (!isValidEmail(email)) return "Enter a valid email address.";
    return null;
  }, [email]);

  const isSubmitDisabled = isPending || !email.trim() || Boolean(emailError);

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <StatusIntro mode={mode} />

      {error ? (
        <FeedbackCard
          type="error"
          title="We could not send the verification link"
          description={error}
        />
      ) : null}

      {success ? (
        <FeedbackCard
          type="success"
          title="Verification email sent"
          description={success}
        />
      ) : null}

      <form
        onSubmit={onSubmit}
        className={compact ? "space-y-4" : "space-y-6"}
        noValidate
      >
        <FieldGroup className="gap-5">
          <Field data-invalid={emailError ? true : undefined}>
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
                placeholder="name@company.com"
                aria-invalid={Boolean(emailError)}
                className="input-premium h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-white placeholder:text-slate-500 focus-visible:ring-[var(--ring)]"
              />

              {!emailError ? (
                <FieldDescription className="text-xs text-slate-500">
                  We&apos;ll only send a new link if your account exists and
                  still needs verification.
                </FieldDescription>
              ) : (
                <FieldError
                  errors={[
                    {
                      message: emailError,
                      type: "validate",
                    } as never,
                  ]}
                />
              )}
            </FieldContent>
          </Field>
        </FieldGroup>

        <Button
          type="submit"
          disabled={isSubmitDisabled}
          className="btn-primary h-12 w-full rounded-2xl text-sm font-semibold text-white disabled:opacity-70"
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Sending link...
            </span>
          ) : mode === "expired" || mode === "invalid" ? (
            "Send a new verification link"
          ) : (
            "Send verification link"
          )}
        </Button>

        <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">
                Account protection
              </p>
              <p className="text-xs leading-6 text-slate-400">
                You must verify your email before accessing sensitive account
                features.
              </p>
            </div>
          </div>
        </div>
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

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    startTransition(async () => {
      const result = await sendVerificationEmailAction(normalizedEmail);

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
  mode = "default",
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
      mode={mode}
    />
  );
}

export default function VerifyEmailRequestForm({
  siteName,
  siteLogoUrl,
  defaultEmail,
}: VerifyEmailRequestFormProps) {
  const { email, setEmail, isPending, error, success, handleSubmit } =
    useVerifyEmailRequestForm(defaultEmail ?? "");

  return (
    <AuthShell
      eyebrow="Account Security"
      title="Request email verification link"
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
