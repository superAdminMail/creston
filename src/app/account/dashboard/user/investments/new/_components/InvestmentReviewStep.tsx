import { useFormStatus } from "react-dom";
import { ArrowLeft, BadgeCheck, Loader2, ShieldCheck } from "lucide-react";

import type {
  InvestmentOrderCreationPlanOption,
  InvestmentOrderCreationTierOption,
} from "@/actions/investment-order/getInvestmentOrderCreationOptions";
import type { CreateInvestmentOrderActionState } from "@/actions/investment-order/createInvestmentOrder.state";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters/formatters";

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
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold"
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating order...
        </span>
      ) : (
        "Create investment order"
      )}
    </Button>
  );
}

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
}: InvestmentReviewStepProps) {
  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="investmentId" value={investmentId} />
      <input type="hidden" name="investmentPlanId" value={plan.id} />
      <input type="hidden" name="investmentPlanTierId" value={tier.id} />
      <input type="hidden" name="amount" value={amount} />

      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
          Review your investment order
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
          Confirm the selected plan, tier, amount, and product profile before
          Havenstone creates your order for payment processing.
        </p>
      </div>

      <section className="card-premium rounded-[1.75rem] p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <BadgeCheck className="h-4 w-4" />
            Ready for submission
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-blue-300" />
            Secure order workflow
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Investment type
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {investmentName}
            </p>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Type family
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {investmentTypeLabel}
            </p>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Selected plan
            </p>
            <p className="mt-2 text-sm font-medium text-white">{plan.name}</p>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Tier
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {tier.levelLabel}
            </p>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Tier ROI
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {tier.roiPercent.toFixed(2)}%
            </p>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Period
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {plan.periodLabel}
            </p>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Currency
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {plan.currency}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[1.75rem] border border-blue-400/15 bg-blue-400/8 p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-blue-100/75">
            Investment amount
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
            {formatCurrency(Number(amount), plan.currency)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            This order will be created in {plan.currency} with initial status{" "}
            <span className="font-medium text-white">Pending Payment</span>.
          </p>
        </div>

        {actionState.status === "error" ? (
          <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {actionState.message}
          </div>
        ) : null}
      </section>

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

        <SubmitButton />
      </div>
    </form>
  );
}
