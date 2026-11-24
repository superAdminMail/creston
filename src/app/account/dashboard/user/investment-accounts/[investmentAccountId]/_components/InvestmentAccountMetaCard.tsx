import {
  CalendarDays,
  Clock3,
  History,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import type { InvestmentAccountDetailsViewModel } from "@/actions/investment-account/getInvestmentAccountDetails";
import { cn } from "@/lib/utils";

const rows = [
  {
    label: "Opened date",
    key: "openedAt",
    icon: CalendarDays,
  },
  {
    label: "Closed date",
    key: "closedAt",
    icon: Clock3,
  },
  {
    label: "Created date",
    key: "createdAt",
    icon: History,
  },
  {
    label: "Updated date",
    key: "updatedAt",
    icon: RefreshCw,
  },
] as const;

export function InvestmentAccountMetaCard({
  account,
}: {
  account: InvestmentAccountDetailsViewModel;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-400">
          <History className="h-4 w-4" />
          Account records
        </div>

        <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
          Account metadata
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Lifecycle and servicing information for this investment account.
        </p>
      </div>

      <div className="mt-6 space-y-1">
        {rows.map((row) => {
          const Icon = row.icon;
          const value = account[row.key];

          return (
            <div
              key={row.key}
              className="flex items-center justify-between gap-4 border-b border-slate-100 py-3.5 last:border-0 dark:border-white/5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400">
                  <Icon className="h-4 w-4" />
                </div>

                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {row.label}
                </span>
              </div>

              <span className="text-right text-sm font-medium text-slate-950 dark:text-slate-200">
                {value ?? "—"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-slate-500 dark:text-slate-400" />

            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Account status
            </span>
          </div>

          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              account.status === "ACTIVE" &&
                "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",
              account.status === "PENDING" &&
                "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300",
              account.status === "FROZEN" &&
                "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300",
              account.status === "CLOSED" &&
                "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300",
              !["ACTIVE", "PENDING", "FROZEN", "CLOSED"].includes(
                account.status,
              ) &&
                "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300",
            )}
          >
            {account.statusLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
