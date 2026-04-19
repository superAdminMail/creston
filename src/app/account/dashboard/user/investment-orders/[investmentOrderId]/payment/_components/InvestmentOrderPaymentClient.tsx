"use client";

import { useState } from "react";

import { requestInvestmentOrderBankInfo } from "@/actions/accounts/payments/requestInvestmentOrderBankInfo";
import { CancelPendingInvestmentOrderButton } from "@/components/account/CancelPendingInvestmentOrderButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import PaymentProofModal from "./PaymentProofModal";

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
  partialPaymentAmount,
}: {
  order: InvestmentOrderPaymentDetails;
  partialPaymentAmount: number;
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

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6 md:px-6">
      <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/78 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.92),rgba(5,11,31,0.96))]">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
          {order.plan.name}
        </h2>

        <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <div>Total: {order.amountLabel}</div>
          <div>Paid: {order.amountPaidLabel}</div>
          <div className="font-medium text-sky-700 dark:text-sky-300">
            Remaining: {order.remainingAmountLabel}
          </div>
        </div>
      </div>

      {canPay && (
        <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/78 p-6 space-y-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.92),rgba(5,11,31,0.96))]">
          <h3 className="font-medium text-slate-950 dark:text-white">
            Select Payment
          </h3>

          <div className="flex gap-3">
            <Button
              variant={mode === "FULL" ? "default" : "outline"}
              className={
                mode === "FULL"
                  ? "shadow-[0_14px_30px_rgba(14,165,233,0.18)]"
                  : "border-slate-200/80 bg-white/65 text-slate-600 hover:border-slate-300 hover:bg-white/85 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
              }
              onClick={() => {
                setMode("FULL");
                setAmount(order.remainingAmount);
              }}
            >
              Full Payment
            </Button>

            <Button
              variant={mode === "PARTIAL" ? "default" : "outline"}
              className={
                mode === "PARTIAL"
                  ? "shadow-[0_14px_30px_rgba(14,165,233,0.18)]"
                  : "border-slate-200/80 bg-white/65 text-slate-600 hover:border-slate-300 hover:bg-white/85 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
              }
              onClick={() => {
                setMode("PARTIAL");
                setAmount(partialPaymentAmount);
              }}
            >
              Partial Payment
            </Button>
          </div>

          {mode === "PARTIAL" && (
            <div className="space-y-2">
              <Input
                type="number"
                value={amount + 10}
                max={order.remainingAmount}
                placeholder="Enter amount"
                readOnly
                className="border-slate-200/80 bg-white/70 text-slate-950 placeholder:text-slate-400 shadow-sm backdrop-blur-sm focus-visible:border-sky-300 focus-visible:ring-sky-200 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:border-sky-400/40 dark:focus-visible:ring-sky-400/20"
              />
              <p className="text-slate-600 px-2">
                We only support payments in {order.currency} and two
                installments only with an additional $10 flat fee on each
                installment. Only partial payments are subject to this fee.
              </p>
            </div>
          )}
        </div>
      )}

      {mode && canPay && (
        <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/78 p-6 space-y-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.92),rgba(5,11,31,0.96))]">
          {order.hasBankMethod && order.bankMethod && (
            <>
              <h3 className="font-medium text-slate-950 dark:text-white">
                Bank Transfer Details
              </h3>

              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div>Bank: {order.bankMethod.bankName}</div>
                <div>Account Name: {order.bankMethod.accountName}</div>
                <div>Account Number: {order.bankMethod.accountNumber}</div>
                {order.bankMethod.bankCode && (
                  <div>Bank Code: {order.bankMethod.bankCode}</div>
                )}
              </div>

              {order.bankMethod.instructions && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {order.bankMethod.instructions}
                </p>
              )}

              <Button onClick={() => setShowModal(true)}>
                I&apos;ve made this payment
              </Button>
            </>
          )}

          {!order.hasBankMethod && (
            <div className="space-y-3 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
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

      {order.status === "PENDING_PAYMENT" ? (
        <div className="flex justify-end">
          <CancelPendingInvestmentOrderButton
            orderId={order.id}
            className="w-full sm:w-auto"
          />
        </div>
      ) : null}

      {showModal && (
        <PaymentProofModal
          open={showModal}
          onOpenChange={setShowModal}
          orderId={order.id}
          platformPaymentMethodId={order.bankMethod?.id ?? null}
          currency={order.currency}
          defaultAmount={amount}
          maxAmount={order.remainingAmount}
        />
      )}
    </div>
  );
}
