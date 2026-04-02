import {
  ArrowRight,
  BriefcaseBusiness,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { InvestmentOrderCreationInvestmentOption } from "@/actions/investment-order/getInvestmentOrderCreationOptions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InvestmentTypeOption = {
  type: string;
  label: string;
  investmentCount: number;
  planCount: number;
  riskLabel: string;
};

type InvestmentTypeStepProps = {
  options: InvestmentTypeOption[];
  selectedType: string | null;
  onSelect: (value: string) => void;
  onContinue: () => void;
  canContinue: boolean;
  featuredInvestment?: InvestmentOrderCreationInvestmentOption | null;
};

export function InvestmentTypeStep({
  options,
  selectedType,
  onSelect,
  onContinue,
  canContinue,
  featuredInvestment,
}: InvestmentTypeStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
          Choose an investment type
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
          Start with the asset family that best fits the investment direction
          you want Havenstone to structure for this order.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {options.map((option) => {
          const isSelected = selectedType === option.type;

          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onSelect(option.type)}
              className={cn(
                "rounded-[1.75rem] border p-5 text-left transition-all duration-200",
                "hover:border-white/12 hover:bg-white/[0.04]",
                isSelected
                  ? "border-blue-400/30 bg-blue-400/10 shadow-[0_18px_45px_rgba(37,99,235,0.16)]"
                  : "border-white/8 bg-white/[0.03]",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-2xl border",
                      isSelected
                        ? "border-blue-400/20 bg-blue-400/12 text-blue-200"
                        : "border-white/8 bg-white/[0.04] text-slate-300",
                    )}
                  >
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {option.label}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {option.investmentCount} curated investment family
                    {option.investmentCount === 1 ? "" : "ies"} and{" "}
                    {option.planCount} active plan
                    {option.planCount === 1 ? "" : "s"} available.
                  </p>
                </div>

                <div
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    isSelected
                      ? "border-blue-400/20 bg-blue-400/12 text-blue-200"
                      : "border-white/8 bg-white/[0.04] text-slate-300",
                  )}
                >
                  {option.riskLabel} risk
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {featuredInvestment ? (
        <div className="glass-strong rounded-[1.75rem] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-400/10">
              <Sparkles className="h-4 w-4 text-blue-200" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Featured direction: {featuredInvestment.name}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                {featuredInvestment.description}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />
                {featuredInvestment.riskLevelLabel} risk •{" "}
                {featuredInvestment.periodLabel}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex justify-end">
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
