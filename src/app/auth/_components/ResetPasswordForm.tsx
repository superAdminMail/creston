"use client";

import { useMemo, useState, useTransition } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { resetPasswordAction } from "@/actions/auth/reset-password";

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

    setError(null);
    setSuccess(null);

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

        setSuccess(
          result?.message ?? "Password updated successfully. Redirecting...",
        );
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
    <div className="mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(8,17,37,0.96),rgba(5,11,31,0.985))] shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <div className="border-b border-white/10 px-6 py-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-400">
              <LockKeyhole className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-lg font-semibold text-white">
                Reset password
              </h1>
              <p className="text-sm text-white/60">
                Enter your new password below.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 sm:px-8">
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-white/85"
            >
              New password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                placeholder="Enter new password"
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 pr-12 text-sm text-white outline-none placeholder:text-white/35 transition focus:border-blue-500/50 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/45 transition hover:text-white/80"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="space-y-1 pt-1 text-xs">
              <p
                className={
                  passwordChecks.minLength
                    ? "text-emerald-400"
                    : "text-white/40"
                }
              >
                At least 8 characters
              </p>
              <p
                className={
                  passwordChecks.hasLetter
                    ? "text-emerald-400"
                    : "text-white/40"
                }
              >
                Contains a letter
              </p>
              <p
                className={
                  passwordChecks.hasNumber
                    ? "text-emerald-400"
                    : "text-white/40"
                }
              >
                Contains a number
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-white/85"
            >
              Confirm new password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isPending}
                placeholder="Re-enter new password"
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 pr-12 text-sm text-white outline-none placeholder:text-white/35 transition focus:border-blue-500/50 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/45 transition hover:text-white/80"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-medium text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating password...
              </>
            ) : (
              "Update password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
