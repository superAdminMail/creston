"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Lock, PiggyBank, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { createSavingsAccount } from "@/actions/savings/createSavingsAccount";
import type { SavingsPageData } from "@/actions/savings/getSavingsPageData";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const lastToastKey = useRef<string | null>(null);

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

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:px-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">
          Open a savings account
        </h1>
        <p className="text-sm text-slate-400">
          Choose a savings product, set your account details, and open a
          schema-aligned savings account.
        </p>
      </div>

      {!canCreateSavingsAccount ? (
        <Alert className="rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-100">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            Savings accounts require verified KYC. Current status:{" "}
            {formatEnumLabel(kycStatus, "Not available")}.
          </AlertTitle>
        </Alert>
      ) : (
        <Alert className="rounded-2xl hidden border border-emerald-400/20 bg-emerald-400/10 text-emerald-100">
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
                  "cursor-pointer rounded-[1.75rem] border transition-all",
                  "border-white/10 bg-white/5 hover:border-white/20",
                  isSelected && "border-blue-500 bg-blue-500/10",
                )}
              >
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {product.name}
                      </h2>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {product.currency}
                      </p>
                    </div>

                    {isSelected ? (
                      <span className="rounded-full bg-blue-500 px-2.5 py-1 text-xs font-medium text-white">
                        Selected
                      </span>
                    ) : null}
                  </div>

                  <p className="text-sm leading-7 text-slate-400">
                    {product.description ??
                      "No description available for this product."}
                  </p>

                  <ul className="space-y-2 text-sm text-slate-300">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <PiggyBank className="h-4 w-4" />
                <span className="text-sm font-medium">Account setup</span>
              </div>
              <p className="text-sm text-slate-400">
                Your account details are stored directly on the savings account
                model and linked to the selected product.
              </p>
            </div>

            <form key={selected} action={formAction} className="space-y-5">
              <input type="hidden" name="productId" value={selected} />

              <FieldGroup className="gap-5">
                <Field
                  data-invalid={Boolean(state.fieldErrors?.name) || undefined}
                >
                  <FieldLabel className="text-slate-200">
                    Account name
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      name="name"
                      defaultValue={selectedProduct?.name ?? ""}
                      placeholder="Emergency Savings"
                      disabled={!canCreateSavingsAccount}
                      className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                    />
                    <FieldDescription className="text-xs text-slate-500">
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
                  <FieldLabel className="text-slate-200">
                    Description
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      name="description"
                      placeholder="What are you saving for?"
                      disabled={!canCreateSavingsAccount}
                      className="rounded-2xl border-white/10 bg-white/[0.03] text-white"
                    />
                    {state.fieldErrors?.description ? (
                      <FieldError
                        errors={state.fieldErrors.description.map(
                          (message) => ({
                            message,
                          }),
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
                  <FieldLabel className="text-slate-200">
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
                      className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                    />
                    <FieldDescription className="text-xs text-slate-500">
                      This is the target amount for your savings account.
                    </FieldDescription>
                    {state.fieldErrors?.targetAmount ? (
                      <FieldError
                        errors={state.fieldErrors.targetAmount.map(
                          (message) => ({
                            message,
                          }),
                        )}
                      />
                    ) : null}
                  </FieldContent>
                </Field>

                <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <input
                    type="checkbox"
                    name="lockSavings"
                    value="true"
                    disabled={
                      !canCreateSavingsAccount || !selectedProduct?.isLockable
                    }
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Lock className="h-4 w-4 text-blue-200" />
                      Lock this account
                    </div>
                    <p className="text-xs leading-6 text-slate-400">
                      {selectedProduct?.isLockable
                        ? `Locks withdrawals for at least ${selectedProduct.minimumLockDays ?? 0} days.`
                        : "The selected product does not support account locking."}
                    </p>
                    {state.fieldErrors?.lockSavings ? (
                      <FieldError
                        errors={state.fieldErrors.lockSavings.map(
                          (message) => ({
                            message,
                          }),
                        )}
                      />
                    ) : null}
                  </div>
                </label>
              </FieldGroup>

              {state.status === "error" && state.message ? (
                <Alert className="rounded-2xl border border-red-400/20 bg-red-400/10 text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{state.message}</AlertTitle>
                </Alert>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                {!canCreateSavingsAccount ? (
                  <Button asChild variant="outline" className="rounded-2xl">
                    <Link href="/account/dashboard/user/kyc">
                      Complete KYC first
                    </Link>
                  </Button>
                ) : (
                  <div className="text-xs text-slate-500">
                    Product currency: {selectedProduct?.currency ?? "USD"}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!selected || !canCreateSavingsAccount || isPending}
                  className="rounded-2xl bg-blue-500 px-6 hover:bg-blue-600"
                >
                  {isPending ? "Opening..." : "Open savings account"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
