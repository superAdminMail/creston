"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { requestInvestmentOrderBankInfo } from "@/actions/accounts/payments/requestInvestmentOrderBankInfo";
import { submitInvestmentBankPaymentProof } from "@/actions/accounts/payments/submitInvestmentBankPaymentProof";

export type InvestmentOrderPaymentDetails = {
  id: string;
  amount: number;
  amountPaid: number;
  remainingAmount: number;
  currency: string;
  status: string;

  plan: {
    name: string;
    period: string;
  };

  tier: {
    level: string;
  };

  bankMethod: {
    id: string;
    label: string;
    bankName: string | null;
    bankCode: string | null;
    accountName: string | null;
    accountNumber: string | null;
    instructions: string | null;
  } | null;

  hasBankMethod: boolean;
  hasExistingBankInfoRequest: boolean;

  amountLabel: string;
  amountPaidLabel: string;
  remainingAmountLabel: string;
};

export default function InvestmentOrderPaymentClient({
  order,
}: {
  order: InvestmentOrderPaymentDetails;
}) {
  const [mode, setMode] = useState<"FULL" | "PARTIAL" | null>(null);
  const [amount, setAmount] = useState(order.remainingAmount);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const canPay =
    order.status === "PENDING_PAYMENT" || order.status === "PARTIALLY_PAID";

  async function handleRequestBankInfo() {
    setLoading(true);
    const res = await requestInvestmentOrderBankInfo(order.id);
    setLoading(false);

    if (res.ok) toast.success(res.message);
    else toast.error(res.message);
  }

  async function handleSubmitPayment() {
    if (!order.bankMethod) return;

    setLoading(true);

    const res = await submitInvestmentBankPaymentProof({
      orderId: order.id,
      platformPaymentMethodId: order.bankMethod.id,
      claimedAmount: amount,
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Payment submitted for review");
      setShowModal(false);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* 🔷 ORDER SUMMARY */}
      <div className="rounded-2xl border p-6 bg-white/5 backdrop-blur">
        <h2 className="text-xl font-semibold">{order.plan.name}</h2>

        <div className="mt-4 space-y-2 text-sm">
          <div>Total: {order.amountLabel}</div>
          <div>Paid: {order.amountPaidLabel}</div>
          <div className="font-medium text-blue-500">
            Remaining: {order.remainingAmountLabel}
          </div>
        </div>
      </div>

      {/* 🔷 PAYMENT MODE */}
      {canPay && (
        <div className="rounded-2xl border p-6 space-y-4">
          <h3 className="font-medium">Select Payment</h3>

          <div className="flex gap-3">
            <Button
              variant={mode === "FULL" ? "default" : "outline"}
              onClick={() => {
                setMode("FULL");
                setAmount(order.remainingAmount);
              }}
            >
              Full Payment
            </Button>

            <Button
              variant={mode === "PARTIAL" ? "default" : "outline"}
              onClick={() => setMode("PARTIAL")}
            >
              Partial Payment
            </Button>
          </div>

          {mode === "PARTIAL" && (
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              max={order.remainingAmount}
              placeholder="Enter amount"
            />
          )}
        </div>
      )}

      {/* 🔷 BANK FLOW */}
      {mode && canPay && (
        <div className="rounded-2xl border p-6 space-y-4">
          {/* HAS BANK INFO */}
          {order.hasBankMethod && order.bankMethod && (
            <>
              <h3 className="font-medium">Bank Transfer Details</h3>

              <div className="text-sm space-y-2">
                <div>Bank: {order.bankMethod.bankName}</div>
                <div>Account Name: {order.bankMethod.accountName}</div>
                <div>Account Number: {order.bankMethod.accountNumber}</div>
                {order.bankMethod.bankCode && (
                  <div>Bank Code: {order.bankMethod.bankCode}</div>
                )}
              </div>

              {order.bankMethod.instructions && (
                <p className="text-xs text-muted-foreground">
                  {order.bankMethod.instructions}
                </p>
              )}

              <Button onClick={() => setShowModal(true)}>
                I’ve made this payment
              </Button>
            </>
          )}

          {/* NO BANK INFO */}
          {!order.hasBankMethod && (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Bank details are not available yet.
              </p>

              <Button
                disabled={loading || order.hasExistingBankInfoRequest}
                onClick={handleRequestBankInfo}
              >
                {order.hasExistingBankInfoRequest
                  ? "Request Sent"
                  : "Request Bank Info"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 🔷 MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="font-semibold">Confirm Payment</h3>

            <Input
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              type="number"
            />

            <Button
              onClick={handleSubmitPayment}
              disabled={loading}
              className="w-full"
            >
              Submit Payment Proof
            </Button>

            <Button
              variant="ghost"
              onClick={() => setShowModal(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
