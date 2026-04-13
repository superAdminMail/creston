"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { forgotPassword } from "@/actions/auth/forgot-password";

export default function ForgotPasswordPage() {
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
    <div className="relative w-full max-w-md">
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,17,37,0.96),rgba(5,11,31,0.985))] shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <div className="border-b border-white/10 px-6 py-6 sm:px-8">
          <Link
            href="/auth/login"
            className="mb-5 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-400 shadow-inner shadow-white/5">
              <Mail className="h-5 w-5" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Forgot your password?
              </h1>
              <p className="text-sm leading-6 text-white/60">
                Enter your email address and we’ll send you a secure reset link
                to regain access to your account.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-6 sm:px-8">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-white/85"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-blue-500/50 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
            />
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

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 w-full rounded-2xl border-0 bg-blue-600 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition hover:bg-blue-500 disabled:opacity-70"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending reset link...
              </span>
            ) : (
              "Send reset link"
            )}
          </Button>

          <p className="text-center text-xs leading-5 text-white/45">
            For your security, we’ll only send a reset link if an account exists
            for this email address.
          </p>
        </form>
      </div>
    </div>
  );
}
