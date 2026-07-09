"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Lock,
  PiggyBank,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { createSavingsAccount } from "@/actions/savings/createSavingsAccount";
import type { SavingsPageData } from "@/actions/savings/getSavingsPageData";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatEnumLabel } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";
import { DashboardSectionCard } from "../../_components/DashboardSectionCard";
import { DASHBOARD_FIELD_CLASS } from "../../_components/dashboardSurfaces";

type AddSavingsAccountProps = {
  initialProducts: SavingsPageData["products"];
  kycStatus: SavingsPageData["kycStatus"];
  canCreateSavingsAccount: boolean;
};

function buildFeatures(product: SavingsPageData["products"][number]) {
  const features: string[] = [];

  if (product.interestEnabled && product.interestRatePercent) {
    features.push(`${product.interestRatePercent}% annual interest`);
    if (product.interestPayoutFrequency) {
      features.push(
        `${formatEnumLabel(product.interestPayoutFrequency)} payouts`,
      );
    }
  } else {
    features.push("No interest earnings");
  }

  if (product.isLockable && product.minimumLockDays) {
    features.push(`Lock period up to ${product.minimumLockDays} days`);
  } else {
    features.push("No lock period");
  }

  features.push(
    product.allowsWithdrawals
      ? "Flexible withdrawals"
      : "Withdrawals restricted",
  );

  if (product.minBalance) {
    features.push(
      `Minimum balance ${formatCurrency(product.minBalance, product.currency)}`,
    );
  }

  return features;
}

