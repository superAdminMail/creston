"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpRight,
  CreditCard,
  Landmark,
  ShieldAlert,
} from "lucide-react";

import { createWithdrawalOrder } from "@/actions/accounts/withdrawal/createWithdrawalOrder";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/formatters/formatters";
import type { WithdrawalSourceOption } from "@/lib/service/getAvailableWithdrawalSource";

type PaymentMethod = {
  id: string;
  type: "BANK" | "CRYPTO";
  bankName?: string | null;
  accountNumber?: string | null;
  network?: string | null;
  address?: string | null;
};

type Props = {
  kycStatus: string;
  paymentMethods: PaymentMethod[];
  withdrawalSources: WithdrawalSourceOption[];
};

export default function WithdrawalsClient({
  kycStatus,
  paymentMethods,
  withdrawalSources,
}: Props) {
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedSourceType, setSelectedSourceType] = useState<
    "SAVINGS_ACCOUNT" | "INVESTMENT_ORDER" | null
  >(withdrawalSources[0]?.type ?? null);
  const [selectedSourceKey, setSelectedSourceKey] = useState<string | null>(
    withdrawalSources[0]
      ? `${withdrawalSources[0].type}:${withdrawalSources[0].id}`
      : null,
  );
  const [state, formAction] = useActionState(createWithdrawalOrder, {
    status: "idle",
  });

  const savingsSource =
    withdrawalSources.find((source) => source.type === "SAVINGS_ACCOUNT") ??
    null;
  const investmentSource =
    withdrawalSources.find((source) => source.type === "INVESTMENT_ORDER") ??
    null;
  const selectedSource =
    (selectedSourceType === "SAVINGS_ACCOUNT"
      ? savingsSource
      : selectedSourceType === "INVESTMENT_ORDER"
        ? investmentSource
        : null) ??
    null;
  const totalAvailableBalance = withdrawalSources.reduce(
    (sum, source) => sum + source.amount,
    0,
  );
  const availableBalanceCurrency = withdrawalSources[0]?.currency ?? "USD";

  const availableBalanceLabel = withdrawalSources.length === 0
    ? "No eligible source available"
    : savingsSource && investmentSource
      ? "Combined available balance across savings and investments"
      : savingsSource
        ? savingsSource.label
        : investmentSource?.label ?? "No eligible source available";

  function mask(value?: string | null) {
    if (!value) return "";
    return `**** ${value.slice(-4)}`;
  }

  function selectSource(type: "SAVINGS_ACCOUNT" | "INVESTMENT_ORDER") {
    const source = withdrawalSources.find((item) => item.type === type);

    setSelectedSourceType(type);

    if (!source) {
      setSelectedSourceKey(null);
      setAmount("");
      return;
    }

    setSelectedSourceKey(`${source.type}:${source.id}`);
    setAmount(String(source.amount));
  }

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Withdrawal request submitted.");
      setAmount("");
      setSelectedMethod(null);
      setSelectedSourceType(withdrawalSources[0]?.type ?? null);
      setSelectedSourceKey(
        withdrawalSources[0]
          ? `${withdrawalSources[0].type}:${withdrawalSources[0].id}`
          : null,
      );
      return;
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  useEffect(() => {
    if (!selectedSourceKey && withdrawalSources[0]) {
      setSelectedSourceType(withdrawalSources[0].type);
      setSelectedSourceKey(
        `${withdrawalSources[0].type}:${withdrawalSources[0].id}`,
      );
    }
  }, [selectedSourceKey, withdrawalSources]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">Withdraw Funds</h1>
        <p className="mt-1 text-sm text-slate-400">
          Transfer funds securely to your preferred method
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
        <p className="text-sm text-slate-400">Available Balance</p>
        <h2 className="mt-2 text-3xl font-bold text-white">
          {formatCurrency(
            totalAvailableBalance,
            availableBalanceCurrency,
          )}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {availableBalanceLabel}
        </p>
      </div>

      {kycStatus !== "VERIFIED" ? (
        <div className="flex gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-500/5 p-4 text-sm text-yellow-400">
          <ShieldAlert className="mt-0.5 h-4 w-4" />
          Complete identity verification to enable withdrawals.
        </div>
      ) : null}

      <form
        action={formAction}
        className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
      >
        <h3 className="font-medium text-white">Request Withdrawals</h3>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => selectSource("SAVINGS_ACCOUNT")}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              selectedSourceType === "SAVINGS_ACCOUNT"
                ? "border-[#3c9ee0] bg-[#3c9ee0]/10 text-[#3c9ee0]"
                : "border-white/10 bg-white/5 text-slate-300"
            }`}
          >
            Withdraw from Savings
          </button>
          <button
            type="button"
            onClick={() => selectSource("INVESTMENT_ORDER")}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              selectedSourceType === "INVESTMENT_ORDER"
                ? "border-[#3c9ee0] bg-[#3c9ee0]/10 text-[#3c9ee0]"
                : "border-white/10 bg-white/5 text-slate-300"
            }`}
          >
            Withdraw from Investments
          </button>
        </div>

        {selectedSource ? (
          <p className="text-xs text-slate-400">
            Selected source: {selectedSource.label} with{" "}
            {formatCurrency(selectedSource.amount, selectedSource.currency)}{" "}
            available.
          </p>
        ) : selectedSourceType ? (
          <p className="text-xs text-slate-400">
            No {selectedSourceType === "SAVINGS_ACCOUNT" ? "savings" : "investment"} balance is currently available for withdrawal.
          </p>
        ) : null}

        <div className="space-y-2">
          <label className="text-xs uppercase text-slate-400">Amount</label>
          <Input
            name="amount"
            placeholder="$0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="border-white/10 text-white/50 bg-white/5 focus:border-[#3c9ee0]"
          />
          <FieldError>{state.fieldErrors?.amount?.[0]}</FieldError>
        </div>

        <div className="space-y-3">
          <label className="text-xs uppercase text-slate-400">
            Payment Method
          </label>

          {paymentMethods.map((method) => {
            const active = selectedMethod === method.id;
            const label =
              method.type === "BANK"
                ? `${method.bankName} ${mask(method.accountNumber)}`
                : `${method.network} ${mask(method.address)}`;

            return (
              <button
                type="button"
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`flex w-full items-center justify-between rounded-xl border p-4 transition ${
                  active
                    ? "border-[#3c9ee0] bg-[#3c9ee0]/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  {method.type === "BANK" ? (
                    <Landmark className="h-4 w-4 text-slate-300" />
                  ) : (
                    <CreditCard className="h-4 w-4 text-slate-300" />
                  )}
                  <span className="text-sm text-white">{label}</span>
                </div>

                {active ? (
                  <span className="text-xs text-[#3c9ee0]">Selected</span>
                ) : null}
              </button>
            );
          })}
        </div>

        <FieldError>{state.fieldErrors?.methodId?.[0]}</FieldError>
        <input type="hidden" name="methodId" value={selectedMethod ?? ""} />
        <input
          type="hidden"
          name="sourceType"
          value={selectedSource?.type ?? ""}
        />
        <input type="hidden" name="sourceId" value={selectedSource?.id ?? ""} />

        <Button
          disabled={
            kycStatus !== "VERIFIED" ||
            !amount ||
            !selectedMethod ||
            !selectedSource ||
            selectedSource.amount <= 0
          }
          className="w-full gap-2 rounded-xl bg-[#3c9ee0]"
        >
          <ArrowUpRight className="h-4 w-4" />
          Withdraw Funds
        </Button>
      </form>
    </div>
  );
}
