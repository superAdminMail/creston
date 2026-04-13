"use client";

import { useState, useTransition } from "react";
import { Loader2, Mail } from "lucide-react";
import { sendVerificationEmailAction } from "@/actions/auth/verify-email/request";

export default function VerifyEmailRequestForm() {
  const [email, setEmail] = useState("");
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

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(8,17,37,0.96),rgba(5,11,31,0.985))] shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <div className="border-b border-white/10 px-6 py-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-400">
              <Mail className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-lg font-semibold text-white">
                Verify your email
              </h1>
              <p className="text-sm text-white/60">
                Request a fresh verification link.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 sm:px-8">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-white/85"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              placeholder="Enter your email address"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 transition focus:border-blue-500/50 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
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

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-medium text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              "Send verification link"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
