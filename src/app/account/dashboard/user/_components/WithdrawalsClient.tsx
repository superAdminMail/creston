"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Landmark, CreditCard, ArrowUpRight, ShieldAlert } from "lucide-react";
import { createWithdrawalOrder } from "@/actions/accounts/withdrawal/createWithdrawalOrder";

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
  balance: number;
};

export default function WithdrawalsClient({
  kycStatus,
  paymentMethods,
  balance,
}: Props) {
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  function mask(value?: string | null) {
    if (!value) return "";
    return "•••• " + value.slice(-4);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Withdraw Funds</h1>
        <p className="text-sm text-slate-400 mt-1">
          Transfer funds securely to your preferred method
        </p>
      </div>

      {/* Balance */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
        <p className="text-sm text-slate-400">Available Balance</p>
        <h2 className="text-3xl font-bold text-white mt-2">
          ${balance.toLocaleString()}
        </h2>
      </div>

      {/* KYC */}
      {kycStatus !== "VERIFIED" && (
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/5 p-4 flex gap-2 text-sm text-yellow-400">
          <ShieldAlert className="h-4 w-4 mt-0.5" />
          Complete identity verification to enable withdrawals.
        </div>
      )}

      {/* Form */}
      <form
        action={createWithdrawalOrder}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-6"
      >
        <h3 className="font-medium text-white">Withdrawal Details</h3>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase">Amount</label>
          <Input
            name="amount"
            placeholder="$0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-white/5 border-white/10 focus:border-[#3c9ee0]"
          />
        </div>

        {/* Methods */}
        <div className="space-y-3">
          <label className="text-xs text-slate-400 uppercase">
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
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition ${
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

                {active && (
                  <span className="text-xs text-[#3c9ee0]">Selected</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Hidden input */}
        <input type="hidden" name="methodId" value={selectedMethod ?? ""} />

        {/* Submit */}
        <Button
          disabled={kycStatus !== "VERIFIED" || !amount || !selectedMethod}
          className="w-full gap-2 rounded-xl bg-[#3c9ee0]"
        >
          <ArrowUpRight className="h-4 w-4" />
          Withdraw Funds
        </Button>
      </form>
    </div>
  );
}
