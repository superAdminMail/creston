"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminPaginationFooter } from "../../_components/AdminPaginationFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import type {
  InvestmentBankInfoRequestItem,
  InvestmentPaymentReviewListItem,
} from "@/lib/types/payments/investmentPaymentReview.types";
import { useResponsivePageSize } from "@/hooks/use-responsive-page-size";

import InvestmentBankInfoRequestForm from "./InvestmentBankInfoRequestForm";

type ReviewStatusFilter = "all" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
type OrderStatusFilter =
  | "all"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "PAID"
  | "PENDING_PAYMENT"
  | "PARTIALLY_PAID";

const reviewStatusFilters: Array<{
  label: string;
  value: ReviewStatusFilter;
}> = [
  { label: "All reviews", value: "all" },
  { label: "Pending review", value: "PENDING_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

const orderStatusFilters: Array<{
  label: string;
  value: OrderStatusFilter;
}> = [
  { label: "All order statuses", value: "all" },
  { label: "Pending payment", value: "PENDING_PAYMENT" },
  { label: "Partially paid", value: "PARTIALLY_PAID" },
  { label: "Paid", value: "PAID" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Rejected", value: "REJECTED" },
];

const MOBILE_PAGE_SIZE = 10;
const DESKTOP_PAGE_SIZE = 26;

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function getDateKey(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function InvestmentPaymentReviewList({
  payments,
  bankInfoRequests = [],
}: {
  payments: InvestmentPaymentReviewListItem[];
  bankInfoRequests?: InvestmentBankInfoRequestItem[];
}) {
  const [reviewStatusFilter, setReviewStatusFilter] =
    useState<ReviewStatusFilter>("all");
  const [orderStatusFilter, setOrderStatusFilter] =
    useState<OrderStatusFilter>("all");
  const [submittedDateFilter, setSubmittedDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = useResponsivePageSize({
    mobilePageSize: MOBILE_PAGE_SIZE,
    desktopPageSize: DESKTOP_PAGE_SIZE,
  });

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesReviewStatus =
        reviewStatusFilter === "all" ||
        payment.paymentStatus === reviewStatusFilter;
      const matchesOrderStatus =
        orderStatusFilter === "all" ||
        payment.orderStatus === orderStatusFilter;
      const matchesSubmittedDate =
        !submittedDateFilter ||
        getDateKey(payment.submittedAt) === submittedDateFilter;

      return matchesReviewStatus && matchesOrderStatus && matchesSubmittedDate;
    });
  }, [orderStatusFilter, payments, reviewStatusFilter, submittedDateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visiblePayments = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredPayments.slice(startIndex, startIndex + pageSize);
  }, [filteredPayments, pageSize, safeCurrentPage]);

  const hasActiveFilters =
    reviewStatusFilter !== "all" ||
    orderStatusFilter !== "all" ||
    submittedDateFilter.length > 0;

  function clearFilters() {
    setReviewStatusFilter("all");
    setOrderStatusFilter("all");
    setSubmittedDateFilter("");
    setCurrentPage(1);
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Card className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl text-slate-950 dark:text-white">
            Investment payment reviews
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5 px-4 pb-5 sm:px-6 sm:pb-6">
          {bankInfoRequests.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Pending bank info requests
                  </p>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Respond with bank details for the users waiting on transfer
                    instructions.
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100"
                >
                  {bankInfoRequests.length}
                </Badge>
              </div>

              <div className="space-y-4">
                {bankInfoRequests.map((request) => (
                  <InvestmentBankInfoRequestForm
                    key={request.requestNotificationId}
                    request={request}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 rounded-[1.5rem] border border-border/60 bg-white/80 p-4 shadow-sm xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] xl:items-end dark:bg-slate-900/70">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                Review status
              </p>
              <div className="flex flex-wrap gap-2">
                {reviewStatusFilters.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={
                      reviewStatusFilter === option.value
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className={
                      reviewStatusFilter === option.value
                        ? "rounded-full border border-sky-600 bg-sky-600 px-4 text-white shadow-sm hover:bg-sky-700"
                        : "rounded-full border border-slate-200 bg-white px-4 text-slate-700 shadow-sm hover:border-sky-300 hover:bg-sky-50 hover:text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-white/[0.06] dark:hover:text-white"
                    }
                    onClick={() => {
                      setReviewStatusFilter(option.value);
                      setCurrentPage(1);
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                Order status
              </p>
              <Select
                value={orderStatusFilter}
                onValueChange={(value) => {
                  setOrderStatusFilter(value as OrderStatusFilter);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-11 !w-full rounded-2xl border-border/70 bg-white px-4 text-slate-800 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-100">
                  <SelectValue placeholder="All order statuses" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatusFilters.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                Submitted date
              </p>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={submittedDateFilter}
                  onChange={(event) => {
                    setSubmittedDateFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-11 rounded-2xl border-border/70 bg-background px-4 text-slate-800 shadow-sm dark:text-slate-100"
                />
                {submittedDateFilter ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-2xl px-4 text-slate-700 dark:text-slate-100"
                    onClick={() => {
                      setSubmittedDateFilter("");
                      setCurrentPage(1);
                    }}
                  >
                    Clear
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Showing {filteredPayments.length} of {payments.length} payment
              submissions
            </p>

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-slate-700 dark:text-slate-200"
                onClick={clearFilters}
              >
                Reset filters
              </Button>
            ) : null}
          </div>

          {filteredPayments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No payment submissions found for the current filters.
            </div>
          ) : (
            <div className="space-y-4">
              {visiblePayments.map((payment) => (
                <Link
                  key={payment.id}
                  href={`/account/dashboard/admin/investment-payments/${payment.id}`}
                  className="block overflow-hidden rounded-[1.5rem] border border-border/60 bg-white/80 p-4 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/60 dark:bg-white/[0.03] dark:hover:border-sky-400/20 dark:hover:bg-sky-400/10"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="break-words font-semibold text-slate-950 dark:text-white">
                        {payment.plan.name}
                      </p>
                      <p className="break-words text-sm text-slate-600 dark:text-slate-300">
                        {payment.claimedAmount.toLocaleString()}{" "}
                        {payment.currency}
                      </p>
                      <p className="break-words text-xs text-slate-500 dark:text-slate-400">
                        Submitted by{" "}
                        {payment.submittedBy.name ??
                          payment.submittedBy.email ??
                          "Unknown"}{" "}
                        - {formatDate(payment.submittedAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <Badge
                        variant="secondary"
                        className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-white"
                      >
                        {formatEnumLabel(payment.paymentStatus)}
                      </Badge>
                      {payment.submissionKind === "UPGRADE" ? (
                        <Badge className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-500/10 dark:text-emerald-200">
                          Upgrade
                        </Badge>
                      ) : null}
                      <Badge
                        variant="outline"
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
                      >
                        {formatEnumLabel(payment.orderStatus)}
                      </Badge>
                      <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100">
                        Open review
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <AdminPaginationFooter
            currentPage={safeCurrentPage}
            totalItems={filteredPayments.length}
            pageSize={pageSize}
            itemLabel="payment submissions"
            onPrev={() => setCurrentPage((page) => Math.max(1, page - 1))}
            onNext={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
