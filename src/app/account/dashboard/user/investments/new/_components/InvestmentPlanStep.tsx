import Image from "next/image";
import { ArrowLeft, ArrowRight, BadgeCheck, ShieldCheck } from "lucide-react";

import type { InvestmentOrderCreationPlanOption } from "@/actions/investment-order/getInvestmentOrderCreationOptions";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters/formatters";
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
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
          Choose an investment plan
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
          Review the active plans available for your chosen investment type and
          category, then select the structure that fits your intended order.
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
                "w-full rounded-[1.75rem] border p-5 text-left transition-all duration-200",
                "hover:border-white/12 hover:bg-white/[0.04]",
                isSelected
                  ? "border-blue-400/30 bg-blue-400/10 shadow-[0_18px_45px_rgba(37,99,235,0.16)]"
                  : "border-white/8 bg-white/[0.03]",
              )}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
                    {plan.icon ? (
                      <Image
                        src={plan.icon.url}
                        alt={plan.icon.alt}
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <ShieldCheck className="h-5 w-5 text-blue-300" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">
                        {plan.name}
                      </h3>
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                        {plan.categoryLabel}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-blue-400/15 bg-blue-400/8 px-3 py-1 text-xs text-blue-200">
                        {plan.periodLabel}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {plan.description}
                    </p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                          Parent investment
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {plan.investmentName}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                          Currency
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {plan.currency}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                          Minimum
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {formatCurrency(plan.minAmount, plan.currency)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                          Maximum
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {formatCurrency(plan.maxAmount, plan.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {isSelected ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    <BadgeCheck className="h-4 w-4" />
                    Selected
                  </div>
                ) : null}
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
          className="btn-secondary rounded-xl px-5 py-3 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
