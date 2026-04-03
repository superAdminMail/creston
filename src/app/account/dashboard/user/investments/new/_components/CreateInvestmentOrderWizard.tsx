"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, Landmark, ShieldCheck, Wallet } from "lucide-react";

import { createInvestmentOrder } from "@/actions/investment-order/createInvestmentOrder";
import { initialCreateInvestmentOrderActionState } from "@/actions/investment-order/createInvestmentOrder.state";
import type {
  InvestmentOrderCreationOptionsData,
  InvestmentOrderCreationPlanOption,
} from "@/actions/investment-order/getInvestmentOrderCreationOptions";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters/formatters";
import { parseInvestmentOrderAmount } from "@/lib/zodValidations/investment-order";
import { cn } from "@/lib/utils";
import { CreateInvestmentOrderEmptyState } from "./CreateInvestmentOrderEmptyState";
import { InvestmentAmountStep } from "./InvestmentAmountStep";
import { InvestmentPlanStep } from "./InvestmentPlanStep";
import { InvestmentReviewStep } from "./InvestmentReviewStep";
import { InvestmentTypeStep } from "./InvestmentTypeStep";
import { PlanCategoryStep } from "./PlanCategoryStep";

const stepTitles = [
  "Investment Type",
  "Plan Category",
  "Investment Plan",
  "Amount",
  "Review",
] as const;

type CreateInvestmentOrderWizardProps = {
  options: InvestmentOrderCreationOptionsData;
  createdOrderId?: string | null;
};

type InvestmentPlanCardOption = InvestmentOrderCreationPlanOption & {
  icon: {
    url: string;
    alt: string;
  } | null;
};

function getAmountError(
  plan: InvestmentOrderCreationPlanOption | null,
  amount: string,
) {
  if (!plan) return "Select an investment plan first.";
  if (!amount.trim()) return "Enter an investment amount.";

  const parsedAmount = parseInvestmentOrderAmount(amount);

  if (parsedAmount === null) {
    return "Enter a valid amount with up to 2 decimal places.";
  }

  if (parsedAmount < plan.minAmount || parsedAmount > plan.maxAmount) {
    return `Allowed range: ${formatCurrency(
      plan.minAmount,
      plan.currency,
    )} to ${formatCurrency(plan.maxAmount, plan.currency)}.`;
  }

  return null;
}

