"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";

import { resetPasswordAction } from "@/actions/auth/reset-password";
import { AuthShell } from "@/app/auth/_components/AuthShell";
import { Alert, AlertTitle } from "@/components/ui/alert";
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

type ResetPasswordFormProps = {
  token: string;
  siteName: string;
  siteLogoUrl?: string | null;
};

export default function ResetPasswordForm({
  token,
  siteName,
  siteLogoUrl,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const passwordChecks = useMemo(
    () => ({
      minLength: password.length >= 8,
      hasLetter: /[A-Za-z]/.test(password),
      hasNumber: /\d/.test(password),
    }),
    [password],
  );

  const isPasswordStrong =
    passwordChecks.minLength &&
    passwordChecks.hasLetter &&
    passwordChecks.hasNumber;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setSuccess(undefined);

    const trimmedToken = token.trim();

    if (!trimmedToken) {
      setError("Invalid or expired reset link.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isPasswordStrong) {
      setError(
        "Password must be at least 8 characters and include letters and numbers.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await resetPasswordAction(trimmedToken, password);

        if (result?.error) {
          setError(result.error);
          return;
        }

        setSuccess(result?.message ?? "Password updated successfully. Redirecting...");
        setPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          router.push("/auth/sign-in");
        }, 1500);
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <AuthShell
      eyebrow="Secure Access"
      title="Reset your password"
      description={`Choose a new password for your ${siteName} account.`}
      siteName={siteName}
      siteLogoUrl={siteLogoUrl}
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-400">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Update password</p>
              <p className="text-xs text-slate-400">
                Enter and confirm your new secure password.
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <Alert className="rounded-2xl border border-red-400/20 bg-red-400/10 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          onChange={() => {
            if (error) setError(undefined);
          }}
          noValidate
          className="space-y-6"
        >
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel className="text-sm font-medium text-slate-200">
                New password
              </FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                    placeholder="Enter new password"
                    className="input-premium h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 pr-12 text-white placeholder:text-slate-500 focus-visible:ring-[var(--ring)]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isPending}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:text-blue-200 disabled:pointer-events-none disabled:opacity-60"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="mt-2 space-y-1 text-xs">
                  <p
                    className={
                      passwordChecks.minLength ? "text-emerald-400" : "text-white/40"
                    }
                  >
                    At least 8 characters
                  </p>
                  <p
                    className={
                      passwordChecks.hasLetter ? "text-emerald-400" : "text-white/40"
                    }
                  >
                    Contains a letter
                  </p>
                  <p
                    className={
                      passwordChecks.hasNumber ? "text-emerald-400" : "text-white/40"
                    }
                  >
                    Contains a number
                  </p>
                </div>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-sm font-medium text-slate-200">
                Confirm password
              </FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isPending}
                    placeholder="Re-enter new password"
                    className="input-premium h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 pr-12 text-white placeholder:text-slate-500 focus-visible:ring-[var(--ring)]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={isPending}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:text-blue-200 disabled:pointer-events-none disabled:opacity-60"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </FieldContent>
            </Field>
          </FieldGroup>

          <Button
            disabled={isPending}
            type="submit"
            className="btn-primary h-12 w-full rounded-2xl text-sm font-semibold text-white disabled:opacity-70"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Updating password...
              </span>
            ) : (
              "Update password"
            )}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
