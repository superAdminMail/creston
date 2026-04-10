"use client";

import { CheckCircle2 } from "lucide-react";

export default function KYCVerifiedCard({ name }: { name?: string | null }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
      {/* Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/10" />
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative z-10 flex items-start justify-between">
        {/* Left */}
        <div className="space-y-4">
          <p className="text-[11px] font-medium text-blue-400 uppercase tracking-wider">
            Verification Status
          </p>

          <h2 className="text-xl font-semibold text-white">
            Identity Verified
          </h2>

          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            Your identity has been successfully verified. You now have full
            access to all Havenstone investment and savings features.
          </p>

          {name && (
            <p className="text-sm text-slate-400">
              Verified as <span className="text-white font-medium">{name}</span>
            </p>
          )}
        </div>

        {/* Icon */}
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Secured by biometric verification
        </p>

        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 px-3 py-1 rounded-full">
          VERIFIED
        </span>
      </div>
    </div>
  );
}
