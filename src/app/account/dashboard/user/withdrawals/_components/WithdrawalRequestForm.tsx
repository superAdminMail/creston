"use client";

import Link from "next/link";
import {
  CreditCard,
  Landmark,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../../_components/dashboardSurfaces";
import type { PaymentMethod } from "../_lib/withdrawal-types";
import { getPaymentMethodLabel } from "../_lib/withdrawal-helpers";

type Props = {
  kycStatus: string;
  paymentMethods: PaymentMethod[];
  amount: string;
  selectedMethod: string | null;
  totalAvailableBalance: number;
  currency: string;
  amountValidationMessage: string | null;
  isAmountValid: boolean;
  isPending: boolean;
  onAmountChange: (value: string) => void;
  onMethodChange: (methodId: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function WithdrawalRequestForm({
  kycStatus,
  paymentMethods,
  amount,
  selectedMethod,
  totalAvailableBalance,
  currency,
  amountValidationMessage,
  isAmountValid,
  isPending,
  onAmountChange,
  onMethodChange,
  onSubmit,
}: Props) {
  const isVerified = kycStatus === "VERIFIED";
  const canWithdrawAll =
    isVerified &&
    totalAvailableBalance > 0 &&
    !isPending &&
    Number(amount) !== totalAvailableBalance;

  return (
    <section aria-labelledby="withdrawal-request-heading" className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          Withdrawal
        </p>
        <h2
          id="withdrawal-request-heading"
          className="text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white"
        >
          Make a withdrawal
        </h2>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          Enter the amount you want to withdraw and choose where you want to
          receive your funds.
        </p>
      </div>

      {!isVerified ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50/80 p-4 text-sm text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold">Verification required</p>
            <p className="mt-1 leading-6">
              Complete identity verification to enable withdrawals.
            </p>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className={cn(DASHBOARD_PAGE_PANEL_CLASS, "space-y-7 p-5 sm:p-6")}
      >
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
              Withdrawal amount
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Enter the amount you would like to withdraw.
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="withdrawal-amount"
                className="text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Amount
              </label>

              <button
                type="button"
                disabled={!canWithdrawAll}
                onClick={() => onAmountChange(String(totalAvailableBalance))}
                className="text-xs font-semibold text-sky-800 transition hover:text-sky-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-sky-300 dark:hover:text-sky-200"
              >
                Withdraw all
              </button>
            </div>

            <Input
              id="withdrawal-amount"
              name="amount"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              aria-invalid={Boolean(amountValidationMessage)}
              className="mt-2 h-12 border-0 bg-transparent px-1 text-2xl font-semibold tracking-tight text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:ring-0 dark:text-white"
            />

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Available: {formatCurrency(totalAvailableBalance, currency)}
              </p>
            </div>

            <FieldError>{amountValidationMessage}</FieldError>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                Receive funds
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Select your preferred payment method.
              </p>
            </div>

            {paymentMethods.length > 0 ? (
              <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                {paymentMethods.length}{" "}
                {paymentMethods.length === 1 ? "method" : "methods"}
              </span>
            ) : null}
          </div>

          {paymentMethods.length > 0 ? (
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const active = selectedMethod === method.id;

                return (
                  <button
                    type="button"
                    key={method.id}
                    onClick={() => onMethodChange(method.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
                      active
                        ? "border-sky-300 bg-sky-50/90 shadow-sm ring-1 ring-sky-200/70 dark:border-sky-400/30 dark:bg-sky-400/10 dark:ring-sky-400/20"
                        : "border-border/70 bg-white/70 hover:border-sky-200 hover:bg-sky-50/50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          active
                            ? "bg-white text-sky-800 dark:bg-sky-400/10 dark:text-sky-300"
                            : "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300",
                        )}
                      >
                        {method.type === "BANK" ? (
                          <Landmark className="h-5 w-5" />
                        ) : (
                          <CreditCard className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-950 dark:text-white">
                          {method.type === "BANK"
                            ? "Bank transfer"
                            : "Crypto wallet"}
                        </p>
                        <p className="mt-1 break-all text-xs leading-5 text-slate-600 dark:text-slate-400">
                          {getPaymentMethodLabel(method)}
                        </p>
                      </div>
                    </div>

                    <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                      {active ? (
                        <CheckCircle2 className="h-5 w-5 text-sky-700 dark:text-sky-300" />
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-slate-300 dark:border-white/20" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              className={cn(
                DASHBOARD_PAGE_SURFACE_CLASS,
                "rounded-2xl border-dashed p-5",
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                <CreditCard className="h-5 w-5" />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">
                No payment method added
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Add a verified bank account or crypto wallet before requesting a
                withdrawal.
              </p>

              <Link
                href="/account/dashboard/user/payment-info"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-800 transition hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-200"
              >
                Add payment method
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        <div className="border-t border-border/60 pt-5 dark:border-white/10">
          <Button
            type="submit"
            disabled={
              !isVerified || isPending || !selectedMethod || !isAmountValid
            }
            className="h-12 w-full gap-2 rounded-2xl bg-[#3c9ee0] font-semibold text-white shadow-sm hover:bg-[#258bd0] disabled:opacity-50"
          >
            {isPending ? "Processing..." : "Continue to review"}
            {!isPending ? <ArrowRight className="h-4 w-4" /> : null}
          </Button>

          <p className="mt-3 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
            You will review your withdrawal details before confirming.
          </p>
        </div>
      </form>
    </section>
  );
}
