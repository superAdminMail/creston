"use client";

import { useMemo, useState, useTransition } from "react";
import { CircleAlert, Landmark, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createInvestmentOrderBankDepositSubmissionAction } from "@/actions/payment/createInvestmentOrderBankDepositSubmission";

type InvestmentOrderBankDepositFormProps = {
  investmentOrderId: string;
  currency: string;
  amount: number;
  amountPaid: number;
  remainingAmount: number;
  canPay: boolean;
  className?: string;
};

type PaymentSplitMode = "FULL" | "PARTIAL";

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400"
    >
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/40 focus:bg-white/[0.06] ${props.className ?? ""}`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`mt-2 min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/40 focus:bg-white/[0.06] ${props.className ?? ""}`}
    />
  );
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export default function InvestmentOrderBankDepositForm({
  investmentOrderId,
  currency,
  amount,
  amountPaid,
  remainingAmount,
  canPay,
  className,
}: InvestmentOrderBankDepositFormProps) {
  const [isPending, startTransition] = useTransition();

  const [paymentMode, setPaymentMode] = useState<PaymentSplitMode>("FULL");
  const [depositorName, setDepositorName] = useState("");
  const [depositorAccountName, setDepositorAccountName] = useState("");
  const [depositorAccountNo, setDepositorAccountNo] = useState("");
  const [transferReference, setTransferReference] = useState("");
  const [receiptFileId, setReceiptFileId] = useState("");
  const [note, setNote] = useState("");

  const chargePreview = useMemo(() => {
    const total = roundMoney(amount);
    const paid = roundMoney(amountPaid);
    const remaining = roundMoney(remainingAmount);

    if (remaining <= 0 || paid >= total) {
      return {
        amount: 0,
        splitNumber: null as 1 | 2 | null,
        isPartial: false,
        label: `0.00 ${currency}`,
        helper: "This order has already been fully paid.",
      };
    }

    if (paymentMode === "FULL") {
      return {
        amount: remaining,
        splitNumber: null as 1 | 2 | null,
        isPartial: false,
        label: `${remaining.toFixed(2)} ${currency}`,
        helper: `Full payment will submit the remaining balance of ${remaining.toFixed(2)} ${currency}.`,
      };
    }

    if (paid === 0) {
      const half = roundMoney(total / 2);

      return {
        amount: half,
        splitNumber: 1 as const,
        isPartial: true,
        label: `${half.toFixed(2)} ${currency}`,
        helper: `This is the first partial payment. You should pay exactly half of the order amount: ${half.toFixed(2)} ${currency}.`,
      };
    }

    return {
      amount: remaining,
      splitNumber: 2 as const,
      isPartial: true,
      label: `${remaining.toFixed(2)} ${currency}`,
      helper: `This is the second partial payment. You should pay the remaining balance of ${remaining.toFixed(2)} ${currency}.`,
    };
  }, [amount, amountPaid, remainingAmount, paymentMode, currency]);

  const handleSubmit = () => {
    if (!investmentOrderId.trim()) {
      toast.error("Missing investment order id");
      return;
    }

    startTransition(async () => {
      const result = await createInvestmentOrderBankDepositSubmissionAction({
        investmentOrderId,
        usePartialPayment: paymentMode === "PARTIAL",
        depositorName,
        depositorAccountName,
        depositorAccountNo,
        transferReference,
        note,
        receiptFileId,
      });

      if (!result.success) {
        toast.error(result.error || "Unable to submit bank deposit");
        return;
      }

      toast.success("Bank deposit submitted for review");

      setDepositorName("");
      setDepositorAccountName("");
      setDepositorAccountNo("");
      setTransferReference("");
      setReceiptFileId("");
      setNote("");
      setPaymentMode("FULL");
    });
  };

  const partialButtonDescription =
    amountPaid <= 0
      ? `Pay exactly half of the total order amount: ${roundMoney(amount / 2).toFixed(2)} ${currency}.`
      : `Pay the remaining balance as the second partial payment: ${roundMoney(remainingAmount).toFixed(2)} ${currency}.`;

  return (
    <div
      className={`rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 ${className ?? ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-blue-500/10 p-3">
          <Landmark className="h-5 w-5 text-blue-200" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
            Bank deposit submission
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            Submit your transfer details for confirmation
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Submit your bank transfer details and receipt. Admin review is
            required before your investment order is credited.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-[#081125] p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Order amount
            </p>
            <p className="mt-2 text-sm text-white">
              {amount.toFixed(2)} {currency}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Amount paid
            </p>
            <p className="mt-2 text-sm text-white">
              {amountPaid.toFixed(2)} {currency}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Remaining balance
            </p>
            <p className="mt-2 text-sm text-white">
              {remainingAmount.toFixed(2)} {currency}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          Payment type
        </p>

        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setPaymentMode("FULL")}
            disabled={!canPay || isPending || remainingAmount <= 0}
            className={`rounded-2xl border p-4 text-left transition ${
              paymentMode === "FULL"
                ? "border-blue-400/30 bg-blue-500/10"
                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
            }`}
          >
            <p className="text-sm font-semibold text-white">Full payment</p>
            <p className="mt-2 text-sm text-slate-400">
              Submit the full remaining balance of {remainingAmount.toFixed(2)}{" "}
              {currency}.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMode("PARTIAL")}
            disabled={!canPay || isPending || remainingAmount <= 0}
            className={`rounded-2xl border p-4 text-left transition ${
              paymentMode === "PARTIAL"
                ? "border-blue-400/30 bg-blue-500/10"
                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
            }`}
          >
            <p className="text-sm font-semibold text-white">Partial payment</p>
            <p className="mt-2 text-sm text-slate-400">
              {partialButtonDescription}
            </p>
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          <p>
            Selected claimed amount:{" "}
            <span className="font-medium text-white">
              {chargePreview.label}
            </span>
          </p>
          <p className="mt-2 text-xs text-slate-400">{chargePreview.helper}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <FieldLabel htmlFor="depositorName">Depositor name</FieldLabel>
          <TextInput
            id="depositorName"
            value={depositorName}
            onChange={(e) => setDepositorName(e.target.value)}
            placeholder="Enter depositor full name"
            disabled={isPending}
          />
        </div>

        <div>
          <FieldLabel htmlFor="depositorAccountName">
            Depositor account name
          </FieldLabel>
          <TextInput
            id="depositorAccountName"
            value={depositorAccountName}
            onChange={(e) => setDepositorAccountName(e.target.value)}
            placeholder="Enter depositor account name"
            disabled={isPending}
          />
        </div>

        <div>
          <FieldLabel htmlFor="depositorAccountNo">
            Depositor account number
          </FieldLabel>
          <TextInput
            id="depositorAccountNo"
            value={depositorAccountNo}
            onChange={(e) => setDepositorAccountNo(e.target.value)}
            placeholder="Enter depositor account number"
            disabled={isPending}
          />
        </div>

        <div>
          <FieldLabel htmlFor="transferReference">
            Transfer reference
          </FieldLabel>
          <TextInput
            id="transferReference"
            value={transferReference}
            onChange={(e) => setTransferReference(e.target.value)}
            placeholder="Enter bank transfer reference"
            disabled={isPending}
          />
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="receiptFileId">Receipt file id</FieldLabel>
          <TextInput
            id="receiptFileId"
            value={receiptFileId}
            onChange={(e) => setReceiptFileId(e.target.value)}
            placeholder="Enter uploaded receipt file id"
            disabled={isPending}
          />
          <p className="mt-2 text-xs text-slate-500">
            Replace this with your upload flow later. For now, submit the stored
            file asset id here.
          </p>
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="note">Note</FieldLabel>
          <TextArea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any helpful note for admin review"
            disabled={isPending}
          />
        </div>
      </div>

      {!canPay ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            This order is not currently eligible for bank payment submission.
          </span>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canPay || isPending || chargePreview.amount <= 0}
          className="rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting deposit...
            </>
          ) : paymentMode === "FULL" ? (
            "Submit full bank deposit"
          ) : chargePreview.splitNumber === 1 ? (
            "Submit first partial bank deposit"
          ) : (
            "Submit second partial bank deposit"
          )}
        </Button>
      </div>
    </div>
  );
}
