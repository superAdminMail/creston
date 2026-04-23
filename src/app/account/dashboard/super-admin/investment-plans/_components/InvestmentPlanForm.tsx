"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { InvestmentModel } from "@/generated/prisma";
import type {
  InvestmentPeriod,
  InvestmentTierLevel,
  PenaltyType,
} from "@/generated/prisma";
import type { SuperAdminInvestmentOption } from "@/actions/super-admin/investment-plans/getSuperAdminInvestmentPlans";
import type { InvestmentPlanFormActionState } from "@/actions/super-admin/investment-plans/investmentPlanForm.state";
import { initialInvestmentPlanFormActionState } from "@/actions/super-admin/investment-plans/investmentPlanForm.state";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
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
  fixedRoiPercent: string;
  projectedRoiMin: string;
  projectedRoiMax: string;
  isActive: boolean;
};

type InvestmentPlanFormValues = {
  investmentId: string;
  name: string;
  slug: string;
  description: string;
  period: InvestmentPeriod;
  investmentModel: InvestmentModel;
  penaltyPeriodDays: string;
  penaltyType: PenaltyType | "";
  earlyWithdrawalPenaltyValue: string;
  maxPenaltyAmount: string;
  expectedReturnMin: string;
  expectedReturnMax: string;
  isLocked: boolean;
  allowWithdrawal: boolean;
  currency: string;
  seoTitle: string;
  seoDescription: string;
  seoImageFileId: string;
  sortOrder: string;
  durationDays: string;
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
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState(defaultValues.name);
  const [descriptionValue, setDescriptionValue] = useState(
    defaultValues.description,
  );
  const [investmentId, setInvestmentId] = useState(defaultValues.investmentId);
  const [period, setPeriod] = useState(defaultValues.period);
  const [investmentModel, setInvestmentModel] = useState(
    defaultValues.investmentModel,
  );
  const [penaltyPeriodDays, setPenaltyPeriodDays] = useState(
    defaultValues.penaltyPeriodDays,
  );
  const [penaltyType, setPenaltyType] = useState(defaultValues.penaltyType);
  const [earlyWithdrawalPenaltyValue, setEarlyWithdrawalPenaltyValue] =
    useState(defaultValues.earlyWithdrawalPenaltyValue);
  const [maxPenaltyAmount, setMaxPenaltyAmount] = useState(
    defaultValues.maxPenaltyAmount,
  );
  const [expectedReturnMin, setExpectedReturnMin] = useState(
    defaultValues.expectedReturnMin,
  );
  const [expectedReturnMax, setExpectedReturnMax] = useState(
    defaultValues.expectedReturnMax,
  );
  const [isLocked, setIsLocked] = useState(String(defaultValues.isLocked));
  const [allowWithdrawal, setAllowWithdrawal] = useState(
    String(defaultValues.allowWithdrawal),
  );
  const [isActive, setIsActive] = useState(String(defaultValues.isActive));
  const [seoTitle, setSeoTitle] = useState(defaultValues.seoTitle);
  const [seoDescription, setSeoDescription] = useState(
    defaultValues.seoDescription,
  );
  const [seoImageFileId, setSeoImageFileId] = useState(
    defaultValues.seoImageFileId,
  );
  const [sortOrder, setSortOrder] = useState(defaultValues.sortOrder);
  const [durationDays, setDurationDays] = useState(defaultValues.durationDays);
  const [tiers, setTiers] = useState<InvestmentPlanTierFormValue[]>(
    defaultValues.tiers,
  );
  const derivedSlug = slugify(name);
  const usesFixedReturn = investmentModel === InvestmentModel.FIXED;
  const serializedTiers = useMemo(() => JSON.stringify(tiers), [tiers]);

  useEffect(() => {
    if (state.status !== "error" || !state.message) {
      return;
    }

    toast.error(state.message, {
      id: "super-admin-investment-plan-form-error",
    });
  }, [state.message, state.status]);

  useEffect(() => {
    if (state.status !== "success" || !state.message || !state.redirectHref) {
      return;
    }

    const toastId = `super-admin-investment-plan-form-success:${pathname}:${state.redirectHref}`;

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

          <FieldGroup className="gap-6">
            <section className="space-y-4 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5 sm:p-6">
              <SectionHeader
                title="Plan identity"
                description="Core identity, grouping, and catalog fields for this investment plan."
              />

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
                    <FieldError>
                      {state.fieldErrors?.investmentId?.[0]}
                    </FieldError>
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
                    <FieldError>{state.fieldErrors?.name?.[0]}</FieldError>
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
                    {state.fieldErrors?.slug?.length ? (
                      <FieldError>{state.fieldErrors.slug[0]}</FieldError>
                    ) : (
                      <FieldDescription className="text-slate-400">
                        Generated automatically from the plan name.
                      </FieldDescription>
                    )}
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
                    <FieldError>{state.fieldErrors?.currency?.[0]}</FieldError>
                  </FieldContent>
                </Field>
              </div>

              <Field>
                <FieldLabel className="text-slate-100">Description</FieldLabel>
                <FieldContent>
                  <textarea
                    name="description"
                    value={descriptionValue}
                    onChange={(event) =>
                      setDescriptionValue(event.target.value)
                    }
                    rows={5}
                    className="input-premium min-h-32 w-full rounded-xl px-3 py-3"
                  />
                  <FieldError>{state.fieldErrors?.description?.[0]}</FieldError>
                </FieldContent>
              </Field>
            </section>

            <section className="space-y-4 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5 sm:p-6">
              <SectionHeader
                title="Plan controls"
                description="Term, lock, withdrawal, and penalty settings."
              />

              <div className="grid gap-5 lg:grid-cols-2">
                <Field>
                  <FieldLabel className="text-slate-100">
                    Investment model
                  </FieldLabel>
                  <FieldContent>
                    <SuperAdminFormSelect
                      name="investmentModel"
                      value={investmentModel}
                      onValueChange={(value) =>
                        setInvestmentModel(value as InvestmentModel)
                      }
                      placeholder="Select model"
                      options={[
                        { value: "FIXED", label: "Fixed" },
                        { value: "MARKET", label: "Market" },
                      ]}
                    />
                    <FieldError>
                      {state.fieldErrors?.investmentModel?.[0]}
                    </FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel className="text-slate-100">Period</FieldLabel>
                  <FieldContent>
                    <SuperAdminFormSelect
                      name="period"
                      value={period}
                      onValueChange={(value) =>
                        setPeriod(value as InvestmentPeriod)
                      }
                      placeholder="Select period"
                      options={["SHORT_TERM", "MEDIUM_TERM", "LONG_TERM"].map(
                        (option) => ({
                          value: option,
                          label: option.replaceAll("_", " "),
                        }),
                      )}
                    />
                    <FieldError>{state.fieldErrors?.period?.[0]}</FieldError>
                  </FieldContent>
                </Field>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <Field>
                  <FieldLabel className="text-slate-100">
                    Penalty period days
                  </FieldLabel>
                  <FieldContent>
                    <Input
                    name="penaltyPeriodDays"
                      type="number"
                      min={0}
                      step={1}
                      value={penaltyPeriodDays}
                      onChange={(event) =>
                        setPenaltyPeriodDays(event.target.value)
                      }
                      className="input-premium h-11 rounded-xl"
                    />
                    <FieldDescription className="text-slate-400">
                      Withdrawals made within this period incur the configured
                      early withdrawal penalty.
                    </FieldDescription>
                    <FieldError>
                      {state.fieldErrors?.penaltyPeriodDays?.[0]}
                    </FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel className="text-slate-100">
                    Duration days
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      name="durationDays"
                      type="number"
                      min={1}
                      step={1}
                      value={durationDays}
                      onChange={(event) => setDurationDays(event.target.value)}
                      className="input-premium h-11 rounded-xl"
                    />
                    <FieldError>
                      {state.fieldErrors?.durationDays?.[0]}
                    </FieldError>
                  </FieldContent>
                </Field>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <Field>
                  <FieldLabel className="text-slate-100">
                    Penalty type
                  </FieldLabel>
                  <FieldContent>
                    <SuperAdminFormSelect
                      name="penaltyType"
                      value={penaltyType}
                      onValueChange={(value) =>
                        setPenaltyType(value as PenaltyType | "")
                      }
                      placeholder="Select penalty type"
                      emptyOptionLabel="No penalty type"
                      options={[
                        { value: "FIXED", label: "Fixed" },
                        { value: "PERCENT", label: "Percent" },
                      ]}
                    />
                    <FieldError>
                      {state.fieldErrors?.penaltyType?.[0]}
                    </FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel className="text-slate-100">
                    Early withdrawal penalty value
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      name="earlyWithdrawalPenaltyValue"
                      type="number"
                      step="0.01"
                      min={0}
                      value={earlyWithdrawalPenaltyValue}
                      onChange={(event) =>
                        setEarlyWithdrawalPenaltyValue(event.target.value)
                      }
                      className="input-premium h-11 rounded-xl"
                    />
                    <FieldError>
                      {state.fieldErrors?.earlyWithdrawalPenaltyValue?.[0]}
                    </FieldError>
                  </FieldContent>
                </Field>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <Field>
                  <FieldLabel className="text-slate-100">
                    Maximum penalty amount
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      name="maxPenaltyAmount"
                      type="number"
                      step="0.01"
                      min={0}
                      value={maxPenaltyAmount}
                      onChange={(event) =>
                        setMaxPenaltyAmount(event.target.value)
                      }
                      className="input-premium h-11 rounded-xl"
                    />
                    <FieldError>
                      {state.fieldErrors?.maxPenaltyAmount?.[0]}
                    </FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel className="text-slate-100">
                    Withdrawal allowance
                  </FieldLabel>
                  <FieldContent>
                    <SuperAdminFormSelect
                      name="allowWithdrawal"
                      value={allowWithdrawal}
                      onValueChange={setAllowWithdrawal}
                      placeholder="Select withdrawal state"
                      options={[
                        { value: "true", label: "Allow withdrawals" },
                        { value: "false", label: "Disable withdrawals" },
                      ]}
                    />
                    <FieldError>
                      {state.fieldErrors?.allowWithdrawal?.[0]}
                    </FieldError>
                  </FieldContent>
                </Field>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <Field>
                  <FieldLabel className="text-slate-100">
                    Locked state
                  </FieldLabel>
                  <FieldContent>
                    <SuperAdminFormSelect
                      name="isLocked"
                      value={isLocked}
                      onValueChange={setIsLocked}
                      placeholder="Select lock state"
                      options={[
                        { value: "true", label: "Locked" },
                        { value: "false", label: "Unlocked" },
                      ]}
                    />
                    <FieldError>{state.fieldErrors?.isLocked?.[0]}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel className="text-slate-100">
                    Active state
                  </FieldLabel>
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
                    <FieldError>{state.fieldErrors?.isActive?.[0]}</FieldError>
                  </FieldContent>
                </Field>
              </div>
            </section>

            <section className="space-y-4 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5 sm:p-6">
              <SectionHeader
                title="Return and SEO metadata"
                description="Optional marketing metadata and return range configuration."
              />

              <div className="grid gap-5 lg:grid-cols-2">
                <Field>
                  <FieldLabel className="text-slate-100">
                    Expected return minimum
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      name="expectedReturnMin"
                      type="number"
                      step="0.01"
                      min={0}
                      value={expectedReturnMin}
                      onChange={(event) =>
                        setExpectedReturnMin(event.target.value)
                      }
                      className="input-premium h-11 rounded-xl"
                    />
                    <FieldError>
                      {state.fieldErrors?.expectedReturnMin?.[0]}
                    </FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel className="text-slate-100">
                    Expected return maximum
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      name="expectedReturnMax"
                      type="number"
                      step="0.01"
                      min={0}
                      value={expectedReturnMax}
                      onChange={(event) =>
                        setExpectedReturnMax(event.target.value)
                      }
                      className="input-premium h-11 rounded-xl"
                    />
                    <FieldError>
                      {state.fieldErrors?.expectedReturnMax?.[0]}
                    </FieldError>
                  </FieldContent>
                </Field>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <Field>
                  <FieldLabel className="text-slate-100">SEO title</FieldLabel>
                  <FieldContent>
                    <Input
                      name="seoTitle"
                      value={seoTitle}
                      onChange={(event) => setSeoTitle(event.target.value)}
                      className="input-premium h-11 rounded-xl"
                    />
                    <FieldError>{state.fieldErrors?.seoTitle?.[0]}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel className="text-slate-100">
                    SEO image file asset id
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      name="seoImageFileId"
                      value={seoImageFileId}
                      onChange={(event) =>
                        setSeoImageFileId(event.target.value)
                      }
                      placeholder="Optional file asset id"
                      className="input-premium h-11 rounded-xl"
                    />
                    <FieldError>
                      {state.fieldErrors?.seoImageFileId?.[0]}
                    </FieldError>
                  </FieldContent>
                </Field>
              </div>

              <Field>
                <FieldLabel className="text-slate-100">
                  SEO description
                </FieldLabel>
                <FieldContent>
                  <textarea
                    name="seoDescription"
                    value={seoDescription}
                    onChange={(event) => setSeoDescription(event.target.value)}
                    rows={4}
                    className="input-premium min-h-28 w-full rounded-xl px-3 py-3"
                  />
                  <FieldError>
                    {state.fieldErrors?.seoDescription?.[0]}
                  </FieldError>
                </FieldContent>
              </Field>

              <div className="grid gap-5 lg:grid-cols-2">
                <Field>
                  <FieldLabel className="text-slate-100">Sort order</FieldLabel>
                  <FieldContent>
                    <Input
                      name="sortOrder"
                      type="number"
                      min={0}
                      step={1}
                      value={sortOrder}
                      onChange={(event) => setSortOrder(event.target.value)}
                      className="input-premium h-11 rounded-xl"
                    />
                    <FieldError>{state.fieldErrors?.sortOrder?.[0]}</FieldError>
                  </FieldContent>
                </Field>
              </div>
            </section>

            <section className="space-y-4 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5 sm:p-6">
              <SectionHeader
                title="Tier management"
                description="Configure the active range and return profile for each tier."
              />

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
                        <input
                          type="checkbox"
                          checked={tier.isActive}
                          onChange={(event) =>
                            setTiers((current) =>
                              current.map((currentTier, currentIndex) =>
                                currentIndex === index
                                  ? {
                                      ...currentTier,
                                      isActive: event.target.checked,
                                    }
                                  : currentTier,
                              ),
                            )
                          }
                        />
                        Active tier
                      </label>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
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

                      {usesFixedReturn ? (
                        <Field>
                          <FieldLabel className="text-slate-100">
                            Fixed ROI %
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              value={tier.fixedRoiPercent}
                              onChange={(event) =>
                                setTiers((current) =>
                                  current.map((currentTier, currentIndex) =>
                                    currentIndex === index
                                      ? {
                                          ...currentTier,
                                          fixedRoiPercent: event.target.value,
                                        }
                                      : currentTier,
                                  ),
                                )
                              }
                              className="input-premium h-11 rounded-xl"
                            />
                          </FieldContent>
                        </Field>
                      ) : (
                        <div className="grid gap-4 lg:grid-cols-2">
                          <Field>
                            <FieldLabel className="text-slate-100">
                              Projected ROI min %
                            </FieldLabel>
                            <FieldContent>
                              <Input
                                value={tier.projectedRoiMin}
                                onChange={(event) =>
                                  setTiers((current) =>
                                    current.map((currentTier, currentIndex) =>
                                      currentIndex === index
                                        ? {
                                            ...currentTier,
                                            projectedRoiMin: event.target.value,
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
                              Projected ROI max %
                            </FieldLabel>
                            <FieldContent>
                              <Input
                                value={tier.projectedRoiMax}
                                onChange={(event) =>
                                  setTiers((current) =>
                                    current.map((currentTier, currentIndex) =>
                                      currentIndex === index
                                        ? {
                                            ...currentTier,
                                            projectedRoiMax: event.target.value,
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
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {state.fieldErrors?.tiers?.length ? (
                <FieldError>{state.fieldErrors.tiers[0]}</FieldError>
              ) : (
                <FieldDescription className="text-slate-400">
                  Configure active tier ranges in ascending order from Core to
                  Elite.
                </FieldDescription>
              )}
            </section>
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
