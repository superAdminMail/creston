import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { SuperAdminSavingsAccountDetailsViewModel } from "@/actions/super-admin/savings-accounts/getSuperAdminSavingsAccountById";
import { cn } from "@/lib/utils";

function getStatusClasses(
  status: SuperAdminSavingsAccountDetailsViewModel["status"],
) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    case "PAUSED":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";
    case "CLOSED":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";
    default:
      return "border-white/10 bg-white/[0.04] text-slate-200";
  }
}

export function SavingsAccountDetailsHeader({
  account,
}: {
  account: SuperAdminSavingsAccountDetailsViewModel;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Link
          href="/account/dashboard/super-admin/savings-accounts"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to savings accounts
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            {account.title}
          </h1>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
              getStatusClasses(account.status),
            )}
          >
            {account.statusLabel}
          </span>
        </div>

        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
          {account.subtitle}. Review the account owner, savings product, balance,
          and funding history from one secure super-admin view.
        </p>
      </div>
    </div>
  );
}
