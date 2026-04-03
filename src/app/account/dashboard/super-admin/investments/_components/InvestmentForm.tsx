"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import type {
  SuperAdminIconFileOption,
  SuperAdminInvestmentFilterOptions,
} from "@/actions/super-admin/investments/getSuperAdminInvestments";
import type { InvestmentFormActionState } from "@/actions/super-admin/investments/investmentForm.state";
import { initialInvestmentFormActionState } from "@/actions/super-admin/investments/investmentForm.state";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/slugs/slugify";
import { SuperAdminFormSelect } from "../../_components/SuperAdminFormSelect";

type InvestmentFormValues = {
  name: string;
  slug: string;
  description: string;
  type: string;
  period: string;
  status: string;
  iconFileAssetId: string;
  sortOrder: string;
  isActive: boolean;
};

type InvestmentFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  cancelHref: string;
  defaultValues: InvestmentFormValues;
  filterOptions: SuperAdminInvestmentFilterOptions;
  iconFileOptions: SuperAdminIconFileOption[];
  formAction: (
    state: InvestmentFormActionState,
    formData: FormData,
  ) => Promise<InvestmentFormActionState>;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="btn-primary rounded-xl" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function InvestmentForm({
  title,
  description,
  submitLabel,
  cancelHref,
  defaultValues,
  filterOptions,
  iconFileOptions,
  formAction,
}: InvestmentFormProps) {
  const [state, action] = useActionState(
    formAction,
    initialInvestmentFormActionState,
  );
  const [name, setName] = useState(defaultValues.name);
  const [type, setType] = useState(defaultValues.type);
  const [period, setPeriod] = useState(defaultValues.period);
  const [status, setStatus] = useState(defaultValues.status);
  const [iconFileAssetId, setIconFileAssetId] = useState(
    defaultValues.iconFileAssetId,
  );
  const [isActive, setIsActive] = useState(String(defaultValues.isActive));
  const derivedSlug = slugify(name);

  useEffect(() => {
    if (state.status !== "error" || !state.message) {
      return;
    }

    toast.error(state.message, {
      id: "super-admin-investment-form-error",
    });
  }, [state.message, state.status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          {description}
        </p>
      </div>

      <section className="rounded-[2rem] border border-white/8 bg-[#08101d]/96 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.32)] backdrop-blur-xl sm:p-8">
        {state.status === "error" && state.message ? (
          <Alert className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{state.message}</AlertTitle>
          </Alert>
        ) : null}

        <form action={action} className="space-y-6">
          <FieldGroup className="gap-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <Field>
                <FieldLabel className="text-slate-100">Name</FieldLabel>
                <FieldContent>
                  <Input
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="input-premium h-11 rounded-xl"
                  />
                  <FieldDescription className="text-slate-400">
                    {state.fieldErrors?.name}
                  </FieldDescription>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel className="text-slate-100">Slug</FieldLabel>
                <FieldContent>
                  <Input
                    name="slug"
                    value={derivedSlug}
                    readOnly
                    className="input-premium h-11 rounded-xl text-slate-300"
                  />
                  <FieldDescription className="text-slate-400">
                    {state.fieldErrors?.slug ||
                      "Generated automatically from the investment name."}
                  </FieldDescription>
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldLabel className="text-slate-100">Description</FieldLabel>
              <FieldContent>
                <textarea
                  name="description"
                  defaultValue={defaultValues.description}
                  rows={5}
                  className="input-premium min-h-32 w-full rounded-xl px-3 py-3"
                />
                <FieldDescription className="text-slate-400">
                  {state.fieldErrors?.description}
                </FieldDescription>
              </FieldContent>
            </Field>

            <div className="grid gap-5 lg:grid-cols-3">
              <Field>
                <FieldLabel className="text-slate-100">Type</FieldLabel>
                <FieldContent>
                  <SuperAdminFormSelect
                    name="type"
                    value={type}
                    onValueChange={setType}
                    placeholder="Select type"
                    options={filterOptions.types}
                  />
                  <FieldDescription className="text-slate-400">
                    {state.fieldErrors?.type}
                  </FieldDescription>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel className="text-slate-100">Period</FieldLabel>
                <FieldContent>
                  <SuperAdminFormSelect
                    name="period"
                    value={period}
                    onValueChange={setPeriod}
                    placeholder="Select period"
                    options={filterOptions.periods}
                  />
                  <FieldDescription className="text-slate-400">
                    {state.fieldErrors?.period}
                  </FieldDescription>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel className="text-slate-100">Status</FieldLabel>
                <FieldContent>
                  <SuperAdminFormSelect
                    name="status"
                    value={status}
                    onValueChange={setStatus}
                    placeholder="Select status"
                    options={filterOptions.statuses}
                  />
                  <FieldDescription className="text-slate-400">
                    {state.fieldErrors?.status}
                  </FieldDescription>
                </FieldContent>
              </Field>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <Field>
                <FieldLabel className="text-slate-100">
                  Icon file asset
                </FieldLabel>
                <FieldContent>
                  <SuperAdminFormSelect
                    name="iconFileAssetId"
                    value={iconFileAssetId}
                    onValueChange={setIconFileAssetId}
                    placeholder="Select icon"
                    emptyOptionLabel="No icon"
                    options={iconFileOptions.map((option) => ({
                      value: option.id,
                      label: option.label,
                    }))}
                  />
                  <FieldDescription className="text-slate-400">
                    {state.fieldErrors?.iconFileAssetId}
                  </FieldDescription>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel className="text-slate-100">Sort order</FieldLabel>
                <FieldContent>
                  <Input
                    name="sortOrder"
                    defaultValue={defaultValues.sortOrder}
                    className="input-premium h-11 rounded-xl"
                  />
                  <FieldDescription className="text-slate-400">
                    {state.fieldErrors?.sortOrder}
                  </FieldDescription>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel className="text-slate-100">Active state</FieldLabel>
                <FieldContent>
                  <SuperAdminFormSelect
                    name="isActive"
                    value={isActive}
                    onValueChange={setIsActive}
                    placeholder="Select state"
                    options={[
                      { value: "true", label: "Active" },
                      { value: "false", label: "Inactive" },
                    ]}
                  />
                  <FieldDescription className="text-slate-400">
                    {state.fieldErrors?.isActive}
                  </FieldDescription>
                </FieldContent>
              </Field>
            </div>
          </FieldGroup>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              asChild
              type="button"
              variant="destructive"
              className="rounded-xl"
            >
              <Link href={cancelHref}>Cancel</Link>
            </Button>
            <SubmitButton label={submitLabel} />
          </div>
        </form>
      </section>
    </div>
  );
}
