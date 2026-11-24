import { CheckCircle2, Layers3, TrendingUp } from "lucide-react";

import type { InvestmentAccountDetailsViewModel } from "@/actions/investment-account/getInvestmentAccountDetails";
import { formatCurrency } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";
import { DashboardSectionCard } from "../../../../_components/DashboardSectionCard";

const SURFACE =
  "rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900";

export function InvestmentPlanOverviewCard({
  account,
}: {
  account: InvestmentAccountDetailsViewModel;
}) {
  const isActive = account.plan.isActive;

  return (
    <DashboardSectionCard>
      <div className="space-y-6">
        {/* Plan heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-400">
              <Layers3 className="h-4 w-4" />
              Plan configuration
            </div>

            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {account.plan.name}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              {account.plan.description}
            </p>
          </div>

          <span
            className={cn(
              "inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
              isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                : "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300",
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {isActive ? "Plan active" : "Plan inactive"}
          </span>
        </div>

        {/* Investment tiers */}
        <div className="space-y-4 border-t border-slate-100 pt-5 dark:border-white/10">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                Investment tiers
              </h3>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Available investment levels, their return details, and
                qualifying amount ranges.
              </p>
            </div>

            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-white/5 dark:text-slate-300">
              {account.plan.tiers.length}{" "}
              {account.plan.tiers.length === 1 ? "tier" : "tiers"}
            </span>
          </div>

          {account.plan.tiers.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {account.plan.tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={cn(
                    SURFACE,
                    "overflow-hidden transition-colors hover:border-sky-200 dark:hover:border-sky-400/30",
                  )}
                >
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4 dark:border-white/10 sm:p-5">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-sky-800 dark:text-sky-400">
                        Investment tier
                      </p>

                      <h4 className="mt-1 text-base font-semibold text-slate-950 dark:text-white">
                        {tier.levelLabel}
                      </h4>
                    </div>

                    <div className="rounded-xl bg-sky-50 p-2.5 text-sky-800 dark:bg-sky-500/10 dark:text-sky-400">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="space-y-4 p-4 sm:p-5">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Return information
                      </p>

                      <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                        {tier.returnLabel ??
                          `${tier.roiPercent.toFixed(2)}% ROI`}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Investment amount range
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                        {formatCurrency(tier.minAmount, account.plan.currency)}
                        {" – "}
                        {formatCurrency(tier.maxAmount, account.plan.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center dark:border-white/15">
              <Layers3 className="mx-auto h-6 w-6 text-slate-400" />

              <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                No tier details available
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                There are currently no tier records to display for this plan.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardSectionCard>
  );
}
