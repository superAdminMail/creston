"use client";

import { CheckCircle2, Clock3, ShieldCheck, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BrowserLocalTimestamp } from "@/components/time/BrowserLocalTimestamp";
import { SupportVerificationPreview } from "@/actions/admin/support/getSupportVerificationsAction";

type SupportVerificationListProps = {
  verifications: SupportVerificationPreview[];
};

function getStatusConfig(status: string) {
  switch (status) {
    case "VERIFIED":
      return {
        label: "Verified",
        className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        icon: CheckCircle2,
      };

    case "CANCELLED":
      return {
        label: "Dismissed",
        className: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
        icon: XCircle,
      };

    case "EXPIRED":
      return {
        label: "Expired",
        className: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
        icon: Clock3,
      };

    case "PENDING":
    default:
      return {
        label: "Pending",
        className: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
        icon: ShieldCheck,
      };
  }
}

export default function SupportVerificationList({
  verifications,
}: SupportVerificationListProps) {
  return (
    <Card className="rounded-[1.9rem] border border-border/60 bg-white text-slate-950 dark:border-white/10 dark:bg-slate-900 dark:text-white">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Verification activity
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
              Support verifications
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Review support verification requests sent to customers and monitor
              their confirmation status.
            </p>
          </div>

          <div className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            {verifications.length}{" "}
            {verifications.length === 1 ? "request" : "requests"}
          </div>
        </div>

        {verifications.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200/80 bg-slate-50/70 px-5 py-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">
              No support verifications yet
            </p>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              Support verification requests sent to customers will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {verifications.map((verification) => {
              const status = getStatusConfig(verification.status);
              const StatusIcon = status.icon;

              return (
                <div
                  key={verification.id}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-4 transition hover:border-sky-200 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.05] sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                          {verification.user.name}
                        </h3>

                        <Badge
                          className={`rounded-full px-2.5 py-1 text-[11px] ${status.className}`}
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>

                      <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">
                        {verification.user.email ?? "No email available"}
                      </p>
                    </div>

                    <div className="text-left text-xs text-slate-500 dark:text-slate-400 lg:text-right">
                      <p>
                        Sent{" "}
                        <BrowserLocalTimestamp
                          value={verification.requestedAt}
                          variant="datetime"
                        />
                      </p>

                      {verification.confirmedAt ? (
                        <p className="mt-1 text-emerald-600 dark:text-emerald-300">
                          Confirmed{" "}
                          <BrowserLocalTimestamp
                            value={verification.confirmedAt}
                            variant="datetime"
                          />
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border/60 bg-slate-50/80 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                        Representative
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-950 dark:text-white">
                        {verification.representativeName}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-slate-50/80 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                        Department
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-950 dark:text-white">
                        {verification.department}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-border/60 bg-slate-50/80 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                      Reason
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {verification.reason}
                    </p>
                  </div>

                  {verification.expiresAt &&
                  verification.status === "PENDING" ? (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" />

                      <span>
                        Expires{" "}
                        <BrowserLocalTimestamp
                          value={verification.expiresAt}
                          variant="datetime"
                        />
                      </span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
