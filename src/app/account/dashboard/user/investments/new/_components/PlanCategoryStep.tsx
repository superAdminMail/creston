import { ArrowLeft, ArrowRight, Layers3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PlanCategoryOption = {
  category: string;
  label: string;
  planCount: number;
};

type PlanCategoryStepProps = {
  selectedInvestmentTypeLabel: string;
  options: PlanCategoryOption[];
  selectedCategory: string | null;
  onSelect: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  canContinue: boolean;
};

export function PlanCategoryStep({
  selectedInvestmentTypeLabel,
  options,
  selectedCategory,
  onSelect,
  onBack,
  onContinue,
  canContinue,
}: PlanCategoryStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
          Choose a plan category
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
          Narrow {selectedInvestmentTypeLabel.toLowerCase()} options to the
          financial goal category that best matches your order.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {options.map((option) => {
          const isSelected = selectedCategory === option.category;

          return (
            <button
              key={option.category}
              type="button"
              onClick={() => onSelect(option.category)}
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
                    <Layers3 className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {option.label}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {option.planCount} active plan
                    {option.planCount === 1 ? "" : "s"} available in this
                    category.
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
