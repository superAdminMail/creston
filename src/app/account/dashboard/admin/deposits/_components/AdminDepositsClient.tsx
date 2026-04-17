"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import type { AdminDepositItem } from "@/lib/types/payments/adminDeposits.types";
import { cn } from "@/lib/utils";

type SourceFilter = "all" | "savings" | "investment";
type StatusFilter =
  | "all"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELED";

const sourceFilters: Array<{ label: string; value: SourceFilter }> = [
  { label: "All deposits", value: "all" },
  { label: "Savings transactions", value: "savings" },
  { label: "Approved investment payments", value: "investment" },
];

const statusFilters: Array<{ label: string; value: StatusFilter }> = [
  { label: "All statuses", value: "all" },
  { label: "Pending review", value: "PENDING_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Cancelled", value: "CANCELED" },
];

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

function getStatusTone(status: string) {
  switch (status) {
    case "PENDING_REVIEW":
      return "bg-amber-500/10 text-amber-300 border-amber-400/20";
    case "APPROVED":
      return "bg-emerald-500/10 text-emerald-300 border-emerald-400/20";
    case "REJECTED":
      return "bg-red-500/10 text-red-300 border-red-400/20";
    case "CANCELED":
      return "bg-slate-500/10 text-slate-300 border-slate-400/20";
    default:
      return "bg-white/10 text-slate-300 border-white/10";
  }
}

function getSourceTone(source: AdminDepositItem["source"]) {
  return source === "SAVINGS"
    ? "bg-sky-500/10 text-sky-300 border-sky-400/20"
    : "bg-violet-500/10 text-violet-300 border-violet-400/20";
}

function getSourceLabel(source: AdminDepositItem["source"]) {
  return source === "SAVINGS"
    ? "Savings transaction"
    : "Investment order payment";
}

