"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
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
  tone: string;
}> = [
  {
    value: "PENDING",
    title: "Pending",
    description: "Account exists but should not be treated as active yet.",
    tone: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  },
  {
    value: "ACTIVE",
    title: "Active",
    description: "Account is live and available for normal servicing activity.",
    tone: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  },
  {
    value: "FROZEN",
    title: "Frozen",
    description: "Account remains on file but should be restricted temporarily.",
    tone: "border-slate-300/20 bg-slate-400/10 text-slate-200",
  },
  {
    value: "CLOSED",
    title: "Closed",
    description: "Account is no longer active and will record a closed date.",
    tone: "border-rose-400/20 bg-rose-400/10 text-rose-200",
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

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="accountId" value={accountId} />
      <input type="hidden" name="status" value={selectedStatus} />

      <FieldGroup>
        <Controller
          control={form.control}
          name="status"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>Account status</FieldLabel>
              <FieldContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {statusOptions.map((option) => {
                    const isSelected = field.value === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        disabled={isPending}
                        className={cn(
                          "relative rounded-2xl border p-4 text-left transition-all duration-200",
                          "hover:border-white/30 hover:bg-white/5 active:scale-[0.98] disabled:opacity-60",
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--primary)]/10"
                            : "border-white/10",
                        )}
                      >
                        {isSelected ? (
                          <div className="absolute right-3 top-3">
                            <Check className="h-4 w-4 text-[var(--primary)]" />
                          </div>
                        ) : null}

                        <div className="space-y-3">
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                              option.tone,
                            )}
                          >
                            {option.title}
                          </span>
                          <p className="text-sm leading-6 text-slate-300">
                            {option.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <FieldDescription>
                  Status changes now follow the current account lifecycle rules
                  in the updated schema.
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

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending} className="btn-primary rounded-xl">
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating...
            </span>
          ) : (
            "Update account"
          )}
        </Button>
      </div>
    </form>
  );
}
