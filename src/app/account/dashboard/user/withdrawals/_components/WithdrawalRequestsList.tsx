"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Landmark,
  Wallet,
  AlertCircle,
  ReceiptText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { WithdrawalTerminalNotice } from "@/components/withdrawals/WithdrawalTerminalNotice";
import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import type { WithdrawalRequestItemDto } from "@/lib/types/withdrawalRequests";
import { buildWithdrawalCommissionCheckoutUrl } from "@/lib/withdrawals/withdrawalCommissionCheckout";
import {
  isWithdrawalCompletedStatus,
  isWithdrawalTerminalStatus,
} from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";
import { isWithdrawalCommissionSettledStatus } from "@/lib/payments/withdrawals/withdrawalCommissionStatusWorkflow";
import { cn } from "@/lib/utils";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "../../../_components/dashboardSurfaces";

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
    return "Automatic allocation";
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

  return allocations.map((allocation) => {
    const amount = formatCurrency(
      Number(allocation.sourceGrossAmount),
      allocation.currency ?? order.currency,
    );

    return `${allocation.sourceLabel} ${amount}`;
  });
}

function canPayCommission(order: WithdrawalRequestItemDto) {
  return (
    !isWithdrawalTerminalStatus(order.status) &&
    order.hasCommissionFees &&
    !isWithdrawalCommissionSettledStatus(order.commissionStatus) &&
    order.commissionReviewStatus !== "PENDING_REVIEW"
  );
}

function getStatusPresentation(status: string) {
  if (isWithdrawalCompletedStatus(status)) {
    return {
      label: formatEnumLabel(status),
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",
      iconClassName: "text-emerald-600 dark:text-emerald-400",
    };
  }

  if (isWithdrawalTerminalStatus(status)) {
    return {
      label: formatEnumLabel(status),
      icon: AlertCircle,
      className:
        "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300",
      iconClassName: "text-rose-600 dark:text-rose-400",
    };
  }

  return {
    label: formatEnumLabel(status),
    icon: Clock3,
    className:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200",
    iconClassName: "text-amber-700 dark:text-amber-300",
  };
}

