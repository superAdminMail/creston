"use client";

import { ShieldCheck, BadgeCheck, Lock, Landmark } from "lucide-react";

export function ComplianceStrip() {
  return (
    <div className="relative border-t border-white/8 bg-[rgba(5,11,31,0.85)]">
      {/* subtle glow line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(96,165,250,0.25),transparent)]" />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          {/* REGISTRATION */}
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-blue-300" />
            <span>Registered in England & Wales</span>
          </div>

          {/* KYC */}
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-blue-300" />
            <span>KYC and AML compliant</span>
          </div>

          {/* SECURITY */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-300" />
              <span>Secure and encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-300" />
              <span className="flex items-center gap-2">Data protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
