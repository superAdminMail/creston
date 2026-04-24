"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import type { AdminWithdrawalItem } from "@/lib/service/getAdminWithdrawals";
import { cn } from "@/lib/utils";

type WithdrawalStatusFilter =
  | "all"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

const statusFilters: Array<{ label: string; value: WithdrawalStatusFilter }> = [
  { label: "All withdrawals", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const statusGroups: Record<WithdrawalStatusFilter, string[]> = {
  all: [],
  PENDING: ["PENDING"],
  APPROVED: ["APPROVED", "PROCESSING", "COMPLETED"],
  REJECTED: ["REJECTED"],
  CANCELLED: ["CANCELLED"],
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function matchesStatusFilter(
  status: string,
  filter: WithdrawalStatusFilter,
) {
  if (filter === "all") return true;

  return statusGroups[filter].includes(status);
}

function getPayoutMethodLabel(withdrawal: AdminWithdrawalItem) {
  if (!withdrawal.payoutMethod) {
    return "No payout method";
  }

  if (withdrawal.payoutMethod.type === "BANK") {
    return [
      withdrawal.payoutMethod.bankName,
      withdrawal.payoutMethod.accountName,
      withdrawal.payoutMethod.accountNumber
        ? `**** ${withdrawal.payoutMethod.accountNumber.slice(-4)}`
        : null,
    ]
      .filter(Boolean)
      .join(" - ");
  }

  return [
    formatEnumLabel(withdrawal.payoutMethod.type),
    withdrawal.payoutMethod.network,
    withdrawal.payoutMethod.address,
  ]
    .filter(Boolean)
    .join(" - ");
}

function getStatusTone(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-amber-500/10 text-amber-300 border-amber-400/20";
    case "APPROVED":
      return "bg-sky-500/10 text-sky-300 border-sky-400/20";
    case "PROCESSING":
      return "bg-violet-500/10 text-violet-300 border-violet-400/20";
    case "COMPLETED":
      return "bg-emerald-500/10 text-emerald-300 border-emerald-400/20";
    case "REJECTED":
      return "bg-red-500/10 text-red-300 border-red-400/20";
    case "CANCELLED":
      return "bg-slate-500/10 text-slate-300 border-slate-400/20";
    default:
      return "bg-white/10 text-slate-300 border-white/10";
  }
}

export default function AdminWithdrawalsClient({
  withdrawals,
}: {
  withdrawals: AdminWithdrawalItem[];
}) {
  const [statusFilter, setStatusFilter] =
    useState<WithdrawalStatusFilter>("all");

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((withdrawal) =>
      matchesStatusFilter(withdrawal.status, statusFilter),
    );
  }, [statusFilter, withdrawals]);

  const hasActiveFilters = statusFilter !== "all";

  const counts = useMemo(() => {
    return statusFilters.reduce<Record<WithdrawalStatusFilter, number>>(
      (acc, option) => {
        if (option.value === "all") {
          acc.all = withdrawals.length;
          return acc;
        }

        acc[option.value] = withdrawals.filter((withdrawal) =>
          matchesStatusFilter(withdrawal.status, option.value),
        ).length;

        return acc;
      },
      {
        all: withdrawals.length,
        PENDING: 0,
        APPROVED: 0,
        REJECTED: 0,
        CANCELLED: 0,
      },
    );
  }, [withdrawals]);

  function clearFilters() {
    setStatusFilter("all");
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300/80">
              Admin Operations
            </p>
            <h1 className="text-2xl font-semibold text-white">Withdrawals</h1>
            <p className="max-w-3xl text-sm text-slate-400">
              Review withdrawal requests, inspect payout details, and track
              lifecycle status across pending, approved, rejected, and
              cancelled requests.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {statusFilters.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  statusFilter === option.value
                    ? "border-sky-400/30 bg-sky-500/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      statusFilter === option.value
                        ? "text-white"
                        : "text-slate-200",
                    )}
                  >
                    {option.label}
                  </span>
                  <Badge
                    variant="secondary"
                    className="border-white/10 bg-white/10 text-slate-200"
                  >
                    {option.value === "all" ? counts.all : counts[option.value]}
                  </Badge>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-400">
              Showing {filteredWithdrawals.length} of {withdrawals.length}{" "}
              withdrawal requests
            </p>

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:bg-white/5 hover:text-white"
                onClick={clearFilters}
              >
                Reset filters
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
        <CardContent className="p-0">
          <div className="hidden overflow-hidden rounded-[1.5rem] lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Requester</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Payout Method</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Fees</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Requested</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-white/[0.04]">
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="font-medium text-white">
                            {withdrawal.requester.name ?? "Unnamed investor"}
                          </div>
                          <div className="text-sm text-slate-400">
                            {withdrawal.requester.email ?? "Unknown email"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-slate-200">
                            {withdrawal.sourceLabel}
                          </div>
                          <div className="text-xs text-slate-500">
                            Ref:{" "}
                            {withdrawal.reference ??
                              withdrawal.externalReference ??
                              withdrawal.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-300">
                        {getPayoutMethodLabel(withdrawal)}
                      </td>
                      <td className="px-6 py-5 font-medium text-emerald-300">
                        {formatCurrency(withdrawal.amount, withdrawal.currency)}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-300">
                        {withdrawal.hasCommissionFees ? (
                          withdrawal.sourceType === "INVESTMENT_ORDER" ? (
                            <div className="space-y-1">
                              <p className="text-slate-200">
                                Commission: {withdrawal.commissionPercent}%
                              </p>
                            </div>
                          ) : withdrawal.savingsFeeAmount != null ? (
                            <div className="space-y-1">
                              <p className="text-slate-200">
                                Savings fee:{" "}
                                {formatCurrency(
                                  withdrawal.savingsFeeAmount,
                                  withdrawal.currency,
                                )}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-500">Not available</span>
                          )
                        ) : (
                          <span className="text-slate-500">No commission fees</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <Badge
                          variant="secondary"
                          className={cn("border", getStatusTone(withdrawal.status))}
                        >
                          {formatEnumLabel(withdrawal.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-400">
                        {formatDateTime(withdrawal.requestedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredWithdrawals.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500">
                No withdrawals found for the selected filter.
              </div>
            ) : null}
          </div>

          <div className="space-y-4 p-4 lg:hidden">
            {filteredWithdrawals.map((withdrawal) => (
              <Card
                key={withdrawal.id}
                className="border-white/8 bg-white/[0.04] backdrop-blur-xl"
              >
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium text-white">
                        {withdrawal.requester.name ?? "Unnamed investor"}
                      </p>
                      <p className="text-sm text-slate-400">
                        {withdrawal.requester.email ?? "Unknown email"}
                      </p>
                    </div>

                    <Badge
                      variant="secondary"
                      className={cn("border", getStatusTone(withdrawal.status))}
                    >
                      {formatEnumLabel(withdrawal.status)}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-slate-300">
                    <p>
                      <span className="text-slate-500">Source: </span>
                      {withdrawal.sourceLabel}
                    </p>
                    <p>
                      <span className="text-slate-500">Payout method: </span>
                      {getPayoutMethodLabel(withdrawal)}
                    </p>
                    <p>
                      <span className="text-slate-500">Reference: </span>
                      {withdrawal.reference ??
                        withdrawal.externalReference ??
                        withdrawal.id}
                    </p>
                    <p>
                      <span className="text-slate-500">Requested: </span>
                      {formatDateLabel(withdrawal.requestedAt)}
                    </p>
                  </div>

                  <div className="text-lg font-semibold text-emerald-300">
                    {formatCurrency(withdrawal.amount, withdrawal.currency)}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">
                    {withdrawal.hasCommissionFees ? (
                      withdrawal.sourceType === "INVESTMENT_ORDER" ? (
                        <p>
                          Commission fee:{" "}
                          <span className="text-slate-100">
                            {withdrawal.commissionPercent}%
                          </span>
                        </p>
                      ) : withdrawal.savingsFeeAmount != null ? (
                        <p>
                          Savings fee:{" "}
                          <span className="text-slate-100">
                            {formatCurrency(
                              withdrawal.savingsFeeAmount,
                              withdrawal.currency,
                            )}
                          </span>
                        </p>
                      ) : (
                        <p className="text-slate-500">Fee details unavailable</p>
                      )
                    ) : (
                      <p className="text-slate-500">No commission fees applied</p>
                    )}
                  </div>

                  {withdrawal.rejectionReason ? (
                    <div className="rounded-2xl border border-red-400/20 bg-red-500/5 p-3 text-sm text-red-200">
                      {withdrawal.rejectionReason}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}

            {filteredWithdrawals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">
                No withdrawals found for the selected filter.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
