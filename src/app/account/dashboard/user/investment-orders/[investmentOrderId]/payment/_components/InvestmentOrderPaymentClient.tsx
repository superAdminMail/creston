"use client";

import { useMemo, useState } from "react";
import { CircleAlert, Landmark, Wallet } from "lucide-react";

import { InvestmentOrderStatus } from "@/generated/prisma";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import InvestmentOrderBankDepositForm from "@/app/account/dashboard/user/_components/InvestmentOrderBankDepositForm";

export type InvestmentOrderPaymentDetails = {
  id: string;
  amount: number;
  amountPaid: number;
  remainingAmount: number;
  currency: string;
  status: InvestmentOrderStatus;
  paymentMethodType: string | null;
  amountLabel: string;
  remainingAmountLabel: string;
  plan: {
    id: string;
    name: string;
    period: string;
  };
  tier: {
    id: string;
    level: string;
    minAmount: number;
    maxAmount: number;
    roiPercent: number;
  };
  bankMethod: {
    id: string;
    label: string;
    bankName: string | null;
    accountName: string | null;
    accountNumber: string | null;
    instructions: string | null;
  } | null;
};

type Props = {
  order: InvestmentOrderPaymentDetails;
};

type PaymentSplitMode = "FULL" | "PARTIAL" | null;
type PaymentMethodMode = "BANK" | "CRYPTO" | null;

function PaymentSummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{helper}</p>
    </div>
  );
}

export default function InvestmentOrderPaymentClient({ order }: Props) {
  const [selectedSplit, setSelectedSplit] = useState<PaymentSplitMode>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodMode>(null);

  const statusTone =
    order.status === InvestmentOrderStatus.PENDING_PAYMENT
      ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
      : order.status === InvestmentOrderStatus.PARTIALLY_PAID
        ? "border-blue-400/20 bg-blue-400/10 text-blue-300"
        : "border-white/10 bg-white/[0.04] text-slate-300";

  const canPay =
    order.remainingAmount > 0 &&
    order.status !== InvestmentOrderStatus.PAID &&
    order.status !== InvestmentOrderStatus.CONFIRMED &&
    order.status !== InvestmentOrderStatus.CANCELLED &&
    order.status !== InvestmentOrderStatus.REJECTED;

  const selectedAmountLabel = useMemo(() => {
    if (selectedSplit === "FULL") {
      return `${order.remainingAmount.toFixed(2)} ${order.currency}`;
    }

    if (selectedSplit === "PARTIAL") {
      if (order.amountPaid <= 0) {
        return `${(order.amount / 2).toFixed(2)} ${order.currency}`;
      }

      return `${order.remainingAmount.toFixed(2)} ${order.currency}`;
    }

    return null;
  }, [order]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-[#050B1F] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-blue-200">
              <Landmark className="h-3.5 w-3.5" />
              Investment payment
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Investment order payment
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Choose your payment amount first, then select how you want to pay
              on the same page.
            </p>
          </div>

          <div
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusTone}`}
          >
            {formatEnumLabel(order.status)}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <PaymentSummaryCard
            label="Order amount"
            value={order.amountLabel}
            helper={`Total planned investment amount for order ${order.id}.`}
          />
          <PaymentSummaryCard
            label="Remaining balance"
            value={order.remainingAmountLabel}
            helper="The unpaid balance that can still be processed."
          />
          <PaymentSummaryCard
            label="Plan"
            value={order.plan.name}
            helper={`Plan period: ${formatEnumLabel(order.plan.period)}`}
          />
          <PaymentSummaryCard
            label="Plan tier"
            value={formatEnumLabel(order.tier.level)}
            helper={`ROI: ${order.tier.roiPercent.toFixed(2)}%`}
          />
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Amount paid
              </p>
              <p className="mt-2 text-sm text-white">
                {order.amountPaid.toFixed(2)} {order.currency}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Tier range
              </p>
              <p className="mt-2 text-sm text-white">
                {order.tier.minAmount.toFixed(2)} -{" "}
                {order.tier.maxAmount.toFixed(2)} {order.currency}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Payment configuration
              </p>
              <p className="mt-2 text-sm text-white">
                {order.paymentMethodType
                  ? formatEnumLabel(order.paymentMethodType)
                  : "Not configured"}
              </p>
            </div>
          </div>

          {!canPay ? (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>This order is not currently eligible for payment.</span>
            </div>
          ) : null}
        </div>

        {canPay ? (
          <div className="mt-6 space-y-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Step 1
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">
                Choose payment amount
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Select whether you want to pay the full remaining balance or use
                a maximum two-part partial payment.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSplit("FULL");
                    setSelectedMethod(null);
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedSplit === "FULL"
                      ? "border-blue-400/30 bg-blue-500/10"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                  }`}
                >
                  <p className="text-sm font-semibold text-white">
                    Full payment
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Pay the full remaining balance of{" "}
                    {order.remainingAmount.toFixed(2)} {order.currency}.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedSplit("PARTIAL");
                    setSelectedMethod(null);
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedSplit === "PARTIAL"
                      ? "border-blue-400/30 bg-blue-500/10"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                  }`}
                >
                  <p className="text-sm font-semibold text-white">
                    Partial payment
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    First partial is half of the total amount. Second partial is
                    the remaining balance.
                  </p>
                </button>
              </div>

              {selectedAmountLabel ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  Selected amount:{" "}
                  <span className="font-medium text-white">
                    {selectedAmountLabel}
                  </span>
                </div>
              ) : null}
            </div>

            {selectedSplit ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Step 2
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  Choose payment method
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  After selecting your payment amount, choose how you want to
                  continue.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod("BANK")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selectedMethod === "BANK"
                        ? "border-blue-400/30 bg-blue-500/10"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Landmark className="h-5 w-5 text-white" />
                      <p className="text-sm font-semibold text-white">
                        Bank transfer
                      </p>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">
                      Submit your bank deposit and receipt for admin review.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod("CRYPTO")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selectedMethod === "CRYPTO"
                        ? "border-blue-400/30 bg-blue-500/10"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-white" />
                      <p className="text-sm font-semibold text-white">
                        Pay with crypto
                      </p>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">
                      Crypto wallet payment will be connected later.
                    </p>
                  </button>
                </div>
              </div>
            ) : null}

            {selectedSplit && selectedMethod === "BANK" ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Step 3
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  Submit bank deposit
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Use the bank details below, make your transfer, then submit
                  your confirmation details on this page.
                </p>

                {order.bankMethod ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-[#081125] p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Bank label
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {order.bankMethod.label}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Bank name
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {order.bankMethod.bankName || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Account name
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {order.bankMethod.accountName || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Account number
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {order.bankMethod.accountNumber || "—"}
                        </p>
                      </div>
                    </div>

                    {order.bankMethod.instructions ? (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Instructions
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {order.bankMethod.instructions}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-5">
                  <InvestmentOrderBankDepositForm
                    investmentOrderId={order.id}
                    currency={order.currency}
                    amount={order.amount}
                    amountPaid={order.amountPaid}
                    remainingAmount={order.remainingAmount}
                    canPay={canPay}
                  />
                </div>
              </div>
            ) : null}

            {selectedSplit && selectedMethod === "CRYPTO" ? (
              <div className="rounded-[1.5rem] border border-amber-400/15 bg-amber-400/10 p-5 text-sm text-amber-100">
                <div className="flex items-start gap-3">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">
                      Crypto payment is not active yet
                    </p>
                    <p className="mt-2 leading-6">
                      You can keep this selection flow in place, but the actual
                      Paymento/Electrum crypto path can be wired later.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
