"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock3,
  Layers3,
  Loader2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { createInvestmentAccount } from "@/actions/investment-account/createInvestmentAccount";
import { formatCurrency } from "@/lib/formatters/formatters";
import {
  createInvestmentAccountSchema,
  type CreateInvestmentAccountInput,
} from "@/lib/zodValidations/investment-account";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

type Plan = {
  id: string;
  name: string;
  description: string;
  investmentModelLabel: string;
  periodLabel: string;
  currency: string;
  investmentName: string;
  investmentTypeLabel: string;
  tiers: {
    roiPercent: number;
    minAmount: number;
    maxAmount: number;
  }[];
};

const SURFACE =
  "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900";

function PlanDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-white/5 dark:text-slate-400">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">
          {value}
        </p>
      </div>
    </div>
  );
}

export function CreateInvestmentAccountForm({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateInvestmentAccountInput>({
    resolver: zodResolver(createInvestmentAccountSchema),
    defaultValues: {
      investmentPlanId: "",
    },
  });

  const { setError, clearErrors } = form;

  const handleSubmit = (values: CreateInvestmentAccountInput) => {
    startTransition(async () => {
      clearErrors();

      const formData = new FormData();
      formData.append("investmentPlanId", values.investmentPlanId);

      const result = await createInvestmentAccount(
        { status: "idle" },
        formData,
      );

      if (result.status === "error") {
        const fieldError = result.fieldErrors?.investmentPlanId?.[0];

        if (fieldError) {
          setError("investmentPlanId", {
            type: "server",
            message: fieldError,
          });
        }

        toast.error(result.message);
        return;
      }

      toast.success("Investment account created.");

      router.push(
        `/account/dashboard/user/investment-accounts/${result.accountId}`,
      );
    });
  };

  if (plans.length === 0) {
    return (
      <div className={cn(SURFACE, "overflow-hidden")}>
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400">
            <Layers3 className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">
            No investment plans available
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
            There are currently no active investment plans to select. Please
            check back later.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-6 rounded-xl"
            onClick={() => router.push("/account/dashboard/user")}
          >
            Return to dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <FieldGroup>
        <Controller
          control={form.control}
          name="investmentPlanId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <FieldLabel className="text-base font-semibold text-slate-950 dark:text-white">
                    Select an investment plan
                  </FieldLabel>

                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Compare the available plans and select the one you want to
                    use for this account.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  {plans.length} {plans.length === 1 ? "plan" : "plans"}{" "}
                  available
                </span>
              </div>

              <FieldContent>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {plans.map((plan) => {
                    const isSelected = field.value === plan.id;

                    const minAmount = plan.tiers.length
                      ? Math.min(...plan.tiers.map((tier) => tier.minAmount))
                      : null;

                    const maxAmount = plan.tiers.length
                      ? Math.max(...plan.tiers.map((tier) => tier.maxAmount))
                      : null;

                    const avgRoi = plan.tiers.length
                      ? plan.tiers.reduce(
                          (sum, tier) => sum + tier.roiPercent,
                          0,
                        ) / plan.tiers.length
                      : null;

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => field.onChange(plan.id)}
                        className={cn(
                          "group relative flex h-full flex-col rounded-2xl border p-5 text-left outline-none transition-all duration-200",
                          "focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950",
                          isSelected
                            ? "border-sky-500 bg-sky-50/60 shadow-md shadow-sky-950/5 dark:border-sky-400 dark:bg-sky-500/10"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900 dark:hover:border-white/20",
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wider text-sky-800 dark:text-sky-400">
                              {plan.investmentTypeLabel}
                            </p>

                            <h3 className="mt-2 text-base font-semibold text-slate-950 dark:text-white">
                              {plan.name}
                            </h3>

                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                              {plan.investmentName}
                            </p>
                          </div>

                          <div
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors",
                              isSelected
                                ? "border-sky-600 bg-sky-600 text-white dark:border-sky-400 dark:bg-sky-400 dark:text-slate-950"
                                : "border-slate-300 text-transparent dark:border-white/20",
                            )}
                          >
                            <Check className="h-4 w-4" />
                          </div>
                        </div>

                        <p className="mt-4 min-h-10 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {plan.description}
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 dark:border-white/10">
                          <PlanDetail
                            icon={Layers3}
                            label="Investment model"
                            value={plan.investmentModelLabel}
                          />

                          <PlanDetail
                            icon={Clock3}
                            label="Plan period"
                            value={plan.periodLabel}
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          {avgRoi !== null && (
                            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                <TrendingUp className="h-3.5 w-3.5" />
                                ROI indicator
                              </div>

                              <p className="mt-1 text-lg font-semibold tabular-nums text-slate-950 dark:text-white">
                                {avgRoi.toFixed(1)}%
                              </p>
                            </div>
                          )}

                          {minAmount !== null && maxAmount !== null && (
                            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                <Wallet className="h-3.5 w-3.5" />
                                Investment range
                              </div>

                              <p className="mt-1 text-sm font-semibold leading-6 text-slate-950 dark:text-white">
                                {formatCurrency(minAmount, plan.currency)}
                                {" – "}
                                {formatCurrency(maxAmount, plan.currency)}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/10">
                          <span
                            className={cn(
                              "text-xs font-medium",
                              isSelected
                                ? "text-sky-800 dark:text-sky-400"
                                : "text-slate-500 dark:text-slate-400",
                            )}
                          >
                            {isSelected ? "Selected plan" : "Select this plan"}
                          </span>

                          {isSelected ? (
                            <BadgeCheck className="h-5 w-5 text-sky-700 dark:text-sky-400" />
                          ) : (
                            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  The available investment range and ROI indicator are
                  calculated from the active tiers associated with each plan.
                </p>

                {fieldState.error && (
                  <div className="mt-3">
                    <FieldError errors={[fieldState.error]} />
                  </div>
                )}
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-sky-100 p-2 text-sky-800 dark:bg-sky-500/10 dark:text-sky-400">
            <BadgeCheck className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Ready to create your account?
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
              Your selected plan will be linked to the new investment account.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || !form.watch("investmentPlanId")}
          className="btn-primary w-full rounded-xl sm:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
