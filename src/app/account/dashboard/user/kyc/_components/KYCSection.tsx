"use client";

import { useEffect, useMemo, useState } from "react";
import Pusher from "pusher-js";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type KycStatus = "NOT_STARTED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";

type LatestSession = {
  status: string;
  sessionUrl: string | null;
  updatedAt: string | Date;
} | null;

function isSessionStale(updatedAt: string | Date) {
  const date = new Date(updatedAt);
  return Date.now() - date.getTime() > 30 * 60 * 1000;
}

export default function KYCSection({
  initialStatus,
  userId,
  latestSession,
}: {
  initialStatus: KycStatus;
  userId: string;
  latestSession: LatestSession;
}) {
  const [status, setStatus] = useState<KycStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [providerStatus, setProviderStatus] = useState<string | null>(
    latestSession?.status ?? null,
  );
  const [sessionUrl, setSessionUrl] = useState<string | null>(
    latestSession?.sessionUrl ?? null,
  );

  useEffect(() => {
    if (!userId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`kyc-${userId}`);

    channel.bind(
      "kyc-status-updated",
      (payload: { status?: KycStatus; providerStatus?: string }) => {
        if (payload?.status) {
          setStatus(payload.status);
        }
        if (payload?.providerStatus) {
          setProviderStatus(payload.providerStatus);
        }
      },
    );

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [userId]);

  const canRetry = useMemo(() => {
    if (!latestSession) return true;
    if (!providerStatus) return true;

    const retryableProviderStatuses = [
      "Declined",
      "Expired",
      "Abandoned",
      "Kyc Expired",
    ];

    if (retryableProviderStatuses.includes(providerStatus)) {
      return true;
    }

    if (
      ["Not Started", "In Progress", "Resubmitted"].includes(providerStatus) &&
      latestSession?.updatedAt &&
      isSessionStale(latestSession.updatedAt)
    ) {
      return true;
    }

    return false;
  }, [latestSession, providerStatus]);

  const canContinue = useMemo(() => {
    if (!sessionUrl || !providerStatus || !latestSession?.updatedAt)
      return false;

    return (
      ["Not Started", "In Progress", "Resubmitted"].includes(providerStatus) &&
      !isSessionStale(latestSession.updatedAt)
    );
  }, [latestSession, providerStatus, sessionUrl]);

  const startKYC = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/kyc/start", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Failed to start verification");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      toast.error("Failed to start verification. Try again.");
    } finally {
      setLoading(false);
    }
  };

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

  if (status === "PENDING_REVIEW") {
    return (
      <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/5 backdrop-blur-xl p-6 space-y-3">
        <p className="text-yellow-400 font-medium text-sm">
          ⏳ Verification under review
        </p>
        <p className="text-sm text-slate-400">
          Your verification has been submitted and is awaiting a final decision.
        </p>
      </div>
    );
  }

  if (canContinue) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Continue verification
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            You already have an active verification session. Continue where you
            left off.
          </p>
        </div>

        <button
          onClick={() => {
            if (sessionUrl) window.location.href = sessionUrl;
          }}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Continue Verification
        </button>
      </div>
    );
  }

  if (status === "REJECTED" || canRetry || status === "NOT_STARTED") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {status === "REJECTED"
              ? "Verification required again"
              : "Verify your identity"}
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
          {loading
            ? "Starting..."
            : status === "REJECTED"
              ? "Try Again"
              : "Verify Identity"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/5 backdrop-blur-xl p-6 space-y-3">
      <p className="text-yellow-400 font-medium text-sm">
        ⏳ Verification in progress
      </p>
      <p className="text-sm text-slate-400">
        Your verification has been submitted and is awaiting a final decision.
      </p>
    </div>
  );
}
