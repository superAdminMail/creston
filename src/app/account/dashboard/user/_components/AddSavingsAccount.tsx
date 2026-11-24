"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Check,
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
    "h-11 rounded-xl shadow-sm",
    DASHBOARD_FIELD_CLASS,
  );

  const fieldTextAreaClassName = cn(
    "min-h-[110px] w-full rounded-xl shadow-sm",
    DASHBOARD_FIELD_CLASS,
  );

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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            <Link
              href="/account/dashboard/user/savings"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-sky-800 dark:text-slate-400 dark:hover:text-sky-300"
            >
              <ArrowLeft className="size-4" />
              Back to savings
            </Link>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-sky-800 dark:text-sky-300">
                <PiggyBank className="size-4" />
                Savings setup
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Open a savings account
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                Choose a savings product, configure your account, and set a
                target that supports your savings goal.
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 items-center justify-center rounded-2xl bg-sky-50 p-4 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300 sm:flex">
            <PiggyBank className="size-8" />
          </div>
        </div>
      </section>

      {!canCreateSavingsAccount ? (
        <Alert className="rounded-2xl border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
          <AlertCircle className="size-5 shrink-0" />
          <AlertTitle>
            Savings accounts require verified KYC. Current status:{" "}
            {formatEnumLabel(kycStatus, "Not available")}.
          </AlertTitle>
        </Alert>
      ) : (
        <Alert className="rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
          <ShieldCheck className="size-5 shrink-0" />
          <AlertTitle>
            Your identity is verified. You can open savings accounts.
          </AlertTitle>
        </Alert>
      )}

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="min-w-0 space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                Choose a savings product
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Compare the available features before making your selection.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {initialProducts.length}{" "}
              {initialProducts.length === 1 ? "product" : "products"} available
            </span>
          </div>

          {initialProducts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {initialProducts.map((product) => {
                const isSelected = selected === product.id;
                const features = buildFeatures(product);

                return (
                  <Card
                    key={product.id}
                    onClick={() => setSelected(product.id)}
                    className={cn(
                      "group relative h-full cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:border-sky-300 hover:shadow-md dark:bg-slate-900",
                      isSelected
                        ? "border-sky-500 ring-1 ring-sky-500/30 dark:border-sky-400 dark:ring-sky-400/20"
                        : "border-slate-200 dark:border-white/10",
                    )}
                  >
                    <CardContent className="flex h-full flex-col gap-5 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-2">
                          <h3 className="break-words text-lg font-semibold text-slate-950 dark:text-white">
                            {product.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className="border-slate-200 bg-slate-50 font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                          >
                            {product.currency}
                          </Badge>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                          {product.sortOrder === 1 ? (
                            <Badge className="border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                              Popular
                            </Badge>
                          ) : null}

                          {isSelected ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-500/10 dark:text-sky-300">
                              <Check className="size-3.5" />
                              Selected
                            </span>
                          ) : (
                            <span className="size-6 rounded-full border border-slate-300 dark:border-white/20" />
                          )}
                        </div>
                      </div>

                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {product.description ??
                          "No description available for this product."}
                      </p>

                      <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-white/10">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Product features
                        </p>
                        <ul className="space-y-3">
                          {features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300"
                            >
                              <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              <span className="leading-5">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-auto border-t border-slate-100 pt-4 dark:border-white/10">
                        <div
                          className={cn(
                            "flex items-center justify-between gap-2 text-sm font-medium",
                            isSelected
                              ? "text-sky-800 dark:text-sky-300"
                              : "text-slate-600 dark:text-slate-400",
                          )}
                        >
                          <span>
                            {isSelected ? "Product selected" : "Select product"}
                          </span>
                          {isSelected ? (
                            <BadgeCheck className="size-5" />
                          ) : (
                            <span className="size-5 rounded-full border border-slate-300 dark:border-white/20" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="rounded-2xl border border-dashed border-slate-300 bg-white dark:border-white/10 dark:bg-slate-900">
              <CardContent className="flex flex-col items-center px-5 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                  <PiggyBank className="size-6" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-950 dark:text-white">
                  No savings products available
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
                  There are currently no savings products available to open.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        <div className="min-w-0">
          <DashboardSectionCard className="space-y-6 p-5 sm:p-6 lg:sticky lg:top-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-sky-800 dark:text-sky-300">
                <PiggyBank className="size-4" />
                Account setup
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Configure your account
              </h2>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                Enter your account details and review your selected product
                before opening the account.
              </p>
            </div>

            {selectedProduct ? (
              <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-500/20 dark:bg-sky-500/[0.07]">
                <p className="text-xs font-medium text-sky-800 dark:text-sky-300">
                  Selected product
                </p>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-slate-950 dark:text-white">
                      {selectedProduct.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      Currency: {selectedProduct.currency}
                    </p>
                  </div>
                  <BadgeCheck className="size-5 shrink-0 text-sky-700 dark:text-sky-300" />
                </div>
              </div>
            ) : null}

            <form key={selected} action={formAction} className="space-y-5">
              <input type="hidden" name="productId" value={selected} />

              <FieldGroup className="gap-5">
                <Field
                  data-invalid={Boolean(state.fieldErrors?.name) || undefined}
                >
                  <FieldLabel className="text-sm font-medium text-slate-800 dark:text-slate-200">
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
                    <FieldDescription className="text-xs text-slate-500 dark:text-slate-400">
                      Give your savings account a name you can easily identify.
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
                  <FieldLabel className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Description
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      name="description"
                      placeholder="What are you saving for?"
                      disabled={!canCreateSavingsAccount}
                      className={fieldTextAreaClassName}
                    />
                    <FieldDescription className="text-xs text-slate-500 dark:text-slate-400">
                      Add a short note about the purpose of this account.
                    </FieldDescription>
                    {state.fieldErrors?.description ? (
                      <FieldError
                        errors={state.fieldErrors.description.map(
                          (message) => ({ message }),
                        )}
                      />
                    ) : null}
                  </FieldContent>
                </Field>

                <Field
                  data-invalid={
                    Boolean(state.fieldErrors?.targetAmount) || undefined
                  }
                >
                  <FieldLabel className="text-sm font-medium text-slate-800 dark:text-slate-200">
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
                    <FieldDescription className="text-xs text-slate-500 dark:text-slate-400">
                      Set the amount you intend to save. You can leave this
                      empty if you do not have a target.
                    </FieldDescription>
                    {state.fieldErrors?.targetAmount ? (
                      <FieldError
                        errors={state.fieldErrors.targetAmount.map(
                          (message) => ({ message }),
                        )}
                      />
                    ) : null}
                  </FieldContent>
                </Field>

                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-white/10 dark:bg-white/[0.03]",
                    (!canCreateSavingsAccount ||
                      !selectedProduct?.isLockable) &&
                      "cursor-not-allowed opacity-70",
                  )}
                >
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
                    className="mt-0.5"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      <Lock className="size-4 text-sky-700 dark:text-sky-300" />
                      Lock this account
                    </div>
                    <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                      {selectedProduct?.isLockable
                        ? `Locks withdrawals for at least ${selectedProduct.minimumLockDays ?? 0} days.`
                        : "The selected product does not support account locking."}
                    </p>
                    {state.fieldErrors?.lockSavings ? (
                      <FieldError
                        errors={state.fieldErrors.lockSavings.map(
                          (message) => ({ message }),
                        )}
                      />
                    ) : null}
                  </div>
                </label>
              </FieldGroup>

              {state.status === "error" && state.message ? (
                <Alert className="rounded-xl border-red-200 bg-red-50 text-red-900 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-100">
                  <AlertCircle className="size-4" />
                  <AlertTitle>{state.message}</AlertTitle>
                </Alert>
              ) : null}

              <div className="space-y-4 border-t border-slate-200 pt-5 dark:border-white/10">
                {!canCreateSavingsAccount ? (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-xl border-slate-300 dark:border-white/15"
                  >
                    <Link href="/account/dashboard/user/kyc">
                      Complete KYC first
                    </Link>
                  </Button>
                ) : (
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>Product currency</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {selectedProduct?.currency ?? "USD"}
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!selected || !canCreateSavingsAccount || isPending}
                  className="h-11 w-full rounded-xl bg-sky-700 font-semibold text-white shadow-sm hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Opening account..." : "Open savings account"}
                </Button>
              </div>
            </form>
          </DashboardSectionCard>
        </div>
      </div>
    </div>
  );
}
