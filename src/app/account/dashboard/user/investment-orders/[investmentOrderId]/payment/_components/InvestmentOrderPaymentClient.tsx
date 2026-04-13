"use client";

import Link from "next/link";
import { CircleAlert, Landmark, Wallet } from "lucide-react";

import { InvestmentOrderStatus } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import StartCryptoCheckoutButton from "@/app/account/dashboard/user/_components/StartCryptoCheckoutButton";

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
};

type Props = {
  investmentOrderId: string;
  order: InvestmentOrderPaymentDetails;
  canPay: boolean;
};

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

export default function InvestmentOrderPaymentClient({
  investmentOrderId,
  order,
  canPay,
}: Props) {
  const statusTone =
    order.status === InvestmentOrderStatus.PENDING_PAYMENT
      ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
      : order.status === InvestmentOrderStatus.PARTIALLY_PAID
        ? "border-blue-400/20 bg-blue-400/10 text-blue-300"
        : "border-white/10 bg-white/[0.04] text-slate-300";

  const paymentIcon =
    order.paymentMethodType === "CRYPTO_PROVIDER" ? Wallet : Landmark;

  const PaymentIcon = paymentIcon;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-[#050B1F] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-blue-200">
              <PaymentIcon className="h-3.5 w-3.5" />
              Investment payment
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Choose how you want to pay this order
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Review the order amount, status, plan, and tier before selecting
              a full or partial payment path.
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
                Payment mode
              </p>
              <p className="mt-2 text-sm text-white">
                {order.paymentMethodType
                  ? formatEnumLabel(order.paymentMethodType)
                  : "Not configured"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <StartCryptoCheckoutButton
              investmentOrderId={investmentOrderId}
              disabled={!canPay}
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)]"
            >
              Make full payment
            </StartCryptoCheckoutButton>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-white/10 bg-white/[0.04] px-5 py-3 text-white hover:bg-white/[0.08]"
              asChild
            >
              <Link href={`/account/dashboard/user/investment-orders/${investmentOrderId}/payment/partial`}>
                Partial payment
              </Link>
            </Button>
          </div>

          {!canPay ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                This order is not currently eligible for payment actions.
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
