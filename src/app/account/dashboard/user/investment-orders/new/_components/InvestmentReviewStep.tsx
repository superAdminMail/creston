import { ArrowLeft, BadgeCheck, Loader2, ShieldCheck } from "lucide-react";

import type {
  InvestmentOrderCreationPlanOption,
  InvestmentOrderCreationTierOption,
} from "@/actions/investment-order/getInvestmentOrderCreationOptions";
import type { CreateInvestmentOrderActionState } from "@/actions/investment-order/createInvestmentOrder.state";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters/formatters";
import { DashboardActionSubmitButton } from "../../../../_components/DashboardActionSubmitButton";

type InvestmentReviewStepProps = {
  investmentId: string;
  investmentName: string;
  plan: InvestmentOrderCreationPlanOption;
  tier: InvestmentOrderCreationTierOption;
  investmentTypeLabel: string;
  amount: string;
  formAction: (formData: FormData) => void;
  actionState: CreateInvestmentOrderActionState;
  onBack: () => void;
  canSubmit: boolean;
};

export function InvestmentReviewStep({
  investmentId,
  investmentName,
  plan,
  tier,
  investmentTypeLabel,
  amount,
  formAction,
  actionState,
  onBack,
  canSubmit,
}: InvestmentReviewStepProps) {
  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="investmentId" value={investmentId} />
      <input type="hidden" name="investmentPlanId" value={plan.id} />
      <input type="hidden" name="investmentPlanTierId" value={tier.id} />
      <input type="hidden" name="amount" value={amount} />

      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
          Review and submit
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
          Review the details of your investment order before submission. Make
          sure everything looks correct, as this information will be used for
          order processing.
        </p>
      </div>

      <section className="rounded-[1.75rem] border border-border/60 bg-white/75 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200">
            <BadgeCheck className="h-4 w-4" />
            Ready for submission
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/80 px-3 py-1 text-xs text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            <ShieldCheck className="h-4 w-4 text-sky-700 dark:text-blue-300" />
            Secure order workflow
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Investment type
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {investmentName}
            </p>
          </div>

          <div className="rounded-3xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Type family
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {investmentTypeLabel}
            </p>
          </div>

          <div className="rounded-3xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Selected plan
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {plan.name}
            </p>
          </div>

          <div className="rounded-3xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Tier
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {tier.levelLabel}
            </p>
          </div>

          <div className="rounded-3xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Tier return
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {tier.returnLabel ?? "Return not configured"}
            </p>
          </div>

          <div className="rounded-3xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Period
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {plan.periodLabel}
            </p>
          </div>

          <div className="rounded-3xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Currency
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {plan.currency}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[1.75rem] border border-sky-200/70 bg-sky-50 p-5 shadow-sm dark:border-sky-400/20 dark:bg-sky-500/10">
          <p className="text-xs uppercase tracking-[0.14em] text-sky-800/75 dark:text-sky-100/75">
            Investment amount
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
            {formatCurrency(Number(amount), plan.currency)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
            This order will be created in {plan.currency} with initial status{" "}
            <span className="font-medium text-slate-950 dark:text-white">
              Pending Payment
            </span>
            .
          </p>
        </div>

        {actionState.status === "error" ? (
          <div className="mt-5 rounded-2xl border border-rose-200/70 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-sm dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">
            {actionState.message}
          </div>
        ) : null}
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

        <DashboardActionSubmitButton
          idleLabel="Create investment order"
          pendingLabel="Creating order..."
          pendingIcon={<Loader2 className="h-4 w-4 animate-spin" />}
          disabled={!canSubmit}
          className="btn-primary rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm"
        />
      </div>
    </form>
  );
}
