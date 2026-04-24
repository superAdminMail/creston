"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import type { KycStatus } from "@/generated/prisma";
import type { UpdateSuperAdminInvestorState } from "@/actions/super-admin/investors/updateSuperAdminInvestor";
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

type InvestorFormValues = {
  name: string;
  username: string;
  phoneNumber: string;
  dateOfBirth: string;
  country: string;
  state: string;
  city: string;
  addressLine1: string;
  kycStatus: KycStatus;
  isVerified: boolean;
};

type InvestorFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  cancelHref?: string;
  defaultValues: InvestorFormValues;
  formAction: (
    state: UpdateSuperAdminInvestorState,
    formData: FormData,
  ) => Promise<UpdateSuperAdminInvestorState>;
};

const initialInvestorFormState: UpdateSuperAdminInvestorState =
  createInitialFormState<
    | "name"
    | "username"
    | "phoneNumber"
    | "dateOfBirth"
    | "country"
    | "state"
    | "city"
    | "addressLine1"
    | "kycStatus"
    | "isVerified"
  >() as UpdateSuperAdminInvestorState;

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

export function InvestorForm({
  title,
  description,
  submitLabel,
  cancelHref,
  defaultValues,
  formAction,
}: InvestorFormProps) {
  const router = useRouter();
  const [state, action] = useActionState(formAction, initialInvestorFormState);

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
          "/account/dashboard/super-admin/investors",
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
                <CardTitle className="text-lg">Identity</CardTitle>
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
                    <FieldLabel className="text-slate-100">Username</FieldLabel>
                    <FieldContent>
                      <Input
                        name="username"
                        defaultValue={defaultValues.username}
                        className="input-premium h-11 rounded-xl"
                      />
                      <FieldError>
                        {state.fieldErrors?.username?.[0]}
                      </FieldError>
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel className="text-slate-100">
                      Phone number
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        name="phoneNumber"
                        defaultValue={defaultValues.phoneNumber}
                        className="input-premium h-11 rounded-xl"
                      />
                      <FieldError>
                        {state.fieldErrors?.phoneNumber?.[0]}
                      </FieldError>
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel className="text-slate-100">
                      Date of birth
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        name="dateOfBirth"
                        type="date"
                        defaultValue={defaultValues.dateOfBirth}
                        className="input-premium h-11 rounded-xl"
                      />
                      <FieldError>
                        {state.fieldErrors?.dateOfBirth?.[0]}
                      </FieldError>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[1.75rem] border-white/8 bg-white/[0.03] text-white shadow-[0_18px_50px_rgba(2,6,23,0.14)]">
              <CardHeader>
                <CardTitle className="text-lg">
                  Profile & verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field>
                      <FieldLabel className="text-slate-100">
                        Country
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="country"
                          defaultValue={defaultValues.country}
                          className="input-premium h-11 rounded-xl"
                        />
                        <FieldError>
                          {state.fieldErrors?.country?.[0]}
                        </FieldError>
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel className="text-slate-100">State</FieldLabel>
                      <FieldContent>
                        <Input
                          name="state"
                          defaultValue={defaultValues.state}
                          className="input-premium h-11 rounded-xl"
                        />
                        <FieldError>{state.fieldErrors?.state?.[0]}</FieldError>
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel className="text-slate-100">City</FieldLabel>
                      <FieldContent>
                        <Input
                          name="city"
                          defaultValue={defaultValues.city}
                          className="input-premium h-11 rounded-xl"
                        />
                        <FieldError>{state.fieldErrors?.city?.[0]}</FieldError>
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel className="text-slate-100">
                        Address line 1
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="addressLine1"
                          defaultValue={defaultValues.addressLine1}
                          className="input-premium h-11 rounded-xl"
                        />
                        <FieldError>
                          {state.fieldErrors?.addressLine1?.[0]}
                        </FieldError>
                      </FieldContent>
                    </Field>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field>
                      <FieldLabel className="text-slate-100">
                        KYC status
                      </FieldLabel>
                      <FieldContent>
                        <select
                          name="kycStatus"
                          defaultValue={defaultValues.kycStatus}
                          className="input-premium h-11 w-full rounded-xl px-3 py-2"
                        >
                          <option value="NOT_STARTED">Not started</option>
                          <option value="PENDING_REVIEW">Pending review</option>
                          <option value="VERIFIED">Verified</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                        <FieldError>
                          {state.fieldErrors?.kycStatus?.[0]}
                        </FieldError>
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel className="text-slate-100">
                        Verified
                      </FieldLabel>
                      <FieldContent>
                        <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                          <input
                            type="checkbox"
                            name="isVerified"
                            value="true"
                            defaultChecked={defaultValues.isVerified}
                          />
                          Profile is verified
                        </label>
                        <FieldError>
                          {state.fieldErrors?.isVerified?.[0]}
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
