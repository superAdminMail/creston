import Image from "next/image";
import { ArrowLeft, ArrowRight, BadgeCheck, ShieldCheck } from "lucide-react";

import type { InvestmentOrderCreationPlanOption } from "@/actions/investment-order/getInvestmentOrderCreationOptions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InvestmentPlanCardOption = InvestmentOrderCreationPlanOption & {
  icon: {
    url: string;
    alt: string;
  } | null;
};

type InvestmentPlanStepProps = {
  plans: InvestmentPlanCardOption[];
  selectedPlanId: string | null;
  onSelect: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  canContinue: boolean;
};

export function InvestmentPlanStep({
  plans,
  selectedPlanId,
  onSelect,
  onBack,
  onContinue,
  canContinue,
}: InvestmentPlanStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
          Choose a plan
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">
          Review the active plans for your chosen investment type, then select
          the plan that contains the tier structure you want to use for this
          order.
        </p>
      </div>

      <div className="space-y-4">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelect(plan.id)}
              className={cn(
                "w-full rounded-[1.75rem] border p-5 text-left transition-colors transition-shadow duration-200",
                "border-border/60 bg-white/75 hover:border-border/80 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.05]",
                isSelected
                  ? "!border-sky-300 !bg-sky-50/95 shadow-md shadow-sky-500/10 ring-1 ring-sky-200/70 dark:!border-sky-400/20 dark:!bg-sky-400/12 dark:ring-sky-400/20 dark:shadow-none"
                  : "",
              )}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-border/60 bg-white/80 px-3 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                    {plan.icon ? (
                      <Image
                        src={plan.icon.url}
                        alt={plan.icon.alt}
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <ShieldCheck className="h-5 w-5 shrink-0 text-sky-700 dark:text-blue-300" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                        {plan.name}
                      </h3>
                      <span className="inline-flex items-center rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-xs text-sky-800 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
                        {plan.periodLabel}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {plan.description}
                    </p>
                    {isSelected ? (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/12 dark:text-sky-100">
                        <BadgeCheck className="h-4 w-4" />
                        Selected
                      </div>
                    ) : null}
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          Parent investment
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                          {plan.investmentName}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          Currency
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                          {plan.currency}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          Tier options
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                          {plan.tiersCountLabel}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          Available range
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                          {plan.tierRangeLabel ?? `Quoted in ${plan.currency}`}
                        </p>
                      </div>
                    </div>
                  </div>
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
