import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CircleAlert,
  Clock3,
  Coins,
  Layers3,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { InvestmentOrderStatus } from "@/generated/prisma";
import type { UserInvestmentOrdersData } from "@/actions/investment-order/getUserInvestmentOrders";
import { CancelPendingInvestmentOrderButton } from "@/components/account/CancelPendingInvestmentOrderButton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters/formatters";
import {
  formatInvestmentOrderRuntimeStatusLabel,
  isInactiveInvestmentOrderRuntimeStatus,
} from "@/lib/investment/formatInvestmentOrderRuntimeStatusLabel";
import {
  isInvestmentOrderCapitalUpdated,
  isInvestmentOrderUpgraded,
} from "@/lib/investment/investmentOrderUpgrade";
import { cn } from "@/lib/utils";
import type { ElementType } from "react";

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
      return "border-sky-200/70 bg-sky-50 text-sky-800 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-200";
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

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border/50 bg-white/60 p-3 dark:border-white/[0.07] dark:bg-white/[0.025]">
      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <p className="text-[11px] font-medium uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
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

  const isTerminal =
    order.status === InvestmentOrderStatus.CANCELLED ||
    order.status === InvestmentOrderStatus.REJECTED;

  return (
    <article
      id={`order-${order.id}`}
      className="overflow-hidden rounded-2xl border border-border/60 bg-white/75 shadow-sm transition-colors hover:border-border dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-white/20"
    >
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Coins className="h-3.5 w-3.5" />
                Investment order
              </span>

              {isInvestmentOrderUpgraded(order.runtimeStatus, order) && (
                <Badge className="rounded-full border-emerald-200/70 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/10">
                  UPGRADED
                </Badge>
              )}

              {isInvestmentOrderCapitalUpdated(order.runtimeStatus, order) && (
                <Badge className="rounded-full border-sky-200/70 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-800 hover:bg-sky-50 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-200 dark:hover:bg-sky-500/10">
                  CAPITAL UPDATED
                </Badge>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white sm:text-xl">
                {order.plan.name}
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {order.investment.name} <span className="px-1">·</span>{" "}
                {order.investment.typeLabel} <span className="px-1">·</span>{" "}
                {order.plan.periodLabel}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                  getStatusClasses(order.status),
                )}
              >
                {order.statusLabel}
              </span>

              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                  getRuntimeStatusClasses(order.runtimeStatus),
                )}
              >
                {formatInvestmentOrderRuntimeStatusLabel(order.runtimeStatus)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200/60 bg-blue-50/70 p-4 dark:border-blue-400/15 dark:bg-blue-500/[0.07] lg:min-w-[190px]">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-700/70 dark:text-blue-200/70">
              Investment amount
            </p>

            <p className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              {formatCurrency(order.amount, order.currency)}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {order.tier.levelLabel}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem
            icon={Layers3}
            label="Plan tier"
            value={order.tier.levelLabel}
          />

          <DetailItem
            icon={TrendingUp}
            label="Target return"
            value={
              order.tier.returnLabel ?? `${order.tier.roiPercent.toFixed(2)}%`
            }
          />

          <DetailItem
            icon={Clock3}
            label="Plan duration"
            value={order.plan.periodLabel}
          />

          <DetailItem
            icon={CalendarDays}
            label="Date created"
            value={order.createdAt}
          />
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-slate-50/70 p-4 dark:border-white/[0.07] dark:bg-white/[0.025]">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
            <ActionIcon className="h-4 w-4 text-blue-500" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Order update
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
              {statusNote}
            </p>
          </div>
        </div>

        {isInactiveInvestmentOrderRuntimeStatus(order.runtimeStatus) && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200/70 bg-amber-50/80 p-4 dark:border-amber-400/20 dark:bg-amber-500/[0.08]">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />

            <p className="text-sm leading-6 text-amber-900 dark:text-amber-100">
              This investment order is currently inactive. Please contact
              support if you need it reactivated.
            </p>
          </div>
        )}

        {isTerminal && (
          <div className="grid gap-3 xl:grid-cols-2">
            <div className="rounded-xl border border-rose-200/70 bg-rose-50/70 p-4 dark:border-rose-400/20 dark:bg-rose-500/[0.07]">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-700/80 dark:text-rose-200/80">
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

            <div className="rounded-xl border border-border/60 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.025]">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Admin note
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {order.adminNotes ||
                  "No admin note was recorded for this order."}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-border/60 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-end dark:border-white/10 dark:bg-white/[0.015]">
        <Link
          href={order.primaryAction.href}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
        >
          <ActionIcon className="h-4 w-4" />
          {order.primaryAction.label}
        </Link>

        <Link
          href={`/account/dashboard/user/investment-orders/${order.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200/70 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-200 dark:hover:bg-blue-500/15"
        >
          View details
          <ArrowUpRight className="h-4 w-4" />
        </Link>

        {order.status === InvestmentOrderStatus.PENDING_PAYMENT && (
          <CancelPendingInvestmentOrderButton
            orderId={order.id}
            className="w-full sm:w-auto"
          />
        )}
      </div>
    </article>
  );
}
