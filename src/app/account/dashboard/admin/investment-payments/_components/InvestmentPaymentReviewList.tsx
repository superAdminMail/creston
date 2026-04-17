"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

  const hasActiveFilters =
    reviewStatusFilter !== "all" ||
    orderStatusFilter !== "all" ||
    submittedDateFilter.length > 0;

  function clearFilters() {
    setReviewStatusFilter("all");
    setOrderStatusFilter("all");
    setSubmittedDateFilter("");
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Investment payment reviews</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {bankInfoRequests.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Pending bank info requests
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Respond with bank details for the users waiting on transfer instructions.
                  </p>
                </div>
                <Badge variant="secondary">{bankInfoRequests.length}</Badge>
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

          <div className="grid gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] xl:items-end">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
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
                    className="rounded-full"
                    onClick={() => setReviewStatusFilter(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Order status
              </p>
              <Select
                value={orderStatusFilter}
                onValueChange={(value) =>
                  setOrderStatusFilter(value as OrderStatusFilter)
                }
              >
                <SelectTrigger className="h-10 !w-full rounded-2xl border-border/60 bg-background/80 px-3">
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
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Submitted date
              </p>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={submittedDateFilter}
                  onChange={(event) =>
                    setSubmittedDateFilter(event.target.value)
                  }
                  className="h-10 rounded-2xl border-border/60 bg-background/80"
                />
                {submittedDateFilter ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-2xl"
                    onClick={() => setSubmittedDateFilter("")}
                  >
                    Clear
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing {filteredPayments.length} of {payments.length} payment
              submissions
            </p>

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                Reset filters
              </Button>
            ) : null}
          </div>

          {filteredPayments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
              No payment submissions found for the current filters.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <Link
                  key={payment.id}
                  href={`/account/dashboard/admin/investment-payments/${payment.id}`}
                  className="block rounded-2xl border border-border/60 p-4 transition hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">{payment.plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.claimedAmount.toLocaleString()}{" "}
                        {payment.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted by{" "}
                        {payment.submittedBy.name ??
                          payment.submittedBy.email ??
                          "Unknown"}{" "}
                        - {formatDate(payment.submittedAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {formatEnumLabel(payment.paymentStatus)}
                      </Badge>
                      <Badge variant="outline">
                        {formatEnumLabel(payment.orderStatus)}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
