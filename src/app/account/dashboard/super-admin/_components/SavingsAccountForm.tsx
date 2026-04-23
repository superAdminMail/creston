"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import type { SavingsStatus } from "@/generated/prisma";
import type { UpdateSuperAdminSavingsAccountState } from "@/actions/super-admin/savings-accounts/updateSuperAdminSavingsAccount";
import { createInitialFormState } from "@/lib/forms/actionState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type SavingsAccountFormValues = {
  name: string;
  description: string;
  targetAmount: string;
  status: SavingsStatus;
  isLocked: boolean;
  lockedUntil: string;
};

type SavingsAccountFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  cancelHref?: string;
  defaultValues: SavingsAccountFormValues;
  formAction: (
    state: UpdateSuperAdminSavingsAccountState,
    formData: FormData,
  ) => Promise<UpdateSuperAdminSavingsAccountState>;
};

const initialSavingsAccountFormState: UpdateSuperAdminSavingsAccountState =
  createInitialFormState<
    "name" | "description" | "targetAmount" | "status" | "isLocked" | "lockedUntil"
  >() as UpdateSuperAdminSavingsAccountState;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="btn-primary rounded-xl px-5"
    >
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function SavingsAccountForm({
  title,
  description,
  submitLabel,
  cancelHref,
  defaultValues,
  formAction,
}: SavingsAccountFormProps) {
  const router = useRouter();
  const [state, action] = useActionState(
    formAction,
    initialSavingsAccountFormState,
  );

  useEffect(() => {
    if (state.status !== "error" || !state.message) {
      return;
    }

    toast.error(state.message);
  }, [state.message, state.status]);

  useEffect(() => {
    if (state.status !== "success" || !state.message || !state.redirectHref) {
      return;
    }

    toast.success(state.message);

    const timeout = window.setTimeout(() => {
      router.replace(
        state.redirectHref ??
          cancelHref ??
          "/account/dashboard/super-admin/savings-accounts",
      );
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [cancelHref, router, state.message, state.redirectHref, state.status]);

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
                <CardTitle className="text-lg">Account information</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-slate-100">Name</FieldLabel>
                    <FieldContent>
                      <Input
                        name="name"
                        defaultValue={defaultValues.name}
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
                        className="input-premium min-h-[110px] w-full rounded-xl px-3 py-3"
                      />
                      <FieldError>{state.fieldErrors?.description?.[0]}</FieldError>
                    </FieldContent>
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field>
                      <FieldLabel className="text-slate-100">
                        Target amount
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="targetAmount"
                          defaultValue={defaultValues.targetAmount}
                          placeholder="5000"
                          className="input-premium h-11 rounded-xl"
                        />
                        <FieldError>{state.fieldErrors?.targetAmount?.[0]}</FieldError>
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel className="text-slate-100">
                        Locked until
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="lockedUntil"
                          type="datetime-local"
                          defaultValue={defaultValues.lockedUntil}
                          className="input-premium h-11 rounded-xl"
                        />
                        <FieldError>{state.fieldErrors?.lockedUntil?.[0]}</FieldError>
                      </FieldContent>
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[1.75rem] border-white/8 bg-white/[0.03] text-white shadow-[0_18px_50px_rgba(2,6,23,0.14)]">
              <CardHeader>
                <CardTitle className="text-lg">Lifecycle</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel className="text-slate-100">Status</FieldLabel>
                    <FieldContent>
                      <select
                        name="status"
                        defaultValue={defaultValues.status}
                        className="input-premium h-11 w-full rounded-xl px-3 py-2"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="PAUSED">Paused</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                      <FieldError>{state.fieldErrors?.status?.[0]}</FieldError>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel className="text-slate-100">Locked</FieldLabel>
                    <FieldContent>
                      <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          name="isLocked"
                          value="true"
                          defaultChecked={defaultValues.isLocked}
                        />
                        Restrict withdrawals and transfers
                      </label>
                      <FieldError>{state.fieldErrors?.isLocked?.[0]}</FieldError>
                    </FieldContent>
                  </Field>
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
