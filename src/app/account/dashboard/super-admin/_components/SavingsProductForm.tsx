"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import type { SavingsInterestFrequency } from "@/generated/prisma";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SavingsProductFormState } from "@/actions/super-admin/savings-products/savingsProductForm.state";
import { initialSavingsProductFormState } from "@/actions/super-admin/savings-products/savingsProductForm.state";

type SavingsProductFormValues = {
  name: string;
  description: string;
  interestEnabled: boolean;
  interestRatePercent: string;
  interestPayoutFrequency: SavingsInterestFrequency | "";
  isLockable: boolean;
  minimumLockDays: string;
  maximumLockDays: string;
  allowsWithdrawals: boolean;
  allowsDeposits: boolean;
  minBalance: string;
  maxBalance: string;
  currency: string;
  isActive: boolean;
  sortOrder: string;
};

type SavingsProductFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  cancelHref?: string;
  defaultValues: SavingsProductFormValues;
  formAction: (
    state: SavingsProductFormState,
    formData: FormData,
  ) => Promise<SavingsProductFormState>;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="btn-primary rounded-xl px-5" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

export function SavingsProductForm({
  title,
  description,
  submitLabel,
  cancelHref,
  defaultValues,
  formAction,
}: SavingsProductFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, action] = useActionState(
    formAction,
    initialSavingsProductFormState,
  );

  useEffect(() => {
    if (state.status !== "error" || !state.message) {
      return;
    }

    toast.error(state.message, {
      id: `super-admin-savings-product-form-error:${pathname}`,
    });
  }, [pathname, state.message, state.status]);

  useEffect(() => {
    if (state.status !== "success" || !state.message || !state.redirectHref) {
      return;
    }

    const toastId = `super-admin-savings-product-form-success:${pathname}:${state.redirectHref}`;

    toast.success(state.message, {
      id: toastId,
    });

    const timeout = window.setTimeout(() => {
      router.replace(state.redirectHref ?? pathname);
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [pathname, router, state.message, state.redirectHref, state.status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            {description}
          </p>
        </div>

        {cancelHref ? (
          <Link
            href={cancelHref}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-slate-200 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
          >
            Cancel
          </Link>
        ) : null}
      </div>

      {state.status === "error" && state.message ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {state.message}
        </div>
      ) : null}

      <form action={action} className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <Card className="rounded-[1.75rem] border-white/8 bg-white/[0.03] text-white shadow-[0_18px_50px_rgba(2,6,23,0.14)]">
              <CardHeader>
                <CardTitle className="text-lg">Product information</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-slate-100">Name</FieldLabel>
                    <FieldContent>
                      <Input
                        name="name"
                        defaultValue={defaultValues.name}
                        placeholder="Standard Savings Account"
                        className="input-premium h-11 rounded-xl"
                      />
                      <FieldError>{state.fieldErrors?.name?.[0]}</FieldError>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel className="text-slate-100">Description</FieldLabel>
                    <FieldContent>
                      <textarea
                        name="description"
                        defaultValue={defaultValues.description}
                        className="input-premium min-h-[100px] w-full rounded-xl px-3 py-3"
                        placeholder="Short description..."
                      />
                      <FieldError>
                        {state.fieldErrors?.description?.[0]}
                      </FieldError>
                    </FieldContent>
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field>
                      <FieldLabel className="text-slate-100">
                        Currency
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="currency"
                          defaultValue={defaultValues.currency}
                          className="input-premium h-11 rounded-xl"
                        />
                        <FieldError>{state.fieldErrors?.currency?.[0]}</FieldError>
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel className="text-slate-100">
                        Sort order
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="sortOrder"
                          defaultValue={defaultValues.sortOrder}
                          placeholder="0"
                          className="input-premium h-11 rounded-xl"
                        />
                        <FieldError>{state.fieldErrors?.sortOrder?.[0]}</FieldError>
                      </FieldContent>
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem] border-white/8 bg-white/[0.03] text-white shadow-[0_18px_50px_rgba(2,6,23,0.14)]">
              <CardHeader>
                <CardTitle className="text-lg">Balance rules</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field>
                      <FieldLabel className="text-slate-100">
                        Minimum balance
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="minBalance"
                          defaultValue={defaultValues.minBalance}
                          placeholder="0"
                          className="input-premium h-11 rounded-xl"
                        />
                        <FieldError>{state.fieldErrors?.minBalance?.[0]}</FieldError>
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel className="text-slate-100">
                        Maximum balance
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="maxBalance"
                          defaultValue={defaultValues.maxBalance}
                          placeholder="100000"
                          className="input-premium h-11 rounded-xl"
                        />
                        <FieldError>{state.fieldErrors?.maxBalance?.[0]}</FieldError>
                      </FieldContent>
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem] border-white/8 bg-white/[0.03] text-white shadow-[0_18px_50px_rgba(2,6,23,0.14)]">
              <CardHeader>
                <CardTitle className="text-lg">Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel className="text-slate-100">
                      Allows deposits
                    </FieldLabel>
                    <FieldContent>
                      <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          name="allowsDeposits"
                          value="true"
                          defaultChecked={defaultValues.allowsDeposits}
                        />
                        Enable deposits
                      </label>
                      <FieldError>
                        {state.fieldErrors?.allowsDeposits?.[0]}
                      </FieldError>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel className="text-slate-100">
                      Allows withdrawals
                    </FieldLabel>
                    <FieldContent>
                      <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          name="allowsWithdrawals"
                          value="true"
                          defaultChecked={defaultValues.allowsWithdrawals}
                        />
                        Enable withdrawals
                      </label>
                      <FieldError>
                        {state.fieldErrors?.allowsWithdrawals?.[0]}
                      </FieldError>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel className="text-slate-100">
                      Active status
                    </FieldLabel>
                    <FieldContent>
                      <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          name="isActive"
                          value="true"
                          defaultChecked={defaultValues.isActive}
                        />
                        Product is active
                      </label>
                      <FieldError>{state.fieldErrors?.isActive?.[0]}</FieldError>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[1.75rem] border-white/8 bg-white/[0.03] text-white shadow-[0_18px_50px_rgba(2,6,23,0.14)]">
              <CardHeader>
                <CardTitle className="text-lg">Interest settings</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-slate-100">
                      Enable interest
                    </FieldLabel>
                    <FieldContent>
                      <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          name="interestEnabled"
                          value="true"
                          defaultChecked={defaultValues.interestEnabled}
                        />
                        Interest accrues on this product
                      </label>
                      <FieldError>
                        {state.fieldErrors?.interestEnabled?.[0]}
                      </FieldError>
                    </FieldContent>
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field>
                      <FieldLabel className="text-slate-100">
                        Interest rate (%)
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="interestRatePercent"
                          defaultValue={defaultValues.interestRatePercent}
                          placeholder="5"
                          className="input-premium h-11 rounded-xl"
                        />
                        <FieldError>
                          {state.fieldErrors?.interestRatePercent?.[0]}
                        </FieldError>
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel className="text-slate-100">
                        Payout frequency
                      </FieldLabel>
                      <FieldContent>
                        <select
                          name="interestPayoutFrequency"
                          defaultValue={defaultValues.interestPayoutFrequency}
                          className="input-premium h-11 w-full rounded-xl px-3 py-2"
                        >
                          <option value="">Select frequency</option>
                          <option value="DAILY">Daily</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="MONTHLY">Monthly</option>
                        </select>
                        <FieldError>
                          {state.fieldErrors?.interestPayoutFrequency?.[0]}
                        </FieldError>
                      </FieldContent>
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem] border-white/8 bg-white/[0.03] text-white shadow-[0_18px_50px_rgba(2,6,23,0.14)]">
              <CardHeader>
                <CardTitle className="text-lg">Lock settings</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-slate-100">Lockable</FieldLabel>
                    <FieldContent>
                      <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          name="isLockable"
                          value="true"
                          defaultChecked={defaultValues.isLockable}
                        />
                        Allow time-based locking
                      </label>
                      <FieldError>{state.fieldErrors?.isLockable?.[0]}</FieldError>
                    </FieldContent>
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field>
                      <FieldLabel className="text-slate-100">
                        Minimum lock days
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="minimumLockDays"
                          defaultValue={defaultValues.minimumLockDays}
                          placeholder="7"
                          className="input-premium h-11 rounded-xl"
                        />
                        <FieldError>
                          {state.fieldErrors?.minimumLockDays?.[0]}
                        </FieldError>
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel className="text-slate-100">
                        Maximum lock days
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="maximumLockDays"
                          defaultValue={defaultValues.maximumLockDays}
                          placeholder="90"
                          className="input-premium h-11 rounded-xl"
                        />
                        <FieldError>
                          {state.fieldErrors?.maximumLockDays?.[0]}
                        </FieldError>
                      </FieldContent>
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center justify-end gap-3">
              {cancelHref ? (
                <Link
                  href={cancelHref}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-slate-200 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                >
                  Cancel
                </Link>
              ) : null}
              <SubmitButton label={submitLabel} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