export default function AdminDepositsClient({
  deposits,
}: {
  deposits: AdminDepositItem[];
}) {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [submittedDateFilter, setSubmittedDateFilter] = useState("");

  const filteredDeposits = useMemo(() => {
    return deposits.filter((deposit) => {
      const matchesSource =
        sourceFilter === "all" || deposit.source === sourceFilter.toUpperCase();
      const matchesStatus =
        statusFilter === "all" || deposit.status === statusFilter;
      const matchesSubmittedDate =
        !submittedDateFilter || deposit.submittedAt.slice(0, 10) === submittedDateFilter;

      return matchesSource && matchesStatus && matchesSubmittedDate;
    });
  }, [deposits, sourceFilter, statusFilter, submittedDateFilter]);

  const hasActiveFilters =
    sourceFilter !== "all" ||
    statusFilter !== "all" ||
    submittedDateFilter.length > 0;

  const counts = useMemo(() => {
    return {
      all: deposits.length,
      savings: deposits.filter((deposit) => deposit.source === "SAVINGS").length,
      investment: deposits.filter((deposit) => deposit.source === "INVESTMENT").length,
      pending: deposits.filter((deposit) => deposit.status === "PENDING_REVIEW").length,
      approved: deposits.filter((deposit) => deposit.status === "APPROVED").length,
      rejected: deposits.filter((deposit) => deposit.status === "REJECTED").length,
      canceled: deposits.filter((deposit) => deposit.status === "CANCELED").length,
    };
  }, [deposits]);

  function clearFilters() {
    setSourceFilter("all");
    setStatusFilter("all");
    setSubmittedDateFilter("");
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300/80">
              Admin Operations
            </p>
            <h1 className="text-2xl font-semibold text-white">Deposits</h1>
            <p className="max-w-3xl text-sm text-slate-400">
              Review savings transaction deposits and approved investment order
              payments in one place, with filters for source, status, and
              submitted date.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {sourceFilters.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSourceFilter(option.value)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  sourceFilter === option.value
                    ? "border-sky-400/30 bg-sky-500/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      sourceFilter === option.value
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
                    {option.value === "all"
                      ? counts.all
                      : option.value === "savings"
                        ? counts.savings
                        : counts.investment}
                  </Badge>
                </div>
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-3 md:col-span-1">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Review status
              </p>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <SelectTrigger className="h-10 w-full rounded-2xl border-white/10 bg-white/[0.03] px-3 text-slate-200">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  {statusFilters.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 md:col-span-1">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Submitted date
              </p>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={submittedDateFilter}
                  onChange={(event) => setSubmittedDateFilter(event.target.value)}
                  className="h-10 rounded-2xl border-white/10 bg-white/[0.03] text-slate-200"
                />
                {submittedDateFilter ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-2xl border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"
                    onClick={() => setSubmittedDateFilter("")}
                  >
                    Clear
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="space-y-3 md:col-span-1 md:justify-self-end">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Status counts
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-white/10 text-slate-200">
                  Pending {counts.pending}
                </Badge>
                <Badge variant="secondary" className="bg-white/10 text-slate-200">
                  Approved {counts.approved}
                </Badge>
                <Badge variant="secondary" className="bg-white/10 text-slate-200">
                  Rejected {counts.rejected}
                </Badge>
                <Badge variant="secondary" className="bg-white/10 text-slate-200">
                  Cancelled {counts.canceled}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-400">
              Showing {filteredDeposits.length} of {deposits.length} deposit
              entries
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
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Depositor</th>
                    <th className="px-6 py-4">Method / Reference</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDeposits.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-white/[0.04]">
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <Badge
                            variant="secondary"
                            className={cn("border", getSourceTone(deposit.source))}
                          >
                            {getSourceLabel(deposit.source)}
                          </Badge>
                          <div className="text-xs text-slate-500">
                            {deposit.sourceLabel}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="font-medium text-white">
                            {deposit.depositorName ?? deposit.requesterName ?? "Unknown depositor"}
                          </div>
                          <div className="text-sm text-slate-400">
                            {deposit.depositorAccountName ?? deposit.requesterEmail ?? "No account name"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-300">
                          <div className="space-y-1">
                            <p>{deposit.reference}</p>
                          {deposit.paymentMethodLabel ? (
                            <p className="text-xs text-slate-500">
                              {deposit.paymentMethodLabel}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-5 font-medium text-emerald-300">
                        {formatCurrency(deposit.amount, deposit.currency)}
                      </td>
                      <td className="px-6 py-5">
                        <Badge
                          variant="secondary"
                          className={cn("border", getStatusTone(deposit.status))}
                        >
                          {formatEnumLabel(deposit.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-400">
                        {formatDateTime(deposit.submittedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredDeposits.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500">
                No deposit entries match the current filters.
              </div>
            ) : null}
          </div>

          <div className="space-y-4 p-4 lg:hidden">
            {filteredDeposits.map((deposit) => (
              <Card
                key={deposit.id}
                className="border-white/8 bg-white/[0.04] backdrop-blur-xl"
              >
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <Badge
                        variant="secondary"
                        className={cn("border", getSourceTone(deposit.source))}
                      >
                        {getSourceLabel(deposit.source)}
                      </Badge>
                      <p className="text-sm text-slate-400">
                        {deposit.sourceLabel}
                      </p>
                    </div>

                    <Badge
                      variant="secondary"
                      className={cn("border", getStatusTone(deposit.status))}
                    >
                      {formatEnumLabel(deposit.status)}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-slate-300">
                    <p>
                      <span className="text-slate-500">Depositor: </span>
                      {deposit.depositorName ?? deposit.requesterName ?? "Unknown depositor"}
                    </p>
                    <p>
                      <span className="text-slate-500">Account: </span>
                      {deposit.depositorAccountName ?? deposit.requesterEmail ?? "No account name"}
                    </p>
                    <p>
                      <span className="text-slate-500">Reference: </span>
                      {deposit.reference}
                    </p>
                    {deposit.paymentMethodLabel ? (
                      <p>
                        <span className="text-slate-500">Method: </span>
                        {deposit.paymentMethodLabel}
                      </p>
                    ) : null}
                    <p>
                      <span className="text-slate-500">Submitted: </span>
                      {formatDateLabel(deposit.submittedAt)}
                    </p>
                  </div>

                  <div className="text-lg font-semibold text-emerald-300">
                    {formatCurrency(deposit.amount, deposit.currency)}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredDeposits.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">
                No deposit entries match the current filters.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
