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
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
          Choose an investment tier
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
          Each tier defines the permitted investment range and ROI profile for{" "}
          {plan.name}. Select the tier that fits your intended contribution.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {tiers.map((tier) => {
          const isSelected = selectedTierId === tier.id;

          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onSelect(tier.id)}
              className={cn(
                "w-full rounded-[1.75rem] border p-5 text-left transition-all duration-200",
                "hover:border-white/12 hover:bg-white/[0.04]",
                isSelected
                  ? "border-blue-400/30 bg-blue-400/10 shadow-[0_18px_45px_rgba(37,99,235,0.16)]"
                  : "border-white/8 bg-white/[0.03]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-300">
                    {tier.levelLabel}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {tier.levelLabel} tier
                  </h3>
                </div>
                {isSelected ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    <BadgeCheck className="h-4 w-4" />
                    Selected
                  </div>
                ) : null}
              </div>

              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    ROI
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-white">
                    <Percent className="h-4 w-4 text-blue-300" />
                    {tier.roiPercent.toFixed(2)}%
                  </p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Investment range
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {formatCurrency(tier.minAmount, plan.currency)} -{" "}
                    {formatCurrency(tier.maxAmount, plan.currency)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Plan context
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-white">
                    <ShieldCheck className="h-4 w-4 text-blue-300" />
                    {plan.categoryLabel} | {plan.periodLabel}
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