export default function WithdrawalRequestsList({ withdrawalOrders }: Props) {
  return (
    <section
      aria-labelledby="withdrawal-history-heading"
      className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "space-y-5 p-4 sm:p-6")}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-300">
              <ReceiptText className="h-4 w-4" />
            </div>
            <h3
              id="withdrawal-history-heading"
              className="text-base font-semibold tracking-tight text-slate-950 dark:text-white"
            >
              Withdrawal history
            </h3>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Track your withdrawal requests and payment progress.
          </p>
        </div>

        {withdrawalOrders.length > 0 ? (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {withdrawalOrders.length}{" "}
            {withdrawalOrders.length === 1 ? "request" : "requests"}
          </span>
        ) : null}
      </div>

      {withdrawalOrders.length > 0 ? (
        <div className="space-y-3">
          {withdrawalOrders.map((order) => {
            const status = getStatusPresentation(order.status);
            const StatusIcon = status.icon;
            const allocations = getAllocationSummary(order);
            const allocationMode = getAllocationModeLabel(order);
            const terminal = isWithdrawalTerminalStatus(order.status);
            const commissionSettled = isWithdrawalCommissionSettledStatus(
              order.commissionStatus,
            );

            return (
              <article
                key={order.id}
                className={cn(
                  "rounded-2xl border border-border/70 bg-white p-4 transition-colors hover:border-sky-200/80 dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-sky-400/20 sm:p-5",
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Withdrawal request
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">
                        ·
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDateLabel(order.requestedAt)}
                      </span>
                    </div>

                    <p className="break-words text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                      {formatCurrency(
                        Number(order.amount),
                        order.currency ?? "USD",
                      )}
                    </p>

                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {getSourceLabel(order)}
                    </p>
                  </div>

                  <span
                    title={status.label}
                    className={cn(
                      "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                      status.className,
                    )}
                  >
                    <StatusIcon
                      className={cn("h-3.5 w-3.5", status.iconClassName)}
                      aria-hidden="true"
                    />
                    {status.label}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-white/[0.035]">
                    <div className="flex items-center gap-2">
                      {order.paymentMethodLabel
                        .toLowerCase()
                        .includes("bank") ? (
                        <Landmark className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      ) : (
                        <Wallet className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      )}
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Payment method
                      </p>
                    </div>

                    <p className="mt-2 break-words text-sm font-medium text-slate-950 dark:text-white">
                      {order.paymentMethodLabel}
                    </p>

                    <p
                      className={cn(
                        "mt-1 text-xs",
                        order.paymentMethodStatus === "UNAVAILABLE"
                          ? "text-amber-700 dark:text-amber-300"
                          : order.paymentMethodStatus === "UPDATED"
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-slate-500 dark:text-slate-400",
                      )}
                    >
                      {order.paymentMethodStatus === "UNAVAILABLE"
                        ? "Update required"
                        : order.paymentMethodStatus === "UPDATED"
                          ? "Updated details submitted"
                          : "Available"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-white/[0.035]">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Request reference
                      </p>
                    </div>

                    <p className="mt-2 break-all text-sm font-medium text-slate-950 dark:text-white">
                      {order.id}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Submitted {formatDateLabel(order.requestedAt)}
                    </p>
                  </div>
                </div>

                {allocationMode || allocations ? (
                  <div className="mt-3 rounded-xl border border-border/60 p-4 dark:border-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Funding breakdown
                      </p>
                      {allocationMode ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600 dark:bg-white/[0.07] dark:text-slate-300">
                          {allocationMode}
                        </span>
                      ) : null}
                    </div>

                    {allocations ? (
                      <div className="mt-3 space-y-2">
                        {allocations.map((allocation, index) => (
                          <div
                            key={`${allocation}-${index}`}
                            className="flex items-center justify-between gap-3 text-xs"
                          >
                            <span className="text-slate-600 dark:text-slate-400">
                              {allocation.split(" ").slice(0, -1).join(" ") ||
                                allocation}
                            </span>
                            <span className="shrink-0 font-medium text-slate-950 dark:text-white">
                              {allocation.split(" ").slice(-1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {terminal ? (
                  <WithdrawalTerminalNotice
                    status={order.status}
                    reason={order.rejectionReason}
                    variant="compact"
                    className="mt-3"
                  />
                ) : order.commissionReviewStatus === "PENDING_REVIEW" &&
                  !commissionSettled ? (
                  <div className="mt-3 rounded-xl border border-amber-200/60 bg-amber-50/70 p-3.5 text-xs text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                    <div className="flex items-start gap-2">
                      <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        <p className="font-semibold">
                          Commission proof under review
                        </p>
                        <p className="mt-1 leading-5">
                          Your submitted withdrawal commission proof is waiting
                          for admin review.
                        </p>
                        {order.commissionSubmittedAmount ? (
                          <p className="mt-2 font-medium">
                            Submitted amount:{" "}
                            {formatCurrency(
                              Number(order.commissionSubmittedAmount),
                              order.currency,
                            )}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

                {order.payoutSnapshot?.withdrawalMode ? (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    {order.payoutSnapshot.withdrawalMode === "EARLY_WITHDRAWAL"
                      ? `Early withdrawal penalty applied: ${formatCurrency(
                          Number(
                            order.payoutSnapshot.earlyWithdrawalPenalty ?? 0,
                          ),
                          order.currency ?? "USD",
                        )}`
                      : "Normal withdrawal request"}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-col gap-2 border-t border-border/60 pt-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-end">
                  {canPayCommission(order) ? (
                    <Button
                      asChild
                      className="h-10 w-full gap-2 rounded-xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 sm:w-auto"
                    >
                      <Link
                        href={buildWithdrawalCommissionCheckoutUrl(order.id)}
                      >
                        Pay commission (Taxes and Platform fees)
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}

                  <Button
                    asChild
                    variant="outline"
                    className="h-10 w-full gap-2 rounded-xl border-border/70 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08] sm:w-auto"
                  >
                    <Link
                      href={`/account/dashboard/user/withdrawals/${order.id}`}
                    >
                      View details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-slate-50/60 px-5 py-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm dark:bg-white/[0.06] dark:text-slate-300">
            <ReceiptText className="h-5 w-5" />
          </div>
          <h4 className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">
            No withdrawal activity yet
          </h4>
          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
            Your withdrawal requests will appear here once you submit your first
            request.
          </p>
        </div>
      )}
    </section>
  );
}
