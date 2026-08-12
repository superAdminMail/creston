"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Clock3, Loader2, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrowserLocalTimestamp } from "@/components/time/BrowserLocalTimestamp";
import { cancelSupportVerificationAction } from "@/actions/support/cancelSupportVerificationAction";
import { confirmSupportVerificationAction } from "@/actions/support/confirmSupportVerificationAction";
import { useRouter } from "next/navigation";

type SupportVerificationNoticeProps = {
  verification: {
    id: string;
    representativeName: string;
    department: string;
    reason: string;
    requestedAt: Date;
    expiresAt: Date | null;
  };
};

export default function SupportVerificationNotice({
  verification,
}: SupportVerificationNoticeProps) {
  const router = useRouter();

  const [isCancelPending, startCancelTransition] = useTransition();
  const [isConfirmPending, startConfirmTransition] = useTransition();

  const [isVisible, setIsVisible] = useState(true);

  const [isExpired, setIsExpired] = useState(() => {
    return (
      verification.expiresAt !== null &&
      new Date(verification.expiresAt).getTime() <= Date.now()
    );
  });

  useEffect(() => {
    if (!verification.expiresAt) {
      return;
    }

    const expiresAt = new Date(verification.expiresAt).getTime();

    const checkExpiry = () => {
      if (Date.now() >= expiresAt) {
        setIsExpired(true);
      }
    };

    checkExpiry();

    const interval = window.setInterval(checkExpiry, 1000);

    return () => window.clearInterval(interval);
  }, [verification.expiresAt]);

  const handleCancel = () => {
    startCancelTransition(async () => {
      const response = await cancelSupportVerificationAction(verification.id);

      if (!response.success) {
        toast.error(
          response.error ?? "Unable to dismiss support verification.",
        );
        return;
      }

      setIsVisible(false);

      toast.success(response.message ?? "Support verification dismissed.");
    });
  };
  const handleConfirm = () => {
    startConfirmTransition(async () => {
      const response = await confirmSupportVerificationAction(verification.id);

      if (!response.success) {
        toast.error(response.error ?? "Unable to confirm support session.");
        return;
      }

      setIsVisible(false);

      toast.success(response.message ?? "Support session confirmed.");

      router.refresh();
    });
  };
  if (!isVisible) {
    return null;
  }

  return (
    <Card className="overflow-hidden rounded-[1.5rem] border border-sky-200/70 bg-white text-slate-950 shadow-sm dark:border-sky-400/20 dark:bg-slate-900 dark:text-white">
      <CardContent className="p-0">
        <div className="border-b border-sky-100 bg-sky-50/70 px-5 py-4 dark:border-white/10 dark:bg-sky-400/10 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-white text-sky-700 dark:border-sky-400/20 dark:bg-slate-900 dark:text-sky-300">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700 dark:text-sky-300">
                  Support verification
                </p>

                <h2 className="mt-1 text-base font-semibold text-slate-950 dark:text-white sm:text-lg">
                  Creston Capital Support Verification
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  A support representative is requesting confirmation before
                  discussing account-related information with you.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isCancelPending || isConfirmPending}
              aria-label="Dismiss support verification"
              className="shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-50 dark:text-slate-500 dark:hover:bg-white/[0.08] dark:hover:text-slate-200"
            >
              {isCancelPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-500">
                Representative
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                {verification.representativeName}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-500">
                Department
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                {verification.department}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-500">
              Reason
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
              {verification.reason}
            </p>
          </div>

          <div className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />

              <span>
                Requested{" "}
                <BrowserLocalTimestamp
                  value={verification.requestedAt}
                  variant="datetime"
                />
              </span>
            </div>

            <div
              className={
                isExpired
                  ? "font-medium text-red-600 dark:text-red-300"
                  : undefined
              }
            >
              {isExpired ? (
                "This verification has expired."
              ) : (
                <>
                  Expires{" "}
                  <BrowserLocalTimestamp
                    value={verification.expiresAt}
                    variant="datetime"
                  />
                </>
              )}
            </div>
          </div>

          <div
            className={
              isExpired
                ? "rounded-2xl border border-red-200/70 bg-red-50/70 p-4 dark:border-red-400/20 dark:bg-red-400/10"
                : "rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-4 dark:border-emerald-400/20 dark:bg-emerald-400/10"
            }
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

              <p className="text-sm leading-6">
                {isExpired
                  ? "This support verification has expired. Please ask the support representative to send a new verification request."
                  : "Only confirm this session if you recognize the representative and are currently speaking with them through an expected Creston Capital support channel."}
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isCancelPending || isConfirmPending || isExpired}
              onClick={handleCancel}
              className="rounded-full border-slate-200 bg-white px-5 text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white"
            >
              {isCancelPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Dismissing...
                </>
              ) : (
                "Dismiss request"
              )}
            </Button>

            <Button
              type="button"
              disabled={isCancelPending || isConfirmPending || isExpired}
              onClick={handleConfirm}
              className="w-full rounded-full bg-[#3c9ee0] px-5 text-white shadow-[0_18px_40px_-22px_rgba(60,158,224,0.9)] hover:bg-[#2f8bd0] sm:w-auto"
            >
              {isExpired ? (
                "Verification expired"
              ) : isConfirmPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Confirm this support session
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
