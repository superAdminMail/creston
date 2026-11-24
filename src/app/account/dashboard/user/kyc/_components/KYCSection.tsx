"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Fingerprint,
  Loader2,
  LockKeyhole,
  ScanFace,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { createPusherClient } from "@/lib/pusher-client";
import {
  isDiditRetryableStatus,
  isDiditResumableStatus,
  isDiditSessionStale,
} from "@/lib/kyc/didit";

type KycStatus = "NOT_STARTED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";

type LatestSession = {
  status: string;
  sessionUrl: string | null;
  lastSyncedAt: string | Date | null;
  updatedAt: string | Date;
} | null;

type KycStatusPayload = {
  status?: KycStatus;
  providerStatus?: string;
};

function isKycStatusPayload(payload: unknown): payload is KycStatusPayload {
  if (!payload || typeof payload !== "object") return false;

  const candidate = payload as KycStatusPayload;

  return (
    typeof candidate.status === "undefined" ||
    candidate.status === "NOT_STARTED" ||
    candidate.status === "PENDING_REVIEW" ||
    candidate.status === "VERIFIED" ||
    candidate.status === "REJECTED"
  );
}

function getProviderKycStatus(providerStatus: string | null): KycStatus | null {
  switch (providerStatus) {
    case "Approved":
      return "VERIFIED";
    case "Declined":
      return "REJECTED";
    case "In Review":
      return "PENDING_REVIEW";
    default:
      return null;
  }
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
    setStatus(initialStatus);

    if (initialStatus === "VERIFIED") {
      setProviderStatus("Approved");
      setSessionUrl(null);
    }
  }, [initialStatus]);

  useEffect(() => {
    const nextProviderStatus = latestSession?.status ?? null;

    setProviderStatus(nextProviderStatus);

    const nextStatus = getProviderKycStatus(nextProviderStatus);

    if (nextStatus) {
      setStatus(nextStatus);
      setSessionUrl(null);
      return;
    }

    setSessionUrl(latestSession?.sessionUrl ?? null);
  }, [
    latestSession?.sessionUrl,
    latestSession?.status,
    latestSession?.updatedAt,
  ]);

  useEffect(() => {
    if (!userId) return;

    const pusher = createPusherClient();
    const channel = pusher.subscribe(`private-kyc-${userId}`);

    const handleStatusUpdated = (payload: unknown) => {
      if (!isKycStatusPayload(payload)) return;

      if (payload.status) {
        setStatus(payload.status);

        if (payload.status === "VERIFIED" || payload.status === "REJECTED") {
          setSessionUrl(null);
        }
      }

      if (payload.providerStatus) {
        setProviderStatus(payload.providerStatus);

        const nextStatus = getProviderKycStatus(payload.providerStatus);

        if (nextStatus) {
          setStatus(nextStatus);
          setSessionUrl(null);
        }
      }
    };

    channel.bind("kyc-status-updated", handleStatusUpdated);

    return () => {
      channel.unbind("kyc-status-updated", handleStatusUpdated);
      pusher.unsubscribe(`private-kyc-${userId}`);
    };
  }, [userId]);

  const canRetry = useMemo(() => {
    if (!latestSession) return true;

    const sessionAgeAnchor =
      latestSession.lastSyncedAt ?? latestSession.updatedAt;

    return (
      isDiditRetryableStatus(providerStatus) ||
      (isDiditResumableStatus(providerStatus) &&
        isDiditSessionStale(sessionAgeAnchor))
    );
  }, [latestSession, providerStatus]);

  const canContinue = useMemo(() => {
    if (
      !sessionUrl ||
      !providerStatus ||
      !latestSession ||
      status === "VERIFIED" ||
      providerStatus === "Approved"
    ) {
      return false;
    }

    const sessionAgeAnchor =
      latestSession.lastSyncedAt ?? latestSession.updatedAt;

    return (
      isDiditResumableStatus(providerStatus) &&
      !isDiditSessionStale(sessionAgeAnchor)
    );
  }, [latestSession, providerStatus, sessionUrl, status]);

  const startKYC = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/kyc/start", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Failed to start verification");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to start verification. Try again.",
      );

      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (sessionUrl) {
      window.location.href = sessionUrl;
    }
  };

  const isPendingReview = status === "PENDING_REVIEW";
  const isRejected = status === "REJECTED";
  const isVerified = status === "VERIFIED";

  const showRetry = isRejected || canRetry || status === "NOT_STARTED";

  const progressComplete = isVerified || isPendingReview;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/[0.08] blur-3xl" />

        <div className="relative space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-slate-300">
                Identity verification
              </span>
            </div>

            {isVerified ? (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                Verified
              </span>
            ) : isPendingReview ? (
              <span className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                Under review
              </span>
            ) : isRejected ? (
              <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                Action required
              </span>
            ) : canContinue ? (
              <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                In progress
              </span>
            ) : (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
                Not verified
              </span>
            )}
          </div>

          <div className="max-w-xl space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {isVerified
                ? "Your identity is verified"
                : isPendingReview
                  ? "Verification submitted"
                  : isRejected
                    ? "Verification needs attention"
                    : canContinue
                      ? "Continue your verification"
                      : "Verify your identity"}
            </h2>

            <p className="text-sm leading-6 text-slate-400">
              {isVerified
                ? "Your identity verification is complete. You can now access the full range of Havenstone services."
                : isPendingReview
                  ? "Your verification has been successfully submitted. We are waiting for the final review."
                  : isRejected
                    ? "Your previous verification was unsuccessful. You can start a new verification session to try again."
                    : canContinue
                      ? "You already have an active verification session. Continue where you left off."
                      : "Complete a secure identity verification to unlock deposits, withdrawals and your full investment and savings access."}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-300">
                Verification progress
              </span>
              <span className="text-xs text-slate-500">
                {isVerified
                  ? "Completed"
                  : isPendingReview
                    ? "Submitted"
                    : "Identity check"}
              </span>
            </div>

            <div className="flex gap-2">
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  progressComplete ? "bg-emerald-500" : "bg-blue-500"
                }`}
              />
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  isVerified ? "bg-emerald-500" : "bg-white/10"
                }`}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Identity check</span>
              <span>
                {isVerified
                  ? "Complete"
                  : isPendingReview
                    ? "Awaiting decision"
                    : isRejected
                      ? "Requires retry"
                      : "Required"}
              </span>
            </div>
          </div>

          {isPendingReview ? (
            <div className="flex items-start gap-3 rounded-xl border border-yellow-400/20 bg-yellow-500/[0.06] p-4">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-300">
                  Verification under review
                </p>
                <p className="text-sm leading-5 text-slate-400">
                  Your submission is being reviewed. You will be able to access
                  the applicable account features once a final decision is made.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {isRejected && (
                <div className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-500/[0.06] p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-300">
                      A new verification is required
                    </p>
                    <p className="text-sm leading-5 text-slate-400">
                      Start another verification session to complete your
                      identity check.
                    </p>
                  </div>
                </div>
              )}

              {canContinue ? (
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Continue verification
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : showRetry ? (
                <button
                  type="button"
                  onClick={startKYC}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starting verification...
                    </>
                  ) : (
                    <>
                      {isRejected ? "Try again" : "Verify identity"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <ScanFace className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            Biometric verification
          </h3>
          <p className="mt-1 text-sm leading-5 text-slate-400">
            Complete your identity checks using a secure document and facial
            verification process.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <LockKeyhole className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            Secure verification
          </h3>
          <p className="mt-1 text-sm leading-5 text-slate-400">
            Your identity verification is handled through our verification
            provider.
          </p>
        </div>
      </section>

      <div className="flex items-center gap-2 px-1 text-xs text-slate-500">
        <Fingerprint className="h-4 w-4 shrink-0" />
        <span>
          Identity verification helps protect your account and financial
          activities.
        </span>
      </div>
    </div>
  );
}
