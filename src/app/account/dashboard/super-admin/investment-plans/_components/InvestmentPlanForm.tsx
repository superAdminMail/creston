"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import type { InvestmentTierLevel } from "@/generated/prisma";
import type { SuperAdminInvestmentOption } from "@/actions/super-admin/investment-plans/getSuperAdminInvestmentPlans";
import type { InvestmentPlanFormActionState } from "@/actions/super-admin/investment-plans/investmentPlanForm.state";
import { initialInvestmentPlanFormActionState } from "@/actions/super-admin/investment-plans/investmentPlanForm.state";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/slugs/slugify";
import { formatTierLevel } from "@/lib/formatters/formatters";
import { SuperAdminFormSelect } from "../../_components/SuperAdminFormSelect";

type InvestmentPlanTierFormValue = {
  level: InvestmentTierLevel;
  minAmount: string;
  maxAmount: string;
  roiPercent: string;
  isActive: boolean;
};

type InvestmentPlanFormValues = {
  investmentId: string;
  name: string;
  slug: string;
  description: string;
  period: string;
  currency: string;
  tiers: InvestmentPlanTierFormValue[];
  isActive: boolean;
};

type InvestmentPlanFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  cancelHref: string;
  defaultValues: InvestmentPlanFormValues;
  investmentOptions: SuperAdminInvestmentOption[];
  formAction: (
    state: InvestmentPlanFormActionState,
    formData: FormData,
  ) => Promise<InvestmentPlanFormActionState>;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="btn-primary rounded-xl" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function InvestmentPlanForm({
  title,
  description,
  submitLabel,
  cancelHref,
  defaultValues,
  investmentOptions,
  formAction,
}: InvestmentPlanFormProps) {
  const [state, action] = useActionState(
    formAction,
    initialInvestmentPlanFormActionState,
  );
  const [name, setName] = useState(defaultValues.name);
  const [investmentId, setInvestmentId] = useState(defaultValues.investmentId);
  const [period, setPeriod] = useState(defaultValues.period);
  const [isActive, setIsActive] = useState(String(defaultValues.isActive));
  const [tiers, setTiers] = useState<InvestmentPlanTierFormValue[]>(
    defaultValues.tiers,
  );
  const derivedSlug = slugify(name);
  const serializedTiers = useMemo(() => JSON.stringify(tiers), [tiers]);

  useEffect(() => {
    if (state.status !== "error" || !state.message) {
      return;
    }

    toast.error(state.message, {
      id: "super-admin-investment-plan-form-error",
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
          <input type="hidden" name="tiers" value={serializedTiers} />

          <FieldGroup className="gap-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <Field>
                <FieldLabel className="text-slate-100">
                  Parent investment
                </FieldLabel>
                <FieldContent>
                  <SuperAdminFormSelect
                    name="investmentId"
                    value={investmentId}
                    onValueChange={setInvestmentId}
                    placeholder="Select investment"
                    emptyOptionLabel="Select investment"
                    options={investmentOptions.map((option) => ({
                      value: option.id,
                      label: option.name,
                    }))}
                  />
                  <FieldDescription className="text-slate-400">
                    {state.fieldErrors?.investmentId}
                  </FieldDescription>
                </FieldContent>
              </Field>
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
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
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
                      "Generated automatically from the plan name."}
                  </FieldDescription>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel className="text-slate-100">Currency</FieldLabel>
                <FieldContent>
                  <Input
                    name="currency"
                    defaultValue={defaultValues.currency}
                    className="input-premium h-11 rounded-xl"
                  />
                  <FieldDescription className="text-slate-400">
                    {state.fieldErrors?.currency}
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

            <div className="grid gap-5 lg:grid-cols-2">
              <Field>
                <FieldLabel className="text-slate-100">Period</FieldLabel>
                <FieldContent>
                  <SuperAdminFormSelect
                    name="period"
                    value={period}
                    onValueChange={setPeriod}
                    placeholder="Select period"
                    options={["SHORT_TERM", "MEDIUM_TERM", "LONG_TERM"].map(
                      (option) => ({
                        value: option,
                        label: option.replaceAll("_", " "),
                      }),
                    )}
                  />
                  <FieldDescription className="text-slate-400">
                    {state.fieldErrors?.period}
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

            <Field>
              <FieldLabel className="text-slate-100">
                Tier management
              </FieldLabel>
              <FieldContent>
                <div className="space-y-4">
                  {tiers.map((tier, index) => (
                    <div
                      key={tier.level}
                      className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-white">
                            {formatTierLevel(tier.level)}
                          </h3>
                          <p className="mt-1 text-sm text-slate-400">
                            Configure the active range and ROI for this tier.
                          </p>
                        </div>
                        <label className="inline-flex items-center gap-3 rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200">
                          <Checkbox
                            checked={tier.isActive}
                            onCheckedChange={(checked) =>
                              setTiers((current) =>
                                current.map((currentTier, currentIndex) =>
                                  currentIndex === index
                                    ? {
                                        ...currentTier,
                                        isActive: checked === true,
                                      }
                                    : currentTier,
                                ),
                              )
                            }
                          />
                          Active tier
                        </label>
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-3">
                        <Field>
                          <FieldLabel className="text-slate-100">
                            Minimum amount
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              value={tier.minAmount}
                              onChange={(event) =>
                                setTiers((current) =>
                                  current.map((currentTier, currentIndex) =>
                                    currentIndex === index
                                      ? {
                                          ...currentTier,
                                          minAmount: event.target.value,
                                        }
                                      : currentTier,
                                  ),
                                )
                              }
                              className="input-premium h-11 rounded-xl"
                            />
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel className="text-slate-100">
                            Maximum amount
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              value={tier.maxAmount}
                              onChange={(event) =>
                                setTiers((current) =>
                                  current.map((currentTier, currentIndex) =>
                                    currentIndex === index
                                      ? {
                                          ...currentTier,
                                          maxAmount: event.target.value,
                                        }
                                      : currentTier,
                                  ),
                                )
                              }
                              className="input-premium h-11 rounded-xl"
                            />
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel className="text-slate-100">
                            ROI %
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              value={tier.roiPercent}
                              onChange={(event) =>
                                setTiers((current) =>
                                  current.map((currentTier, currentIndex) =>
                                    currentIndex === index
                                      ? {
                                          ...currentTier,
                                          roiPercent: event.target.value,
                                        }
                                      : currentTier,
                                  ),
                                )
                              }
                              className="input-premium h-11 rounded-xl"
                            />
                          </FieldContent>
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>

                <FieldDescription className="text-slate-400">
                  {state.fieldErrors?.tiers ||
                    "Configure active tier ranges in ascending order from Starter to Premium."}
                </FieldDescription>
              </FieldContent>
            </Field>
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
