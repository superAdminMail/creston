"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, Landmark, ShieldCheck, Wallet } from "lucide-react";

import { createInvestmentOrder } from "@/actions/investment-order/createInvestmentOrder";
import { initialCreateInvestmentOrderActionState } from "@/actions/investment-order/createInvestmentOrder.state";
import type {
  InvestmentOrderCreationOptionsData,
  InvestmentOrderCreationPlanOption,
  InvestmentOrderCreationTierOption,
} from "@/actions/investment-order/getInvestmentOrderCreationOptions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters/formatters";
import { parseInvestmentOrderAmount } from "@/lib/zodValidations/investment-order";
import { cn } from "@/lib/utils";
import { CreateInvestmentOrderEmptyState } from "./CreateInvestmentOrderEmptyState";
import { InvestmentAmountStep } from "./InvestmentAmountStep";
import { InvestmentPlanStep } from "./InvestmentPlanStep";
import { InvestmentReviewStep } from "./InvestmentReviewStep";
import { InvestmentTierStep } from "./InvestmentTierStep";
import { InvestmentTypeStep } from "./InvestmentTypeStep";

const stepTitles = ["Investment", "Plan", "Tier", "Amount", "Review"] as const;

type CreateInvestmentOrderWizardProps = {
  options: InvestmentOrderCreationOptionsData;
  createdOrderId?: string | null;
  siteName: string;
};

type InvestmentPlanCardOption = InvestmentOrderCreationPlanOption & {
  icon: {
    url: string;
    alt: string;
  } | null;
};

function getAmountError(
  plan: InvestmentOrderCreationPlanOption | null,
  tier: InvestmentOrderCreationTierOption | null,
  amount: string,
) {
  if (!plan) return "Select an investment plan first.";
  if (!tier) return "Select an investment tier first.";
  if (!amount.trim()) return "Enter an investment amount.";

  const parsedAmount = parseInvestmentOrderAmount(amount);

  if (parsedAmount === null) {
    return "Enter a valid amount with up to 2 decimal places.";
  }

  if (parsedAmount < tier.minAmount || parsedAmount > tier.maxAmount) {
    return `Allowed range: ${formatCurrency(
      tier.minAmount,
      plan.currency,
    )} to ${formatCurrency(tier.maxAmount, plan.currency)}.`;
  }

  return null;
}

