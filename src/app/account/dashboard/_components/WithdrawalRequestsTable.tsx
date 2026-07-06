"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

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
import { getWithdrawalStatusTone } from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";
import { WithdrawalStatusActionMenu } from "@/app/account/dashboard/admin/Withdrawals/_components/WithdrawalStatusActionMenu";

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

function matchesStatusFilter(status: string, filter: WithdrawalStatusFilter) {
  if (filter === "all") return true;

  return statusGroups[filter].includes(status);
}

export function WithdrawalRequestsTable({
  withdrawals,
  detailsBasePath = "/account/dashboard/admin/Withdrawals",
}: {
  withdrawals: AdminWithdrawalItem[];
  detailsBasePath?: string;
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
    <div className="space-y-6">
      <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
        <CardContent className="space-y-6 p-6">
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
          <div className="overflow-hidden rounded-[1.5rem]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Requester</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Payout Method</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Fees</th>
                    <th className="px-6 py-4">Actions</th>
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
                        <div className="space-y-1">
                          <p className="text-slate-200">
                            {withdrawal.paymentMethodLabel}
                          </p>
                          <p
                            className={`text-[10px] uppercase tracking-[0.2em] ${
                              withdrawal.paymentMethodStatus === "UNAVAILABLE"
                                ? "text-amber-300"
                                : withdrawal.paymentMethodStatus === "UPDATED"
                                  ? "text-emerald-300"
                                  : "text-slate-500"
                            }`}
                          >
                            {withdrawal.paymentMethodStatus === "UNAVAILABLE"
                              ? "Update required"
                              : withdrawal.paymentMethodStatus === "UPDATED"
                                ? "Updated details submitted"
                                : "Available"}
                          </p>
                        </div>
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
                              {withdrawal.commissionReviewStatus ===
                              "PENDING_REVIEW" ? (
                                <p className="text-xs text-amber-300">
                                  Awaiting commission review
                                </p>
                              ) : null}
                            </div>
                          ) : withdrawal.savingsFeeAmount != null ? (
                            <div className="space-y-1">
                              <p className="text-slate-200">
                                Fee amount:{" "}
                                {formatCurrency(
                                  withdrawal.savingsFeeAmount,
                                  withdrawal.currency,
                                )}
                              </p>
                              {withdrawal.commissionReviewStatus ===
                              "PENDING_REVIEW" ? (
                                <p className="text-xs text-amber-300">
                                  Awaiting commission review
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-slate-500">Not available</span>
                          )
                        ) : (
                          <span className="text-slate-500">No commission fees</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`${detailsBasePath}/${withdrawal.id}`}
                            className="inline-flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                            {withdrawal.status === "PENDING"
                              ? "Manage commission"
                              : "View"}
                          </Link>

                          <WithdrawalStatusActionMenu
                            withdrawalId={withdrawal.id}
                            status={withdrawal.status}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "border",
                            getWithdrawalStatusTone(withdrawal.status),
                          )}
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
        </CardContent>
      </Card>
    </div>
  );
}
