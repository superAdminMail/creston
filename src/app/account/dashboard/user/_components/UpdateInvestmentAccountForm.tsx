"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  CircleDot,
  Clock3,
  LockKeyhole,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import {
  updateInvestmentAccount,
  type UpdateInvestmentAccountState,
} from "@/actions/investment-account/updateInvestmentAccount";
import { createInitialFormState } from "@/lib/forms/actionState";
import {
  updateInvestmentAccountSchema,
  type UpdateInvestmentAccountInput,
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

const statusOptions: Array<{
  value: UpdateInvestmentAccountInput["status"];
  title: string;
  description: string;
  icon: typeof CheckCircle2;
  tone: string;
  selectedTone: string;
}> = [
  {
    value: "PENDING",
    title: "Pending",
    description: "The account exists but should not be treated as active yet.",
    icon: Clock3,
    tone: "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-400/10",
    selectedTone:
      "border-amber-400 bg-amber-50/70 dark:border-amber-400/50 dark:bg-amber-400/[0.08]",
  },
  {
    value: "ACTIVE",
    title: "Active",
    description:
      "The account is live and available for normal servicing activity.",
    icon: CheckCircle2,
    tone: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-400/10",
    selectedTone:
      "border-emerald-400 bg-emerald-50/70 dark:border-emerald-400/50 dark:bg-emerald-400/[0.08]",
  },
  {
    value: "FROZEN",
    title: "Frozen",
    description:
      "The account remains on file but should be restricted temporarily.",
    icon: LockKeyhole,
    tone: "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-white/[0.06]",
    selectedTone:
      "border-slate-400 bg-slate-100/70 dark:border-slate-400/50 dark:bg-white/[0.06]",
  },
  {
    value: "CLOSED",
    title: "Closed",
    description:
      "The account is no longer active and will record a closed date.",
    icon: AlertCircle,
    tone: "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-400/10",
    selectedTone:
      "border-rose-400 bg-rose-50/70 dark:border-rose-400/50 dark:bg-rose-400/[0.08]",
  },
];

const initialInvestmentAccountFormState: UpdateInvestmentAccountState =
  createInitialFormState<"status">();

export function UpdateInvestmentAccountForm({
  accountId,
  currentStatus,
}: {
  accountId: string;
  currentStatus: UpdateInvestmentAccountInput["status"];
}) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<
    UpdateInvestmentAccountState,
    FormData
  >(updateInvestmentAccount, initialInvestmentAccountFormState);

  const form = useForm<UpdateInvestmentAccountInput>({
    resolver: zodResolver(updateInvestmentAccountSchema),
    defaultValues: {
      status: currentStatus,
    },
  });

  const selectedStatus = useWatch({
    control: form.control,
    name: "status",
  });

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Account updated.");
      router.refresh();
      return;
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [router, state]);

  const hasChanges = selectedStatus !== currentStatus;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="accountId" value={accountId} />
      <input type="hidden" name="status" value={selectedStatus} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-400">
            <ShieldCheck className="h-4 w-4" />
            Lifecycle controls
          </div>

          <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
            Account status
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Select the status that should apply to this investment account.
          </p>
        </div>

        <FieldGroup className="mt-6">
          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel className="sr-only">
                  Select account status
                </FieldLabel>

                <FieldContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {statusOptions.map((option) => {
                      const isSelected = field.value === option.value;
                      const Icon = option.icon;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => field.onChange(option.value)}
                          disabled={isPending}
                          className={cn(
                            "group relative rounded-2xl border p-4 text-left outline-none transition-all duration-200",
                            "focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950",
                            "disabled:cursor-not-allowed disabled:opacity-60",
                            isSelected
                              ? option.selectedTone
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20 dark:hover:bg-white/[0.04]",
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-xl",
                                option.tone,
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>

                            <div
                              className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
                                isSelected
                                  ? "border-sky-600 bg-sky-600 text-white dark:border-sky-400 dark:bg-sky-400 dark:text-slate-950"
                                  : "border-slate-300 text-transparent dark:border-white/20",
                              )}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">
                              {option.title}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                              {option.description}
                            </p>
                          </div>

                          {isSelected && (
                            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-800 dark:text-sky-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Selected status
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <FieldDescription className="mt-4 text-slate-500 dark:text-slate-400">
                    Status changes follow the current account lifecycle rules.
                  </FieldDescription>

                  {fieldState.error ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldError>{state.fieldErrors?.status?.[0]}</FieldError>
                  )}
                </FieldContent>
              </Field>
            )}
          />
        </FieldGroup>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {hasChanges
                  ? "Status change pending"
                  : "Current status retained"}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                {hasChanges
                  ? `The account will change from ${currentStatus.toLowerCase()} to ${selectedStatus.toLowerCase()} when you submit this update.`
                  : "No status changes have been selected. Choose a different status to make an update."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review your selection before submitting.
          </p>

          <Button
            type="submit"
            disabled={isPending || !hasChanges}
            className="btn-primary w-full rounded-xl sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating account...
              </>
            ) : (
              <>
                Update account
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </section>
    </form>
  );
}