export function CreateInvestmentOrderWizard({
  options,
  createdOrderId,
}: CreateInvestmentOrderWizardProps) {
  const [actionState, formAction] = useActionState(
    createInvestmentOrder,
    initialCreateInvestmentOrderActionState,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  const typeOptions = useMemo(() => {
    const grouped = new Map<
      string,
      {
        type: string;
        label: string;
        investmentCount: number;
        planCount: number;
        periodLabel: string;
      }
    >();

    for (const investment of options.investments) {
      const existing = grouped.get(investment.type);

      if (existing) {
        existing.investmentCount += 1;
        existing.planCount += investment.plans.length;
        continue;
      }

      grouped.set(investment.type, {
        type: investment.type,
        label: investment.typeLabel,
        investmentCount: 1,
        planCount: investment.plans.length,
        periodLabel: investment.periodLabel,
      });
    }

    return Array.from(grouped.values());
  }, [options.investments]);

  const selectedInvestments = useMemo(
    () =>
      selectedType
        ? options.investments.filter(
            (investment) => investment.type === selectedType,
          )
        : [],
    [options.investments, selectedType],
  );

  const categoryOptions = useMemo(() => {
    const grouped = new Map<
      string,
      { category: string; label: string; planCount: number }
    >();

    for (const investment of selectedInvestments) {
      for (const plan of investment.plans) {
        const existing = grouped.get(plan.category);

        if (existing) {
          existing.planCount += 1;
          continue;
        }

        grouped.set(plan.category, {
          category: plan.category,
          label: plan.categoryLabel,
          planCount: 1,
        });
      }
    }

    return Array.from(grouped.values());
  }, [selectedInvestments]);

  const matchingPlans = useMemo<InvestmentPlanCardOption[]>(
    () =>
      selectedCategory
        ? selectedInvestments.flatMap((investment) =>
            investment.plans
              .filter((plan) => plan.category === selectedCategory)
              .map((plan) => ({
                ...plan,
                icon: investment.icon,
              })),
          )
        : [],
    [selectedCategory, selectedInvestments],
  );

  const selectedPlan = useMemo(
    () => matchingPlans.find((plan) => plan.id === selectedPlanId) ?? null,
    [matchingPlans, selectedPlanId],
  );

  const selectedTypeOption = useMemo(
    () => typeOptions.find((option) => option.type === selectedType) ?? null,
    [selectedType, typeOptions],
  );

  const featuredInvestment = useMemo(
    () => selectedInvestments[0] ?? null,
    [selectedInvestments],
  );

  const amountError = getAmountError(selectedPlan, amount);

  const effectiveStep = useMemo(() => {
    if (actionState.status !== "error" || currentStep !== 4) {
      return currentStep;
    }

    if (actionState.fieldErrors?.investmentType) return 0;
    if (actionState.fieldErrors?.planCategory) return 1;
    if (actionState.fieldErrors?.investmentPlanId) return 2;
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
      title: "Plan-led order creation",
      body: "Havenstone validates each plan server-side before your order enters payment review.",
      icon: Landmark,
    },
    {
      title: "No live account yet",
      body: "A live investment account is only created after payment and confirmation are completed.",
      icon: Wallet,
    },
  ];

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
              options={typeOptions}
              selectedType={selectedType}
              onSelect={(value) => {
                setSelectedType(value);
                setSelectedCategory(null);
                setSelectedPlanId(null);
                setAmount("");
              }}
              onContinue={() => setCurrentStep(1)}
              canContinue={Boolean(selectedType)}
              featuredInvestment={featuredInvestment}
            />
          ) : null}

          {effectiveStep === 1 ? (
            <PlanCategoryStep
              selectedInvestmentTypeLabel={
                selectedTypeOption?.label ?? "Selected investment"
              }
              options={categoryOptions}
              selectedCategory={selectedCategory}
              onSelect={(value) => {
                setSelectedCategory(value);
                setSelectedPlanId(null);
                setAmount("");
              }}
              onBack={() => setCurrentStep(0)}
              onContinue={() => setCurrentStep(2)}
              canContinue={Boolean(selectedCategory)}
            />
          ) : null}

          {effectiveStep === 2 ? (
            <InvestmentPlanStep
              plans={matchingPlans}
              selectedPlanId={selectedPlanId}
              onSelect={(value) => {
                setSelectedPlanId(value);
                setAmount("");
              }}
              onBack={() => setCurrentStep(1)}
              onContinue={() => setCurrentStep(3)}
              canContinue={Boolean(selectedPlanId)}
            />
          ) : null}

          {effectiveStep === 3 && selectedPlan ? (
            <InvestmentAmountStep
              plan={selectedPlan}
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
          selectedType &&
          selectedTypeOption ? (
            <InvestmentReviewStep
              plan={selectedPlan}
              investmentTypeValue={selectedType}
              investmentTypeLabel={selectedTypeOption.label}
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
            This flow creates an investment order only. Your live investment
            account is opened later after payment and confirmation.
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
            <h2 className="text-lg font-semibold text-white">Selected plan</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Review the range and product profile for the plan currently in
              focus.
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
                    Minimum
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {formatCurrency(
                      selectedPlan.minAmount,
                      selectedPlan.currency,
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Maximum
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {formatCurrency(
                      selectedPlan.maxAmount,
                      selectedPlan.currency,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="card-premium rounded-[2rem] p-6">
            <h2 className="text-lg font-semibold text-white">Plan summary</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Once you select a plan, Havenstone will surface its investable
              range and product profile here for a calmer review flow.
            </p>

            <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400">
              Select an investment type, plan category, and plan to populate
              this summary.
            </div>
          </section>
        )}

        {createdOrderId ? (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedType(null);
                setSelectedCategory(null);
                setSelectedPlanId(null);
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
