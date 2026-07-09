import { ArrowLeft, ArrowRight, BadgeCheck, Percent, ShieldCheck } from "lucide-react";

import type {
  InvestmentOrderCreationPlanOption,
  InvestmentOrderCreationTierOption,
} from "@/actions/investment-order/getInvestmentOrderCreationOptions";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";

type InvestmentTierStepProps = {
  plan: InvestmentOrderCreationPlanOption;
  tiers: InvestmentOrderCreationTierOption[];
  selectedTierId: string | null;
  onSelect: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  canContinue: boolean;
};

export function InvestmentTierStep({
  plan,
  tiers,
  selectedTierId,
  onSelect,
  onBack,
  onContinue,
  canContinue,
}: InvestmentTierStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
          Choose a tier
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">
          Each tier defines the permitted investment range and return profile
          for {plan.name}. Select the tier that fits your intended
          contribution.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {tiers.map((tier) => {
          const isSelected = selectedTierId === tier.id;
          const isRecommended = tier.level === "ADVANCED";

          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onSelect(tier.id)}
              className={cn(
                "w-full rounded-[1.75rem] border p-5 text-left transition-colors transition-shadow duration-200",
                "border-border/60 bg-white/75 hover:border-border/80 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.05]",
                isSelected
                  ? "!border-sky-300 !bg-sky-50/95 shadow-md shadow-sky-500/10 ring-1 ring-sky-200/70 dark:!border-sky-400/20 dark:!bg-sky-400/12 dark:ring-sky-400/20 dark:shadow-none"
                  : "",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-border/60 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                      {tier.levelLabel}
                    </span>
                    {isRecommended ? (
                      <span className="inline-flex items-center rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 shadow-sm dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
                        Recommended
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
                    {tier.levelLabel} tier
                  </h3>
                </div>
                {isSelected ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/12 dark:text-sky-100">
                    <BadgeCheck className="h-4 w-4" />
                    Selected
                  </div>
                ) : null}
              </div>

              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Return
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-950 dark:text-white">
                    <Percent className="h-4 w-4 text-sky-700 dark:text-blue-300" />
                    {tier.returnLabel ?? "Return not configured"}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Investment range
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                    {formatCurrency(tier.minAmount, plan.currency)} -{" "}
                    {formatCurrency(tier.maxAmount, plan.currency)}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Plan context
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-950 dark:text-white">
                    <ShieldCheck className="h-4 w-4 text-sky-700 dark:text-blue-300" />
                    {plan.investmentName} | {plan.periodLabel}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="btn-secondary rounded-2xl px-5 py-3 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="btn-primary rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
