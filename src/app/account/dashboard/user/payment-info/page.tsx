"use client";

import { useState } from "react";
import { Plus, CreditCard, Landmark, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaymentMethod = {
  id: string;
  type: "bank" | "crypto";
  isDefault: boolean;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  currency?: string;
  network?: string;
  address?: string;
};

export default function PaymentInfoPage() {
  const [kycStatus] = useState<"NOT_STARTED" | "VERIFIED">("NOT_STARTED");

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "bank",
      bankName: "Access Bank",
      accountName: "Michael Nku",
      accountNumber: "0123456789",
      currency: "USD",
      isDefault: true,
    },
    {
      id: "2",
      type: "crypto",
      network: "BTC",
      address: "TQ9x...8Kdl",
      isDefault: false,
    },
  ]);

  const [showModal, setShowModal] = useState(false);

  const setDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((m) => ({
        ...m,
        isDefault: m.id === id,
      })),
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-2 space-y-10">
      {/* 🔥 Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Payment Information
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your withdrawal and funding methods
          </p>
        </div>

        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {/* 🔐 KYC LOCK */}
      {kycStatus !== "VERIFIED" && (
        <div className="border border-yellow-300 bg-yellow-50 p-4 rounded-lg text-sm text-yellow-700">
          You need to complete identity verification before withdrawals are
          enabled.
        </div>
      )}

      {/* 🔥 Payment Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="relative rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition"
          >
            {/* Default badge */}
            {method.isDefault && (
              <span className="absolute top-4 right-4 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-md">
                Default
              </span>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-muted">
                {method.type === "bank" ? (
                  <Landmark className="h-5 w-5 text-foreground" />
                ) : (
                  <CreditCard className="h-5 w-5 text-foreground" />
                )}
              </div>

              <div>
                <p className="font-medium text-muted">
                  {method.type === "bank" ? method.bankName : "Crypto Wallet"}
                </p>
                <p className="text-xs text-muted">
                  {method.type === "bank" ? "Bank Account" : method.network}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm text-foreground">
              {method.type === "bank" ? (
                <>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Account Name</span>
                    <span className="text-muted">{method.accountName}</span>
                  </p>

                  <p className="flex justify-between">
                    <span className="text-muted-foreground">
                      Account Number
                    </span>
                    <span className="font-mono text-muted">
                      {method.accountNumber}
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Network</span>
                    <span className="text-muted">{method.network}</span>
                  </p>

                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-mono text-muted">
                      {method.address}
                    </span>
                  </p>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-green-600">
                <ShieldCheck className="h-4 w-4" />
                Secure
              </div>

              {!method.isDefault && (
                <button
                  onClick={() => setDefault(method.id)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Star className="h-4 w-4" />
                  Set Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border rounded-xl p-5">
        <p className="text-sm text-muted-foreground mb-2">
          Last Used Payment Method
        </p>
        <p className="text-sm font-medium text-foreground">
          Access Bank •••• 6789
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Add Payment Method</h2>

            <Button className="w-full">Add Bank Account</Button>
            <Button variant="outline" className="w-full text-muted-foreground">
              Add Crypto Wallet
            </Button>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
