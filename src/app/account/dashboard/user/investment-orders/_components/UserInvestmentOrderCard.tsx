import Link from "next/link";
import { BadgeCheck, CircleAlert, Clock3, Wallet } from "lucide-react";

import { InvestmentOrderStatus } from "@/generated/prisma";
import { CancelPendingInvestmentOrderButton } from "@/components/account/CancelPendingInvestmentOrderButton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters/formatters";
import {
  formatInvestmentOrderRuntimeStatusLabel,
  isInactiveInvestmentOrderRuntimeStatus,
} from "@/lib/investment/formatInvestmentOrderRuntimeStatusLabel";
import { isInvestmentOrderUpgraded } from "@/lib/investment/investmentOrderUpgrade";
import { cn } from "@/lib/utils";
import type { UserInvestmentOrdersData } from "@/actions/investment-order/getUserInvestmentOrders";

type UserInvestmentOrderCardProps = {
  order: UserInvestmentOrdersData["orders"][number];
  siteName: string;
};

function getStatusClasses(status: InvestmentOrderStatus) {
  switch (status) {
    case InvestmentOrderStatus.PENDING_PAYMENT:
      return "border-amber-200/70 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200";
    case InvestmentOrderStatus.CONFIRMED:
      return "border-emerald-200/70 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200";
    case InvestmentOrderStatus.CANCELLED:
      return "border-slate-200/80 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300";
    case InvestmentOrderStatus.REJECTED:
      return "border-rose-200/70 bg-rose-50 text-rose-800 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200";
    case InvestmentOrderStatus.PAID:
    case InvestmentOrderStatus.PARTIALLY_PAID:
    default:
      return "border-sky-200/70 bg-sky-50 text-sky-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-sky-200";
  }
}

function getRuntimeStatusClasses(status: string) {
  switch (status) {
    case "PAUSED":
      return "border-amber-200/70 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200";
    case "ONGOING":
    case "ACTIVE":
      return "border-emerald-200/70 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200";
    default:
      return "border-sky-200/70 bg-sky-50 text-sky-800 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-200";
  }
}

function getStatusNote(order: UserInvestmentOrdersData["orders"][number]) {
  switch (order.status) {
    case InvestmentOrderStatus.PENDING_PAYMENT:
      return "This order has been created and is waiting for payment completion.";
    case InvestmentOrderStatus.CONFIRMED:
      return order.linkedInvestmentAccountId
        ? "This investment has been confirmed and linked to your live investment account."
        : "This investment has been confirmed and is now part of your portfolio workflow.";
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
  siteName,
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

  const statusNote =
    order.status === InvestmentOrderStatus.CONFIRMED &&
    !order.linkedInvestmentAccountId
      ? `This investment has been confirmed and is now part of your ${siteName} portfolio workflow.`
      : getStatusNote(order);

  return (
    <article
      id={`order-${order.id}`}
      className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm transition-colors transition-shadow duration-200 hover:border-border/80 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.05]"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
              {order.plan.name}
            </h3>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium shadow-sm",
                getStatusClasses(order.status),
              )}
            >
              {order.statusLabel}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium shadow-sm",
                getRuntimeStatusClasses(order.runtimeStatus),
              )}
            >
              {formatInvestmentOrderRuntimeStatusLabel(order.runtimeStatus)}
            </span>

            {isInvestmentOrderUpgraded(
              order.runtimeStatus,
              order,
            ) ? (
              <Badge className="rounded-full border-emerald-200/70 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm hover:bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/10">
                UPGRADED
              </Badge>
            ) : null}
          </div>

          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
            {order.investment.name} | {order.investment.typeLabel} |{" "}
            {order.plan.periodLabel}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Amount
              </p>
              <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                {formatCurrency(order.amount, order.currency)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Plan tier
              </p>
              <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                {order.tier.levelLabel}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Target return
              </p>
              <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                {order.tier.returnLabel ?? `${order.tier.roiPercent.toFixed(2)}%`}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Plan period
              </p>
              <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                {order.plan.periodLabel}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Created
              </p>
              <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                {order.createdAt}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-white/75 px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            {statusNote}
          </div>

          {isInactiveInvestmentOrderRuntimeStatus(order.runtimeStatus) ? (
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/90 px-4 py-3 text-sm leading-6 text-amber-900 shadow-sm dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
              This investment order is currently inactive. Please contact
              support if you need it reactivated.
            </div>
          ) : null}

          {order.status === InvestmentOrderStatus.CANCELLED ||
          order.status === InvestmentOrderStatus.REJECTED ? (
            <div className="grid gap-3 xl:grid-cols-2">
                <div className="rounded-2xl border border-rose-200/70 bg-rose-50/90 px-4 py-3 shadow-sm dark:border-rose-400/20 dark:bg-rose-500/10">
                  <p className="text-xs uppercase tracking-[0.14em] text-rose-700/80 dark:text-rose-200/80">
                    {order.status === InvestmentOrderStatus.REJECTED
                      ? "Rejection note"
                      : "Cancellation note"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-rose-950 dark:text-rose-100">
                    {order.cancellationReason ||
                      (order.status === InvestmentOrderStatus.REJECTED
                        ? "No rejection reason was recorded."
                        : "No cancellation reason was recorded.")}
                  </p>
                </div>

              <div className="rounded-2xl border border-border/60 bg-white/75 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Admin note
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {order.adminNotes ||
                    "No admin note was recorded for this order."}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[14rem] lg:pl-6">
          <Link
            href={order.primaryAction.href}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-border/80 hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            <ActionIcon className="h-4 w-4" />
            {order.primaryAction.label}
          </Link>

          <Link
            href={`/account/dashboard/user/investment-orders/${order.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-200/70 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-100 hover:text-sky-950 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200 dark:hover:bg-sky-400/15 dark:hover:text-white"
          >
            View details
          </Link>

          {order.status === InvestmentOrderStatus.PENDING_PAYMENT ? (
            <CancelPendingInvestmentOrderButton
              orderId={order.id}
              className="w-full"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
