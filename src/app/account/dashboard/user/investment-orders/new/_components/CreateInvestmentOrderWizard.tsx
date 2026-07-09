"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { createInvestmentOrder } from "@/actions/investment-order/createInvestmentOrder";
import { initialCreateInvestmentOrderActionState } from "@/actions/investment-order/createInvestmentOrder.state";
import type {
  InvestmentOrderCreationOptionsData,
  InvestmentOrderCreationPlanOption,
  InvestmentOrderCreationTierOption,
} from "@/actions/investment-order/getInvestmentOrderCreationOptions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters/formatters";
import { parseInvestmentOrderAmount } from "@/lib/zodValidations/investment-order";
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
  const wizardRootRef = useRef<HTMLDivElement>(null);
  const [actionState, formAction] = useActionState(
    createInvestmentOrder,
    initialCreateInvestmentOrderActionState,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const firstInvestmentId = options.investments[0]?.id ?? null;
  const firstInvestment = options.investments[0] ?? null;
  const firstPlan = firstInvestment?.plans[0] ?? null;
  const firstTier = firstPlan?.tiers[0] ?? null;
  const hasReachedActiveUnpaidOrderLimit =
    options.activeUnpaidOrdersCount >= 3;

  const [selectedInvestmentId, setSelectedInvestmentId] = useState<
    string | null
  >(firstInvestmentId);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    firstPlan?.id ?? null,
  );
  const [selectedTierId, setSelectedTierId] = useState<string | null>(
    firstTier?.id ?? null,
  );
  const [amount, setAmount] = useState(
    firstTier ? firstTier.minAmount.toFixed(2) : "",
  );
  const effectiveSelectedInvestmentId = options.investments.some(
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
    () =>
      matchingPlans.find((plan) => plan.id === effectiveSelectedPlanId) ?? null,
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

  useEffect(() => {
    wizardRootRef.current?.scrollIntoView({
      block: "start",
      behavior: "auto",
    });
  }, [effectiveStep, createdOrderId]);

  if (options.totalActivePlans === 0) {
    return (
      <CreateInvestmentOrderEmptyState
        hasInvestorProfile
        canCreateInvestmentOrder={options.canCreateInvestmentOrder}
        kycStatus={options.kycStatus}
        siteName={siteName}
      />
    );
  }

  const progressValue = ((effectiveStep + 1) / stepTitles.length) * 100;
  const canAdvance = !hasReachedActiveUnpaidOrderLimit;

  return (
    <section
      ref={wizardRootRef}
      className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)]"
    >
      <div className="space-y-6">
        {hasReachedActiveUnpaidOrderLimit ? (
          <Alert className="rounded-[1.75rem] border border-amber-200/70 bg-amber-50/90 text-amber-950 shadow-sm dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
            <AlertTitle>Order limit reached</AlertTitle>
            <AlertDescription className="text-amber-900/80 dark:text-amber-100/85">
              You already have {options.activeUnpaidOrdersCount} active unpaid
              orders. Please complete or cancel an existing order before
              creating a new one.
            </AlertDescription>
          </Alert>
        ) : null}

        {createdOrderId ? (
          <div className="rounded-[1.75rem] border border-emerald-200/70 bg-emerald-50/90 p-5 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-500/10">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-emerald-950 dark:text-white">
                  Order created successfully
                </p>
                <p className="mt-1 text-sm leading-6 text-emerald-900/80 dark:text-emerald-100/85">
                  Reference{" "}
                  <span className="font-medium text-emerald-950 dark:text-white">
                    {createdOrderId}
                  </span>{" "}
                  is now pending payment. You can create another order below if
                  needed.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-white/75 p-5 shadow-sm sm:p-6 lg:p-8 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Order progress
                </p>
                <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                  Step {effectiveStep + 1} of {stepTitles.length}:{" "}
                  {stepTitles[effectiveStep]}
                </p>
              </div>

              <span className="rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
                {Math.round(progressValue)}%
              </span>
            </div>
            <Progress
              value={progressValue}
              className="h-2 rounded-full bg-white/10"
            />
          </div>

          <div className="space-y-6">
            {effectiveStep === 0 ? (
              <InvestmentTypeStep
                options={options.investments}
                selectedInvestmentId={selectedInvestmentId}
                onSelect={(value) => {
                  const selectedInvestment =
                    options.investments.find(
                      (investment) => investment.id === value,
                    ) ?? null;
                  const nextPlan = selectedInvestment?.plans[0] ?? null;
                  const nextTier = nextPlan?.tiers[0] ?? null;

                  setSelectedInvestmentId(value);
                  setSelectedPlanId(nextPlan?.id ?? null);
                  setSelectedTierId(nextTier?.id ?? null);
                  setAmount(nextTier ? nextTier.minAmount.toFixed(2) : "");
                }}
                onContinue={() => setCurrentStep(1)}
                canContinue={
                  Boolean(effectiveSelectedInvestmentId) && canAdvance
                }
                featuredInvestment={featuredInvestment}
                siteName={siteName}
              />
            ) : null}

            {effectiveStep === 1 ? (
              <InvestmentPlanStep
                plans={matchingPlans}
                selectedPlanId={selectedPlanId}
                onSelect={(value) => {
                  const nextPlan =
                    matchingPlans.find((plan) => plan.id === value) ?? null;
                  const nextTier = nextPlan?.tiers[0] ?? null;

                  setSelectedPlanId(value);
                  setSelectedTierId(nextTier?.id ?? null);
                  setAmount(nextTier ? nextTier.minAmount.toFixed(2) : "");
                }}
                onBack={() => setCurrentStep(0)}
                onContinue={() => setCurrentStep(2)}
                canContinue={Boolean(effectiveSelectedPlanId) && canAdvance}
              />
            ) : null}

            {effectiveStep === 2 && selectedPlan ? (
              <InvestmentTierStep
                plan={selectedPlan}
                tiers={selectedPlan.tiers}
                selectedTierId={selectedTierId}
                onSelect={(value) => {
                  setSelectedTierId(value);
                  const nextTier =
                    selectedPlan.tiers.find((tier) => tier.id === value) ??
                    null;

                  setAmount(nextTier ? nextTier.minAmount.toFixed(2) : "");
                }}
                onBack={() => setCurrentStep(1)}
                onContinue={() => setCurrentStep(3)}
                canContinue={Boolean(effectiveSelectedTierId) && canAdvance}
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
                canContinue={!amountError && canAdvance}
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
                canSubmit={canAdvance}
              />
            ) : null}
          </div>
        </section>
      </div>

      <div className="space-y-6">
        {createdOrderId ? (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedInvestmentId(firstInvestmentId);
                setSelectedPlanId(firstPlan?.id ?? null);
                setSelectedTierId(firstTier?.id ?? null);
                setAmount(firstTier ? firstTier.minAmount.toFixed(2) : "");
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
