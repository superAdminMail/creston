"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Landmark, CreditCard, ArrowUpRight, ShieldAlert } from "lucide-react";

type PaymentMethod = {
  id: string;
  type: "bank" | "crypto";
  label: string;
};

export default function WithdrawalsPage() {
  const [kycStatus] = useState<"NOT_STARTED" | "VERIFIED">("NOT_STARTED");
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const balance = 2450.75;

  const paymentMethods: PaymentMethod[] = [
    {
      id: "1",
      type: "bank",
      label: "Chase Bank •••• 6789",
    },
    {
      id: "2",
      type: "crypto",
      label: "BTC GCX •••• Kdl",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 space-y-10">
      {/* 🔥 Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Withdraw Funds
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Transfer funds to your preferred payment method
        </p>
      </div>

      {/* 💰 Balance Card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Available Balance</p>
        <h2 className="text-3xl font-semibold text-muted mt-2">
          ${balance.toLocaleString()}
        </h2>
      </div>

      {/* 🔐 KYC Warning */}
      {kycStatus !== "VERIFIED" && (
        <div className="border border-yellow-300 bg-yellow-50 p-4 rounded-lg flex gap-2 text-sm text-yellow-700">
          <ShieldAlert className="h-4 w-4 mt-0.5" />
          You must complete identity verification before making withdrawals.
        </div>
      )}

      {/* 🔥 Withdrawal Form */}
      <div className="rounded-xl border bg-white p-6 space-y-6">
        <h3 className="font-medium text-muted">Withdrawal Details</h3>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Amount</label>
          <Input
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border bg-forground/5 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <label className="text-sm text-muted-foreground">
            Select Payment Method
          </label>

          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center justify-between p-4 border rounded-lg transition ${
                  selectedMethod === method.id
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  {method.type === "bank" ? (
                    <Landmark className="h-4 w-4" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  <span className="text-sm text-muted">{method.label}</span>
                </div>

                {selectedMethod === method.id && (
                  <span className="text-xs text-blue-600">Selected</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <Button
          disabled={kycStatus !== "VERIFIED" || !amount || !selectedMethod}
          className="w-full gap-2"
        >
          <ArrowUpRight className="h-4 w-4" />
          Withdraw Funds
        </Button>
      </div>

      {/* 📜 Recent Withdrawals */}
      <div className="rounded-xl border bg-white p-6 space-y-4">
        <h3 className="font-medium text-muted">Recent Withdrawals</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Chase Bank •••• 6789</span>
            <span className="text-green-600">$500</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">USDT Wallet</span>
            <span className="text-green-600">$300</span>
          </div>
        </div>
      </div>
    </div>
  );
}
