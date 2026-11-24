import Link from "next/link";
import { ArrowLeft, BadgeCheck, CircleDot } from "lucide-react";

import type { InvestmentAccountDetailsViewModel } from "@/actions/investment-account/getInvestmentAccountDetails";
import { cn } from "@/lib/utils";

function getStatusClasses(status: InvestmentAccountDetailsViewModel["status"]) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300";

    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300";

    case "FROZEN":
      return "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-300/20 dark:bg-slate-400/10 dark:text-slate-300";

    case "CLOSED":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300";

    default:
      return "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300";
  }
}

function getStatusIcon(status: InvestmentAccountDetailsViewModel["status"]) {
  return status === "ACTIVE" ? BadgeCheck : CircleDot;
}

export function InvestmentAccountDetailsHeader({
  account,
  siteName,
}: {
  account: InvestmentAccountDetailsViewModel;
  siteName: string;
}) {
  const StatusIcon = getStatusIcon(account.status);

  return (
    <header className="space-y-5">
      <Link
        href="/account/dashboard/user/investment-accounts"
        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-sky-800 dark:text-slate-400 dark:hover:text-sky-400"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors group-hover:border-sky-200 group-hover:bg-sky-50 dark:border-white/10 dark:bg-white/[0.03] dark:group-hover:border-sky-400/30 dark:group-hover:bg-sky-400/10">
          <ArrowLeft className="h-4 w-4" />
        </span>
        Back to investment accounts
      </Link>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-400">
                Investment account
              </span>

              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />

              <span className="text-xs text-slate-500 dark:text-slate-400">
                Account overview
              </span>
            </div>

            <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              {account.title}
            </h1>
          </div>

          <span
            className={cn(
              "inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
              getStatusClasses(account.status),
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {account.statusLabel}
          </span>
        </div>

        <div className="border-t border-slate-100 pt-4 dark:border-white/10">
          <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base sm:leading-7">
            {account.subtitle}. Review the plan structure, investment product
            profile, and account lifecycle details in one secure {siteName}{" "}
            view.
          </p>
        </div>
      </div>
    </header>
  );
}
