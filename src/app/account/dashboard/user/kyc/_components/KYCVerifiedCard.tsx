"use client";

import {
  BadgeCheck,
  Check,
  CheckCircle2,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";

export default function KYCVerifiedCard({
  name,
  siteName,
}: {
  name?: string | null;
  siteName: string;
}) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.10] via-white/[0.035] to-blue-500/[0.08] p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative space-y-7">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-slate-300">
                Identity verification
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified
            </span>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10">
              <BadgeCheck className="h-9 w-9 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Identity verified
              </h2>

              <p className="max-w-xl text-sm leading-6 text-slate-400">
                Your identity has been successfully verified. Your
                {` ${siteName || "Havenstone"}`} account has completed the
                identity verification requirement.
              </p>

              {name && (
                <p className="text-sm text-slate-300">
                  Verified account holder:{" "}
                  <span className="font-semibold text-white">{name}</span>
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-400/10 bg-black/10 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-300">
                Verification progress
              </span>
              <span className="text-xs font-medium text-emerald-400">
                100% complete
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full rounded-full bg-emerald-500" />
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              All verification requirements completed
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            Identity confirmed
          </h3>
          <p className="mt-1 text-sm leading-5 text-slate-400">
            Your identity verification has been successfully completed.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <Fingerprint className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            Account protection
          </h3>
          <p className="mt-1 text-sm leading-5 text-slate-400">
            Your account has completed its identity verification requirement.
          </p>
        </div>
      </section>

      <div className="flex items-center gap-2 px-1 text-xs text-slate-500">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
        <span>
          Your verification status is securely maintained by{" "}
          {siteName || "Havenstone"}.
        </span>
      </div>
    </div>
  );
}
