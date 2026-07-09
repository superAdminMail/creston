import { ArrowLeft, ArrowRight, Landmark } from "lucide-react";

import type {
  InvestmentOrderCreationPlanOption,
  InvestmentOrderCreationTierOption,
} from "@/actions/investment-order/getInvestmentOrderCreationOptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/formatters/formatters";

type InvestmentAmountStepProps = {
  plan: InvestmentOrderCreationPlanOption;
  tier: InvestmentOrderCreationTierOption;
  amount: string;
  amountError: string | null;
  serverAmountError?: string;
  onAmountChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  canContinue: boolean;
};

export function InvestmentAmountStep({
  plan,
  tier,
  amount,
  amountError,
  serverAmountError,
  onAmountChange,
  onBack,
  onContinue,
  canContinue,
}: InvestmentAmountStepProps) {
  const helperText = `Allowed range: ${formatCurrency(
    tier.minAmount,
    plan.currency,
  )} to ${formatCurrency(tier.maxAmount, plan.currency)}.`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
          Enter the order amount
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
          Enter the amount you want to invest in this plan. The allowed range
          is based on the selected tier requirements.
        </p>
      </div>

      <section className="rounded-[1.75rem] border border-border/60 bg-white/75 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl border border-sky-200/70 bg-sky-50 px-3 py-3 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10">
            <Landmark className="h-5 w-5 shrink-0 text-sky-700 dark:text-sky-200" />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
              {plan.name}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {plan.periodLabel} | {plan.investmentName} | {tier.levelLabel}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {helperText}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="investment-amount"
            className="text-sm font-medium text-slate-950 dark:text-white"
          >
            Amount
          </label>
          <Input
            id="investment-amount"
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            placeholder="1000.00"
            className="mt-3 h-12 rounded-2xl border-border/60 bg-white/80 text-slate-950 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
          />
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            {helperText}
          </p>
          {amountError || serverAmountError ? (
            <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">
              {amountError || serverAmountError}
            </p>
          ) : null}
        </div>
      </section>

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
