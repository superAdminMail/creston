import { CheckCircle2 } from "lucide-react";

import type { InvestmentAccountDetailsViewModel } from "@/actions/investment-account/getInvestmentAccountDetails";
import { formatCurrency } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";

export function InvestmentPlanOverviewCard({
  account,
}: {
  account: InvestmentAccountDetailsViewModel;
}) {
  return (
    <section className="card-premium rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
            Investment plan overview
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {account.plan.description}
          </p>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
            account.plan.isActive
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : "border-slate-300/20 bg-slate-400/10 text-slate-200",
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {account.plan.isActive ? "Plan active" : "Plan inactive"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Plan name
          </p>
          <p className="mt-3 text-base font-semibold text-white">
            {account.plan.name}
          </p>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Category
          </p>
          <p className="mt-3 text-base font-semibold text-white">
            {account.plan.categoryLabel}
          </p>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Period
          </p>
          <p className="mt-3 text-base font-semibold text-white">
            {account.plan.periodLabel}
          </p>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Tier coverage
          </p>
          <p className="mt-3 text-base font-semibold text-white">
            {account.plan.tierRangeLabel ?? `Quoted in ${account.plan.currency}`}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {account.plan.tiers.map((tier) => (
          <div
            key={tier.id}
            className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
              {tier.levelLabel}
            </p>
            <p className="mt-3 text-base font-semibold text-white">
              {tier.roiPercent.toFixed(2)}% ROI
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {account.plan.currency} tier option
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {formatCurrency(tier.minAmount, account.plan.currency)} -{" "}
              {formatCurrency(tier.maxAmount, account.plan.currency)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
