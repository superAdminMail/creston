"use client";

import Link from "next/link";
import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WithdrawalTerminalNotice } from "@/components/withdrawals/WithdrawalTerminalNotice";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "../../../_components/dashboardSurfaces";
import type { WithdrawalRequestItemDto } from "@/lib/types/withdrawalRequests";
import { buildWithdrawalCommissionCheckoutUrl } from "@/lib/withdrawals/withdrawalCommissionCheckout";
import {
  isWithdrawalCompletedStatus,
  isWithdrawalTerminalStatus,
} from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";
import { isWithdrawalCommissionSettledStatus } from "@/lib/payments/withdrawals/withdrawalCommissionStatusWorkflow";
import { cn } from "@/lib/utils";

type Props = {
  withdrawalOrders: WithdrawalRequestItemDto[];
};

function getSourceLabel(order: WithdrawalRequestItemDto) {
  return (
    order.payoutSnapshot?.sourceLabel ??
    order.investmentOrder?.investmentPlan?.name ??
    order.investmentAccount?.investmentPlan?.name ??
    "Withdrawal source"
  );
}

function getAllocationModeLabel(order: WithdrawalRequestItemDto) {
  if (order.payoutSnapshot?.allocationMode === "AUTO") {
    return "Auto allocation";
  }

  if (order.payoutSnapshot?.allocationMode === "SINGLE") {
    return "Single source";
  }

  return null;
}

function getAllocationSummary(order: WithdrawalRequestItemDto) {
  const allocations = order.payoutSnapshot?.allocations ?? [];

  if (allocations.length === 0) {
    return null;
  }

  return allocations
    .map((allocation) => {
      const amount = formatCurrency(
        Number(allocation.sourceGrossAmount),
        allocation.currency ?? order.currency,
      );

      return `${allocation.sourceLabel} ${amount}`;
    })
    .join(" · ");
}

function canPayCommission(order: WithdrawalRequestItemDto) {
  return (
    !isWithdrawalTerminalStatus(order.status) &&
    order.hasCommissionFees &&
    !isWithdrawalCommissionSettledStatus(order.commissionStatus) &&
    order.commissionReviewStatus !== "PENDING_REVIEW"
  );
}

export default function WithdrawalRequestsList({ withdrawalOrders }: Props) {
  return (
    <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "space-y-4 p-4 sm:p-5")}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h4 className="text-sm font-medium text-slate-950 dark:text-white">
            Withdrawal Requests
          </h4>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Recent withdrawal submissions and their current status.
          </p>
        </div>
      </div>

      {withdrawalOrders.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {withdrawalOrders.map((order) => (
            <div
              key={order.id}
              className={cn(
                DASHBOARD_PAGE_SURFACE_CLASS,
                "block h-full p-4 transition-colors duration-200 hover:border-sky-300/60 hover:bg-sky-50/70 dark:hover:bg-white/[0.05]",
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-slate-950 dark:text-white">
                    {formatCurrency(Number(order.amount), order.currency ?? "USD")}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    {getSourceLabel(order)}
                  </p>
                </div>
                <span title={formatEnumLabel(order.status)} className="self-start">
                  {isWithdrawalCompletedStatus(order.status) ? (
                    <CheckCircle2
                      className="h-5 w-5 shrink-0 text-emerald-500 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <AlertTriangle
                      className="h-5 w-5 shrink-0 text-rose-500 dark:text-rose-300"
                      aria-hidden="true"
                    />
                  )}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-xs text-slate-400 sm:grid-cols-2">
                <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-3")}>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Payment Method
                  </p>
                  <p className="mt-1 break-words text-sm text-slate-950 dark:text-white">
                    {order.paymentMethodLabel}
                  </p>
                  <p
                    className={`mt-1 text-[10px] uppercase tracking-[0.2em] ${
                      order.paymentMethodStatus === "UNAVAILABLE"
                        ? "text-amber-700 dark:text-amber-300"
                        : order.paymentMethodStatus === "UPDATED"
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {order.paymentMethodStatus === "UNAVAILABLE"
                      ? "Update required"
                      : order.paymentMethodStatus === "UPDATED"
                        ? "Updated details submitted"
                        : "Available"}
                  </p>
                </div>
                <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-3")}>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Requested
                  </p>
                  <p className="mt-1 text-sm text-slate-950 dark:text-white">
                    {formatDateLabel(order.requestedAt)}
                  </p>
                </div>
              </div>

              {getAllocationModeLabel(order) || getAllocationSummary(order) ? (
                <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "mt-3 p-3 text-xs")}>
                  {getAllocationModeLabel(order) ? (
                    <p className="uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      {getAllocationModeLabel(order)}
                    </p>
                  ) : null}
                  {getAllocationSummary(order) ? (
                    <p className="mt-2 leading-5 text-slate-600 dark:text-slate-300">
                      {getAllocationSummary(order)}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {isWithdrawalTerminalStatus(order.status) ? (
                <WithdrawalTerminalNotice
                  status={order.status}
                  reason={order.rejectionReason}
                  variant="compact"
                  className="mt-3"
                />
              ) : order.commissionReviewStatus === "PENDING_REVIEW" &&
                !isWithdrawalCommissionSettledStatus(order.commissionStatus) ? (
                <div className="mt-3 rounded-xl border border-amber-200/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-100">
                  Withdrawal commission proof is waiting for admin review.
                  {order.commissionSubmittedAmount ? (
                    <span className="mt-1 block text-amber-700/80 dark:text-amber-100/80">
                      Submitted amount:{" "}
                      {formatCurrency(
                        Number(order.commissionSubmittedAmount),
                        order.currency,
                      )}
                    </span>
                  ) : null}
                </div>
              ) : null}

              {canPayCommission(order) ? (
                <div className="mt-4">
                  <Button
                    asChild
                    className="w-full rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  >
                    <Link href={buildWithdrawalCommissionCheckoutUrl(order.id)}>
                      Pay commission
                    </Link>
                  </Button>
                </div>
              ) : null}

              <div className="mt-4 flex justify-end">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-border/60 bg-white/75 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08]"
                >
                  <Link href={`/account/dashboard/user/withdrawals/${order.id}`}>
                    View details
                  </Link>
                </Button>
              </div>

              {order.payoutSnapshot?.withdrawalMode ? (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {order.payoutSnapshot.withdrawalMode === "EARLY_WITHDRAWAL"
                    ? `Early withdrawal penalty applied: ${formatCurrency(
                        Number(order.payoutSnapshot.earlyWithdrawalPenalty ?? 0),
                        order.currency ?? "USD",
                      )}`
                    : "Normal withdrawal request"}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "rounded-xl border-dashed p-4 text-sm text-slate-600 dark:text-slate-400")}>
          No withdrawal requests have been submitted yet.
        </div>
      )}
    </div>
  );
}
