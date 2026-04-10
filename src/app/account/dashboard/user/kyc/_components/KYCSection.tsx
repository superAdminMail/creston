"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type KycStatus = "NOT_STARTED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";

export default function KYCSection({
  initialStatus,
  userId,
}: {
  initialStatus: KycStatus;
  userId: string;
}) {
  const [status, setStatus] = useState<KycStatus>(initialStatus);
  const [loading, setLoading] = useState(false);

  const startKYC = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/kyc/start", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!data?.url) {
        throw new Error("Failed to start verification");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      toast.error("Failed to start verification. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 NOT STARTED
  if (status === "NOT_STARTED") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Verify your identity
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Complete verification to unlock deposits, withdrawals, and full
            account access.
          </p>
        </div>

        <button
          onClick={startKYC}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Starting..." : "Verify Identity"}
        </button>
      </div>
    );
  }

  // 🟡 PENDING
  if (status === "PENDING_REVIEW") {
    return (
      <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/5 backdrop-blur-xl p-6 space-y-3">
        <p className="text-yellow-400 font-medium text-sm">
          ⏳ Verification in progress
        </p>
        <p className="text-sm text-slate-400">
          This usually takes a few seconds. You can refresh this page.
        </p>
      </div>
    );
  }

  // 🟢 VERIFIED
  if (status === "VERIFIED") {
    return (
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 backdrop-blur-xl p-6 space-y-3">
        <p className="text-emerald-400 font-semibold text-sm">
          ✅ Identity Verified
        </p>
        <p className="text-sm text-slate-400">
          Your account is fully verified and unrestricted.
        </p>
      </div>
    );
  }

  // 🔴 REJECTED
  if (status === "REJECTED") {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-500/5 backdrop-blur-xl p-6 space-y-4">
        <div>
          <p className="text-red-400 font-medium text-sm">
            ❌ Verification failed
          </p>
          <p className="text-sm text-slate-400">
            Your facial verification did not match your document.
          </p>
        </div>

        <button
          onClick={startKYC}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Retrying..." : "Try Again"}
        </button>
      </div>
    );
  }

  return null;
}