export default function AddSavingsAccount({
  initialProducts,
  kycStatus,
  canCreateSavingsAccount,
}: AddSavingsAccountProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(
    initialProducts[0]?.id ?? "",
  );
  const [state, formAction, isPending] = useActionState(createSavingsAccount, {
    status: "idle",
  });

  const selectedProduct = useMemo(
    () => initialProducts.find((product) => product.id === selected) ?? null,
    [initialProducts, selected],
  );
  const [lockSavings, setLockSavings] = useState(false);
  const lastToastKey = useRef<string | null>(null);
  const fieldInputClassName = cn(
    "h-11 rounded-2xl px-3 shadow-sm",
    DASHBOARD_FIELD_CLASS,
  );
  const fieldTextAreaClassName = cn(
    "min-h-[100px] w-full rounded-2xl px-3 py-3 shadow-sm",
    DASHBOARD_FIELD_CLASS,
  );
  const fieldLabelClassName = "text-slate-600 dark:text-slate-300";
  const fieldDescriptionClassName =
    "text-xs text-slate-500 dark:text-slate-400";

  useEffect(() => {
    if (state.status !== "success" || !state.message) {
      return;
    }

    const toastKey = `${state.status}:${state.message}`;
    if (lastToastKey.current === toastKey) {
      return;
    }

    lastToastKey.current = toastKey;
    toast.success(state.message);
    router.push("/account/dashboard/user/savings");
  }, [router, state.message, state.status]);

  useEffect(() => {
    setLockSavings(false);
  }, [selected]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 ">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-border/60 bg-white/75 p-5 shadow-sm sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex justify-between">
            <Link
              href="/account/dashboard/user/savings"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to savings
            </Link>
            <span className="inline-flex md:hidden items-center gap-2 rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-sky-800 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/12 dark:text-sky-100">
              <PiggyBank className="h-3.5 w-3.5" />
              Savings setup
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">
            Open a savings account
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
            Choose a savings product, review the setup details, and open an
            account that matches your savings goal.
          </p>
        </div>
      </div>

      {!canCreateSavingsAccount ? (
        <Alert className="rounded-2xl border border-amber-200/70 bg-amber-50 text-amber-900 shadow-sm dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            Savings accounts require verified KYC. Current status:{" "}
            {formatEnumLabel(kycStatus, "Not available")}.
          </AlertTitle>
        </Alert>
      ) : (
        <Alert className="rounded-2xl border border-emerald-200/70 bg-emerald-50 text-emerald-900 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>
            Your identity is verified. You can open savings accounts.
          </AlertTitle>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-6 md:grid-cols-2">
          {initialProducts.map((product) => {
            const isSelected = selected === product.id;
            const features = buildFeatures(product);

            return (
              <Card
                key={product.id}
                onClick={() => setSelected(product.id)}
                className={cn(
                  "cursor-pointer rounded-[1.75rem] border border-border/60 bg-white/75 transition-colors transition-shadow hover:border-sky-300/60 hover:bg-sky-50/70 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.05]",
                  isSelected &&
                    "!border-sky-300 !bg-sky-50/95 shadow-md shadow-sky-500/10 ring-1 ring-sky-200/70 dark:!border-sky-400/20 dark:!bg-sky-400/12 dark:ring-sky-400/20 dark:shadow-none",
                )}
              >
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                        {product.name}
                      </h2>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                        {product.currency}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {product.sortOrder === 1 ? (
                        <Badge
                          variant="secondary"
                          className="relative overflow-hidden border-amber-200/70 bg-amber-50 text-amber-800 shadow-sm dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100"
                        >
                          <span className="relative z-10">Popular</span>
                        </Badge>
                      ) : null}
                      {isSelected ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/12 dark:text-sky-100">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Selected
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {product.description ??
                      "No description available for this product."}
                  </p>

                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <DashboardSectionCard className="space-y-6 p-6 sm:p-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <PiggyBank className="h-4 w-4 text-sky-700 dark:text-sky-300" />
              <span className="text-sm font-medium">Account setup</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your account will be set up with the following details:
            </p>
          </div>

          <form key={selected} action={formAction} className="space-y-5">
            <input type="hidden" name="productId" value={selected} />

            <FieldGroup className="gap-5">
              <Field
                data-invalid={Boolean(state.fieldErrors?.name) || undefined}
              >
                <FieldLabel className={fieldLabelClassName}>
                  Account name
                </FieldLabel>
                <FieldContent>
                  <Input
                    name="name"
                    defaultValue={selectedProduct?.name ?? ""}
                    placeholder="Emergency Savings"
                    disabled={!canCreateSavingsAccount}
                    className={fieldInputClassName}
                  />
                  <FieldDescription className={fieldDescriptionClassName}>
                    This is the name of your savings account.
                  </FieldDescription>
                  {state.fieldErrors?.name ? (
                    <FieldError
                      errors={state.fieldErrors.name.map((message) => ({
                        message,
                      }))}
                    />
                  ) : null}
                </FieldContent>
              </Field>

              <Field
                data-invalid={
                  Boolean(state.fieldErrors?.description) || undefined
                }
              >
                <FieldLabel className={fieldLabelClassName}>
                  Description
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    name="description"
                    placeholder="What are you saving for?"
                    disabled={!canCreateSavingsAccount}
                    className={fieldTextAreaClassName}
                  />
                  {state.fieldErrors?.description ? (
                    <FieldError
                      errors={state.fieldErrors.description.map((message) => ({
                        message,
                      }))}
                    />
                  ) : null}
                </FieldContent>
              </Field>

              <Field
                data-invalid={
                  Boolean(state.fieldErrors?.targetAmount) || undefined
                }
              >
                <FieldLabel className={fieldLabelClassName}>
                  Target amount
                </FieldLabel>
                <FieldContent>
                  <Input
                    name="targetAmount"
                    inputMode="decimal"
                    placeholder={
                      selectedProduct
                        ? `e.g. ${selectedProduct.currency} 5000`
                        : "e.g. 5000"
                    }
                    disabled={!canCreateSavingsAccount}
                    className={fieldInputClassName}
                  />
                  <FieldDescription className={fieldDescriptionClassName}>
                    This is the target amount for your savings account.
                  </FieldDescription>
                  {state.fieldErrors?.targetAmount ? (
                    <FieldError
                      errors={state.fieldErrors.targetAmount.map((message) => ({
                        message,
                      }))}
                    />
                  ) : null}
                </FieldContent>
              </Field>

              <label className="flex items-start gap-3 rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <Checkbox
                  name="lockSavings"
                  value="true"
                  checked={lockSavings}
                  onCheckedChange={(checked) => {
                    setLockSavings(checked === true);
                  }}
                  disabled={
                    !canCreateSavingsAccount || !selectedProduct?.isLockable
                  }
                  className="mt-1 border-border/70 bg-white text-sky-500 shadow-sm dark:bg-white/[0.9] dark:data-checked:bg-sky-500 dark:data-checked:text-white"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-white">
                    <Lock className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                    Lock this account
                  </div>
                  <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
                    {selectedProduct?.isLockable
                      ? `Locks withdrawals for at least ${selectedProduct.minimumLockDays ?? 0} days.`
                      : "The selected product does not support account locking."}
                  </p>
                  {state.fieldErrors?.lockSavings ? (
                    <FieldError
                      errors={state.fieldErrors.lockSavings.map((message) => ({
                        message,
                      }))}
                    />
                  ) : null}
                </div>
              </label>
            </FieldGroup>

            {state.status === "error" && state.message ? (
              <Alert className="rounded-2xl border border-red-200/70 bg-red-50 text-red-900 shadow-sm dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-100">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{state.message}</AlertTitle>
              </Alert>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
              {!canCreateSavingsAccount ? (
                <Button
                  asChild
                  variant="outline"
                  className="rounded-2xl border-border/60 bg-white/75 text-slate-700 shadow-sm hover:bg-sky-50 dark:bg-white/[0.04] dark:text-slate-200"
                >
                  <Link href="/account/dashboard/user/kyc">
                    Complete KYC first
                  </Link>
                </Button>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Product currency: {selectedProduct?.currency ?? "USD"}
                </div>
              )}

              <Button
                type="submit"
                disabled={!selected || !canCreateSavingsAccount || isPending}
                className="rounded-2xl bg-sky-500 px-6 shadow-sm hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-500/50 disabled:opacity-50"
              >
                {isPending ? "Opening..." : "Open savings account"}
              </Button>
            </div>
          </form>
        </DashboardSectionCard>
      </div>
    </div>
  );
}
