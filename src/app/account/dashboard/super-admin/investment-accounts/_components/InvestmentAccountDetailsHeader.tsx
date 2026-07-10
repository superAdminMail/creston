import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { SuperAdminInvestmentAccountDetailsViewModel } from "@/actions/super-admin/investment-accounts/getSuperAdminInvestmentAccountById";
import { cn } from "@/lib/utils";

function getStatusClasses(
  status: SuperAdminInvestmentAccountDetailsViewModel["status"],
) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300";
    case "PENDING":
      return "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-300";
    case "FROZEN":
      return "border-slate-300/70 bg-slate-100/80 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200";
    case "CLOSED":
      return "border-rose-400/20 bg-rose-400/10 text-rose-700 dark:text-rose-300";
    default:
      return "border-slate-200/80 bg-slate-50/80 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200";
  }
}

export function InvestmentAccountDetailsHeader({
  account,
}: {
  account: SuperAdminInvestmentAccountDetailsViewModel;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Link
          href="/account/dashboard/super-admin/investment-accounts"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-sky-700 transition hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to investment accounts
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">
            {account.title}
          </h1>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium shadow-sm",
              getStatusClasses(account.status),
            )}
          >
            {account.statusLabel}
          </span>
        </div>

        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
          {account.subtitle}. Review the account lifecycle, owner context, plan
          structure, and investment product details in one secure super-admin
          view.
        </p>
      </div>
    </div>
  );
}
