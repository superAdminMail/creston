"use client";

import Link from "next/link";
import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WithdrawalRequestItemDto } from "@/lib/types/withdrawalRequests";
import { buildWithdrawalCommissionCheckoutUrl } from "@/lib/withdrawals/withdrawalCommissionCheckout";
import { isWithdrawalTerminalStatus } from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";
import { isWithdrawalCommissionSettledStatus } from "@/lib/payments/withdrawals/withdrawalCommissionStatusWorkflow";

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
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div>
        <h4 className="text-sm font-medium text-white">Withdrawal Requests</h4>
        <p className="mt-1 text-xs text-slate-500">
          Recent withdrawal submissions and their current status.
        </p>
      </div>

      {withdrawalOrders.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {withdrawalOrders.map((order) => (
            <div
              key={order.id}
              className="block rounded-2xl border border-white/10 bg-[#09111f]/70 p-4 transition hover:border-[#3c9ee0]/40 hover:bg-[#0d1729]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    {formatCurrency(Number(order.amount), order.currency ?? "USD")}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {getSourceLabel(order)}
                  </p>
                </div>
                <span title={formatEnumLabel(order.status)}>
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-emerald-400"
                    aria-hidden="true"
                  />
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-xs text-slate-400 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Payment Method
                  </p>
                  <p className="mt-1 text-sm text-slate-200">
                    {order.paymentMethodLabel}
                  </p>
                  <p
                    className={`mt-1 text-[10px] uppercase tracking-[0.2em] ${
                      order.paymentMethodStatus === "UNAVAILABLE"
                        ? "text-amber-300"
                        : order.paymentMethodStatus === "UPDATED"
                          ? "text-emerald-300"
                          : "text-slate-500"
                    }`}
                  >
                    {order.paymentMethodStatus === "UNAVAILABLE"
                      ? "Update required"
                      : order.paymentMethodStatus === "UPDATED"
                        ? "Updated details submitted"
                        : "Available"}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Requested
                  </p>
                  <p className="mt-1 text-sm text-slate-200">
                    {formatDateLabel(order.requestedAt)}
                  </p>
                </div>
              </div>

              {getAllocationModeLabel(order) || getAllocationSummary(order) ? (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300">
                  {getAllocationModeLabel(order) ? (
                    <p className="uppercase tracking-[0.2em] text-slate-500">
                      {getAllocationModeLabel(order)}
                    </p>
                  ) : null}
                  {getAllocationSummary(order) ? (
                    <p className="mt-2 leading-5 text-slate-300">
                      {getAllocationSummary(order)}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {isWithdrawalTerminalStatus(order.status) ? (
                <div className="mt-3 rounded-xl border border-rose-200/40 bg-rose-500/10 p-3 text-xs text-rose-100">
                  This withdrawal request is no longer active.
                  {order.rejectionReason ? (
                    <span className="block mt-1 text-rose-100/80">
                      Reason: {order.rejectionReason}
                    </span>
                  ) : null}
                </div>
              ) : order.commissionReviewStatus === "PENDING_REVIEW" &&
                !isWithdrawalCommissionSettledStatus(order.commissionStatus) ? (
                <div className="mt-3 rounded-xl border border-amber-200/40 bg-amber-500/10 p-3 text-xs text-amber-100">
                  Withdrawal commission proof is waiting for admin review.
                  {order.commissionSubmittedAmount ? (
                    <span className="block mt-1 text-amber-100/80">
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
                  className="rounded-full border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                >
                  <Link href={`/account/dashboard/user/withdrawals/${order.id}`}>
                    View details
                  </Link>
                </Button>
              </div>

              {order.payoutSnapshot?.withdrawalMode ? (
                <p className="mt-3 text-xs text-slate-500">
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
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
          No withdrawal requests have been submitted yet.
        </div>
      )}
    </div>
  );
}