export function CreateInvestmentOrderWizard({
  options,
  createdOrderId,
  siteName,
}: CreateInvestmentOrderWizardProps) {
  const [actionState, formAction] = useActionState(
    createInvestmentOrder,
    initialCreateInvestmentOrderActionState,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<
    string | null
  >(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  const firstInvestmentId = options.investments[0]?.id ?? null;
  const effectiveSelectedInvestmentId =
    options.investments.some(
      (investment) => investment.id === selectedInvestmentId,
    )
      ? selectedInvestmentId
      : firstInvestmentId;

  const selectedInvestment = useMemo(
    () =>
      options.investments.find(
        (investment) => investment.id === effectiveSelectedInvestmentId,
      ) ?? null,
    [effectiveSelectedInvestmentId, options.investments],
  );

  const matchingPlans = useMemo<InvestmentPlanCardOption[]>(
    () =>
      selectedInvestment
        ? selectedInvestment.plans.map((plan) => ({
            ...plan,
            icon: selectedInvestment.icon,
          }))
        : [],
    [selectedInvestment],
  );

  const firstPlanId = matchingPlans[0]?.id ?? null;
  const effectiveSelectedPlanId = matchingPlans.some(
    (plan) => plan.id === selectedPlanId,
  )
    ? selectedPlanId
    : firstPlanId;

  const selectedPlan = useMemo(
    () => matchingPlans.find((plan) => plan.id === effectiveSelectedPlanId) ?? null,
    [effectiveSelectedPlanId, matchingPlans],
  );

  const firstTierId = selectedPlan?.tiers[0]?.id ?? null;
  const effectiveSelectedTierId = selectedPlan?.tiers.some(
    (tier) => tier.id === selectedTierId,
  )
    ? selectedTierId
    : firstTierId;

  const featuredInvestment = selectedInvestment;

  const selectedTier = useMemo(
    () =>
      selectedPlan?.tiers.find((tier) => tier.id === effectiveSelectedTierId) ??
      null,
    [effectiveSelectedTierId, selectedPlan],
  );

  const amountError = getAmountError(selectedPlan, selectedTier, amount);

  const effectiveStep = useMemo(() => {
    if (actionState.status !== "error" || currentStep !== 4) {
      return currentStep;
    }

    if (actionState.fieldErrors?.investmentId) return 0;
    if (actionState.fieldErrors?.investmentPlanId) return 1;
    if (actionState.fieldErrors?.investmentPlanTierId) return 2;
    if (actionState.fieldErrors?.amount) return 3;

    return currentStep;
  }, [actionState, currentStep]);

  if (options.totalActivePlans === 0) {
    return <CreateInvestmentOrderEmptyState hasInvestorProfile />;
  }

  const guidanceItems = [
    {
      title: "Investor profile ready",
      body: "Keep your personal details current so order review and servicing stay smooth.",
      icon: ShieldCheck,
    },
    {
      title: "Tier-led order creation",
      body: "Each investment plan has different tiers with specific requirements. Follow the steps to find the best fit for you.",
      icon: Landmark,
    },
    {
      title: "Access your account after order confirmation",
      body: "This process creates an investment order. Once confirmed, you can access your investment account and track its performance.",
      icon: Wallet,
    },
  ];
  const progressValue = ((effectiveStep + 1) / stepTitles.length) * 100;

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)]">
      <div className="space-y-6">
        {createdOrderId ? (
          <div className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-400/10 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-white">
                  Investment order created successfully
                </p>
                <p className="mt-1 text-sm leading-6 text-emerald-100/85">
                  Order reference{" "}
                  <span className="font-medium text-white">
                    {createdOrderId}
                  </span>{" "}
                  is now pending payment. You can start another order below if
                  needed.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <section className="card-premium overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  Order progress
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  Step {effectiveStep + 1} of {stepTitles.length}:{" "}
                  {stepTitles[effectiveStep]}
                </p>
              </div>

              <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-100">
                {Math.round(progressValue)}%
              </span>
            </div>

            <Progress
              value={progressValue}
              className="h-2 rounded-full bg-white/10"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {stepTitles.map((stepTitle, index) => {
              const isActive = index === effectiveStep;
              const isComplete = index < effectiveStep;

              return (
                <div
                  key={stepTitle}
                  className={cn(
                    "rounded-3xl border p-4 transition-colors duration-200",
                    isActive
                      ? "border-blue-400/25 bg-blue-400/10"
                      : isComplete
                        ? "border-emerald-400/20 bg-emerald-400/10"
                        : "border-white/8 bg-white/[0.03]",
                  )}
                >
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Step {index + 1}
                  </p>
                  <p className="mt-3 text-sm font-medium text-white">
                    {stepTitle}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card-premium overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
          {effectiveStep === 0 ? (
            <InvestmentTypeStep
              options={options.investments}
              selectedInvestmentId={selectedInvestmentId}
              onSelect={(value) => {
                setSelectedInvestmentId(value);
                setSelectedPlanId(null);
                setSelectedTierId(null);
                setAmount("");
              }}
              onContinue={() => setCurrentStep(1)}
              canContinue={Boolean(effectiveSelectedInvestmentId)}
              featuredInvestment={featuredInvestment}
            />
          ) : null}

          {effectiveStep === 1 ? (
            <InvestmentPlanStep
              plans={matchingPlans}
              selectedPlanId={selectedPlanId}
              onSelect={(value) => {
                setSelectedPlanId(value);
                setSelectedTierId(null);
                setAmount("");
              }}
              onBack={() => setCurrentStep(0)}
              onContinue={() => setCurrentStep(2)}
              canContinue={Boolean(effectiveSelectedPlanId)}
            />
          ) : null}

          {effectiveStep === 2 && selectedPlan ? (
            <InvestmentTierStep
              plan={selectedPlan}
              tiers={selectedPlan.tiers}
              selectedTierId={selectedTierId}
              onSelect={(value) => {
                setSelectedTierId(value);
                setAmount("");
              }}
              onBack={() => setCurrentStep(1)}
              onContinue={() => setCurrentStep(3)}
              canContinue={Boolean(effectiveSelectedTierId)}
            />
          ) : null}

          {effectiveStep === 3 && selectedPlan && selectedTier ? (
            <InvestmentAmountStep
              plan={selectedPlan}
              tier={selectedTier}
              amount={amount}
              amountError={amountError}
              serverAmountError={actionState.fieldErrors?.amount}
              onAmountChange={setAmount}
              onBack={() => setCurrentStep(2)}
              onContinue={() => setCurrentStep(4)}
              canContinue={!amountError}
            />
          ) : null}

          {effectiveStep === 4 &&
          selectedPlan &&
          selectedInvestment &&
          selectedTier ? (
            <InvestmentReviewStep
              investmentId={selectedInvestment.id}
              investmentName={selectedInvestment.name}
              plan={selectedPlan}
              tier={selectedTier}
              investmentTypeLabel={selectedInvestment.typeLabel}
              amount={amount}
              formAction={formAction}
              actionState={actionState}
              onBack={() => setCurrentStep(3)}
            />
          ) : null}
        </section>
      </div>

      <div className="space-y-6">
        <section className="glass-strong rounded-[2rem] p-6">
          <h2 className="text-lg font-semibold text-white">Order guidance</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Here&apos;s a few things to keep in mind when creating an order.
          </p>

          <div className="mt-5 space-y-3">
            {guidanceItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4 w-4 text-blue-300" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">{item.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {selectedPlan ? (
          <section className="card-premium rounded-[2rem] p-6">
            <h2 className="text-lg font-semibold text-white">Order details</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              This summary updates as you make your selections. Review the plan
              details and selected tier requirements before proceeding to
              payment review.
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  Plan
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {selectedPlan.name}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Tier options
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {selectedPlan.tiersCountLabel}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Available range
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {selectedPlan.tierRangeLabel ??
                      `Quoted in ${selectedPlan.currency}`}
                  </p>
                </div>
              </div>

              {selectedTier ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Selected tier
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {selectedTier.levelLabel} |{" "}
                    {selectedTier.roiPercent.toFixed(2)}% ROI
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        ) : (
          <section className="card-premium rounded-[2rem] p-6">
            <h2 className="text-lg font-semibold text-white">Plan summary</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Once you select a plan, {siteName} will surface its tier structure
              and product profile here for a calmer review flow.
            </p>

            <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400">
              Select an investment and plan to populate this summary.
            </div>
          </section>
        )}

        {createdOrderId ? (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedInvestmentId(null);
                setSelectedPlanId(null);
                setSelectedTierId(null);
                setAmount("");
                setCurrentStep(0);
              }}
              className="btn-secondary rounded-xl px-5 py-3 text-sm font-medium"
            >
              Start another order
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
