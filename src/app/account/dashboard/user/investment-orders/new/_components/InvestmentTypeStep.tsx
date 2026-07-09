import { ArrowRight, BadgeCheck, Image as ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";

import type { InvestmentOrderCreationInvestmentOption } from "@/actions/investment-order/getInvestmentOrderCreationOptions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InvestmentTypeStepProps = {
  options: InvestmentOrderCreationInvestmentOption[];
  selectedInvestmentId: string | null;
  onSelect: (value: string) => void;
  onContinue: () => void;
  canContinue: boolean;
  featuredInvestment?: InvestmentOrderCreationInvestmentOption | null;
  siteName: string;
};

export function InvestmentTypeStep({
  options,
  selectedInvestmentId,
  onSelect,
  onContinue,
  canContinue,
  featuredInvestment,
  siteName,
}: InvestmentTypeStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
          Choose an investment type
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
          Start with the {siteName} investment family you want to use, then
          narrow into the available plans and tier options for that product.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {options.map((option) => {
          const isSelected = selectedInvestmentId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={cn(
                "rounded-[1.75rem] border p-5 text-left transition-colors transition-shadow duration-200",
                "border-border/60 bg-white/75 hover:border-border/80 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.05]",
                isSelected
                  ? "!border-sky-300 !bg-sky-50/95 shadow-md shadow-sky-500/10 ring-1 ring-sky-200/70 dark:!border-sky-400/20 dark:!bg-sky-400/12 dark:ring-sky-400/20 dark:shadow-none"
                  : "",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border",
                      isSelected
                        ? "border-sky-300/40 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200"
                        : "border-border/60 bg-white/80 text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300",
                    )}
                  >
                    {option.icon ? (
                      <Image
                        src={option.icon.url}
                        alt={option.icon.alt}
                        width={44}
                        height={44}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5" />
                    )}
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
                    {option.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {option.plans.length} active plan
                    {option.plans.length === 1 ? "" : "s"} available under this
                    investment.
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium shadow-sm",
                      isSelected
                        ? "border-sky-300/40 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/12 dark:text-sky-100"
                        : "border-border/60 bg-white/80 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300",
                    )}
                  >
                    {option.typeLabel}
                  </div>

                  {isSelected ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/12 dark:text-sky-100">
                      <BadgeCheck className="h-4 w-4" />
                      Selected
                    </div>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {featuredInvestment ? (
        <div className="super-admin-surface-lg rounded-[1.75rem] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 px-3 py-3 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10">
              <Sparkles className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-200" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-950 dark:text-white">
                Featured direction: {featuredInvestment.name}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {featuredInvestment.description}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex justify-end">
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
