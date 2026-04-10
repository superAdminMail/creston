"use client";

import { useState } from "react";
import { Plus, CreditCard, Landmark, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setDefaultPaymentMethod } from "@/actions/accounts/payments/setDefaultPaymentMethod";

type PaymentMethod = {
  id: string;
  type: "BANK" | "CRYPTO";
  isDefault: boolean;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  network?: string | null;
  address?: string | null;
};

type Props = {
  initialMethods: PaymentMethod[];
  kycStatus: "NOT_STARTED" | "VERIFIED" | "PENDING_REVIEW" | "REJECTED";
};

export default function PaymentInfoClient({
  initialMethods,
  kycStatus,
}: Props) {
  const [paymentMethods, setPaymentMethods] = useState(initialMethods);
  const [showModal, setShowModal] = useState(false);

  const handleLocalDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((m) => ({
        ...m,
        isDefault: m.id === id,
      })),
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Payment Methods</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your withdrawal and funding destinations
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          className="gap-2 rounded-xl bg-[#3c9ee0] hover:bg-[#2f8bd0]"
        >
          <Plus className="h-4 w-4" />
          Add Method
        </Button>
      </div>

      {/* KYC Warning */}
      {kycStatus === "NOT_STARTED" && (
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/5 p-4 text-sm text-yellow-400">
          Complete verification to enable withdrawals
        </div>
      )}

      {kycStatus === "PENDING_REVIEW" && (
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/5 p-4 text-sm text-yellow-400">
          Verification in progress...
        </div>
      )}

      {kycStatus === "REJECTED" && (
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/5 p-4 text-sm text-yellow-400">
          Verification failed. Please retry.
        </div>
      )}

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl hover:border-white/20 transition"
          >
            {/* Glow */}
            <div className="absolute -top-10 -right-10 h-32 w-32 bg-[#3c9ee0]/20 blur-3xl rounded-full" />

            {/* Default Badge */}
            {method.isDefault && (
              <span className="absolute top-4 right-4 text-[10px] bg-[#3c9ee0]/10 border border-[#3c9ee0]/20 text-[#3c9ee0] px-2 py-1 rounded-full">
                Default
              </span>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                {method.type === "BANK" ? (
                  <Landmark className="h-5 w-5 text-white" />
                ) : (
                  <CreditCard className="h-5 w-5 text-white" />
                )}
              </div>

              <div>
                <p className="font-medium text-white">
                  {method.type === "BANK" ? method.bankName : "Crypto Wallet"}
                </p>
                <p className="text-xs text-slate-400">
                  {method.type === "BANK" ? "Bank Account" : method.network}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              {method.type === "BANK" ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account Name</span>
                    <span className="text-white">{method.accountName}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Account Number</span>
                    <span className="font-mono text-white">
                      {method.accountNumber}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Network</span>
                    <span className="text-white">{method.network}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Address</span>
                    <span className="font-mono text-white">
                      {method.address}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Secure
              </div>

              {!method.isDefault && (
                <form action={setDefaultPaymentMethod}>
                  <input type="hidden" name="id" value={method.id} />

                  <button
                    onClick={() => handleLocalDefault(method.id)}
                    className="flex items-center gap-1 text-xs text-[#3c9ee0] hover:underline"
                  >
                    <Star className="h-4 w-4" />
                    Set Default
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Add Payment Method
            </h2>

            <Button className="w-full rounded-xl bg-[#3c9ee0] hover:bg-[#2f8bd0]">
              Add Bank Account
            </Button>

            <Button
              variant="outline"
              className="w-full text-slate-400 border-white/10"
            >
              Add Crypto Wallet
            </Button>

            <Button
              variant="ghost"
              className="w-full text-red-400"
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
