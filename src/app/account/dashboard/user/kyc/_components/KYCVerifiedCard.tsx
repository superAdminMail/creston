"use client";

import { CheckCircle2 } from "lucide-react";

export default function KYCVerifiedCard({ name }: { name?: string | null }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-6 shadow-sm">
      {/* Glow accent */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
            Verification Status
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            Identity Verified
          </h2>

          <p className="text-sm text-gray-600 max-w-sm">
            Your identity has been successfully verified. You now have full
            access to all Havenstone features.
          </p>

          {name && (
            <p className="text-sm text-gray-500">
              Verified as{" "}
              <span className="font-medium text-gray-800">{name}</span>
            </p>
          )}
        </div>

        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
      </div>

      {/* Bottom badge */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          Secured by biometric verification
        </div>

        <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
          VERIFIED
        </span>
      </div>
    </div>
  );
}
