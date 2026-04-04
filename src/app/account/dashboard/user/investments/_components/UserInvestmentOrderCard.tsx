import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CircleAlert,
  Clock3,
  Wallet,
} from "lucide-react";

import { InvestmentOrderStatus } from "@/generated/prisma";
import { formatCurrency } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";
import type { UserInvestmentOrdersData } from "@/actions/investment-order/getUserInvestmentOrders";

type UserInvestmentOrderCardProps = {
  order: UserInvestmentOrdersData["orders"][number];
};

function getStatusClasses(status: InvestmentOrderStatus) {
  switch (status) {
    case InvestmentOrderStatus.PENDING_PAYMENT:
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";
    case InvestmentOrderStatus.PENDING_CONFIRMATION:
      return "border-blue-400/20 bg-blue-400/10 text-blue-200";
    case InvestmentOrderStatus.CONFIRMED:
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    case InvestmentOrderStatus.CANCELLED:
      return "border-slate-400/20 bg-slate-400/10 text-slate-300";
    case InvestmentOrderStatus.REJECTED:
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";
    case InvestmentOrderStatus.PAID:
    case InvestmentOrderStatus.PARTIALLY_PAID:
    default:
      return "border-white/10 bg-white/[0.04] text-slate-200";
  }
}

function getStatusNote(order: UserInvestmentOrdersData["orders"][number]) {
  switch (order.status) {
    case InvestmentOrderStatus.PENDING_PAYMENT:
      return "This order has been created and is waiting for payment completion.";
    case InvestmentOrderStatus.PENDING_CONFIRMATION:
      return "Payment has been received and the order is now awaiting confirmation.";
    case InvestmentOrderStatus.CONFIRMED:
      return order.linkedInvestmentAccountId
        ? "This investment has been confirmed and linked to your live investment account."
        : "This investment has been confirmed and is now part of your Havenstone portfolio workflow.";
    case InvestmentOrderStatus.CANCELLED:
      return "This investment order has been cancelled and is no longer progressing.";
    case InvestmentOrderStatus.REJECTED:
      return "This investment order was reviewed and could not be approved.";
    case InvestmentOrderStatus.PAID:
      return "Payment has been recorded for this order and processing is continuing.";
    case InvestmentOrderStatus.PARTIALLY_PAID:
    default:
      return "This order has partial payment activity and still needs additional review.";
  }
}

export function UserInvestmentOrderCard({
  order,
}: UserInvestmentOrderCardProps) {
  const ActionIcon =
    order.status === InvestmentOrderStatus.CONFIRMED &&
    order.linkedInvestmentAccountId
      ? Wallet
      : order.status === InvestmentOrderStatus.CONFIRMED
        ? BadgeCheck
        : order.status === InvestmentOrderStatus.PENDING_PAYMENT
          ? Clock3
          : CircleAlert;

  return (
    <article
      id={`order-${order.id}`}
      className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5 transition-all duration-200 hover:border-white/12 hover:bg-white/[0.04]"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-white">
              {order.plan.name}
            </h3>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                getStatusClasses(order.status),
              )}
            >
              {order.statusLabel}
            </span>
          </div>

          <p className="text-sm leading-6 text-slate-400">
            {order.investment.name} | {order.investment.typeLabel} |{" "}
            {order.plan.categoryLabel}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Amount
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {formatCurrency(order.amount, order.currency)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Plan tier
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {order.tier.levelLabel}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Target ROI
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {order.tier.roiPercent.toFixed(2)}%
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Plan period
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {order.plan.periodLabel}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Created
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {order.createdAt}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#0b1229]/55 px-4 py-3 text-sm leading-6 text-slate-300">
            {getStatusNote(order)}
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[14rem] lg:pl-6">
          <Link
            href={order.primaryAction.href}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07] hover:text-white"
          >
            <ActionIcon className="h-4 w-4" />
            {order.primaryAction.label}
          </Link>

          {order.status === InvestmentOrderStatus.PENDING_PAYMENT ? (
            <Link
              href="/account/dashboard/user/investments/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/8 bg-transparent px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-white/12 hover:bg-white/[0.04] hover:text-white"
            >
              Start another investment
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
