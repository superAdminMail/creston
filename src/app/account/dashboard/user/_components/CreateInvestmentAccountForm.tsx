"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
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
  FieldDescription,
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

      const result = await createInvestmentAccount({ status: "idle" }, formData);

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
      router.push(`/account/dashboard/user/investment-accounts/${result.accountId}`);
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-6 text-white/[0.8]"
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="investmentPlanId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>Select investment plan</FieldLabel>

              <FieldContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {plans.map((plan) => {
                    const isSelected = field.value === plan.id;
                    const minAmount = plan.tiers.length
                      ? Math.min(...plan.tiers.map((tier) => tier.minAmount))
                      : null;
                    const maxAmount = plan.tiers.length
                      ? Math.max(...plan.tiers.map((tier) => tier.maxAmount))
                      : null;
                    const avgRoi = plan.tiers.length
                      ? plan.tiers.reduce((sum, tier) => sum + tier.roiPercent, 0) /
                        plan.tiers.length
                      : null;

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => field.onChange(plan.id)}
                        className={cn(
                          "relative rounded-2xl border p-4 text-left transition-all duration-200",
                          "hover:border-white/30 hover:bg-white/5 active:scale-[0.98]",
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--primary)]/10"
                            : "border-white/10",
                        )}
                      >
                        {isSelected && (
                          <div className="absolute right-3 top-3">
                            <Check className="h-4 w-4 text-[var(--primary)]" />
                          </div>
                        )}

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold">{plan.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {plan.investmentName} - {plan.investmentTypeLabel}
                            </p>
                          </div>

                          <p className="text-xs leading-5 text-slate-400">
                            {plan.description}
                          </p>

                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full border border-white/10 px-2 py-1">
                              {plan.investmentModelLabel}
                            </span>
                            <span className="rounded-full border border-white/10 px-2 py-1">
                              {plan.periodLabel}
                            </span>
                            {avgRoi !== null && (
                              <span className="rounded-full border border-white/10 px-2 py-1">
                                {avgRoi.toFixed(1)}% ROI
                              </span>
                            )}
                          </div>

                          {minAmount !== null && maxAmount !== null && (
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(minAmount, plan.currency)} -{" "}
                              {formatCurrency(maxAmount, plan.currency)}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <FieldDescription>
                  Creating an account keeps the selected plan, product, and model aligned with the current investment schema.
                </FieldDescription>

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending} className="btn-primary rounded-xl">
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </Button>
      </div>
    </form>
  );
}
