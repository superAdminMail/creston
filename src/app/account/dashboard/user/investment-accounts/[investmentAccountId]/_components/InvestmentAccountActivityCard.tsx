import { Activity, CheckCircle2, CircleDot, Clock3 } from "lucide-react";

import type { InvestmentAccountDetailsViewModel } from "@/actions/investment-account/getInvestmentAccountDetails";
import { cn } from "@/lib/utils";

function getTimelineTone(tone: string) {
  switch (tone) {
    case "positive":
      return {
        marker:
          "bg-emerald-500 ring-emerald-100 dark:bg-emerald-400 dark:ring-emerald-400/10",
        icon: "text-emerald-700 dark:text-emerald-400",
        surface: "bg-emerald-50 dark:bg-emerald-400/5",
      };

    case "subtle":
      return {
        marker:
          "bg-slate-400 ring-slate-100 dark:bg-slate-500 dark:ring-white/5",
        icon: "text-slate-500 dark:text-slate-400",
        surface: "bg-slate-50 dark:bg-white/[0.02]",
      };

    default:
      return {
        marker: "bg-sky-500 ring-sky-100 dark:bg-sky-400 dark:ring-sky-400/10",
        icon: "text-sky-800 dark:text-sky-400",
        surface: "bg-sky-50/60 dark:bg-sky-400/[0.04]",
      };
  }
}

export function InvestmentAccountActivityCard({
  account,
}: {
  account: InvestmentAccountDetailsViewModel;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-400">
          <Activity className="h-4 w-4" />
          Account history
        </div>

        <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
          Account activity
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
          A timeline of key account lifecycle events and updates.
        </p>
      </div>

      {account.timeline.length > 0 ? (
        <div className="mt-6">
          {account.timeline.map((item, index) => {
            const tone = getTimelineTone(item.tone);
            const isLast = index === account.timeline.length - 1;

            return (
              <div key={item.id} className="flex gap-4">
                <div className="flex w-4 shrink-0 flex-col items-center">
                  <span
                    className={cn(
                      "mt-4 h-3 w-3 shrink-0 rounded-full ring-4",
                      tone.marker,
                    )}
                  />

                  {!isLast && (
                    <span className="mt-2 min-h-12 w-px flex-1 bg-slate-200 dark:bg-white/10" />
                  )}
                </div>

                <div
                  className={cn(
                    "mb-4 min-w-0 flex-1 rounded-xl border border-slate-100 p-4 dark:border-white/5",
                    tone.surface,
                    isLast && "mb-0",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">
                        {item.label}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {item.value}
                      </p>
                    </div>

                    <CircleDot
                      className={cn("mt-0.5 h-4 w-4 shrink-0", tone.icon)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 px-5 py-9 text-center dark:border-white/15">
          <Clock3 className="mx-auto h-6 w-6 text-slate-400" />

          <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
            No activity recorded
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Account events and updates will appear here when available.
          </p>
        </div>
      )}
    </section>
  );
}
