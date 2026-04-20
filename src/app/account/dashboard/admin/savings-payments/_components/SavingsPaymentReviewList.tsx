"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import type { SavingsPaymentReviewListItem } from "@/lib/types/payments/savingsPaymentReview.types";

type PaymentStatusFilter =
  | "all"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELED";

const paymentStatusFilters: Array<{ label: string; value: PaymentStatusFilter }> =
  [
    { label: "All reviews", value: "all" },
    { label: "Pending review", value: "PENDING_REVIEW" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Canceled", value: "CANCELED" },
  ];

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function getDateKey(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export default function SavingsPaymentReviewList({
  payments,
}: {
  payments: SavingsPaymentReviewListItem[];
}) {
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState<PaymentStatusFilter>("all");
  const [submittedDateFilter, setSubmittedDateFilter] = useState("");

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesStatus =
        paymentStatusFilter === "all" ||
        payment.paymentStatus === paymentStatusFilter;
      const matchesSubmittedDate =
        !submittedDateFilter ||
        getDateKey(payment.submittedAt) === submittedDateFilter;

      return matchesStatus && matchesSubmittedDate;
    });
  }, [paymentStatusFilter, payments, submittedDateFilter]);

  const hasActiveFilters =
    paymentStatusFilter !== "all" || submittedDateFilter.length > 0;

  function clearFilters() {
    setPaymentStatusFilter("all");
    setSubmittedDateFilter("");
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Savings payment reviews</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] xl:items-end">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Review status
              </p>
              <div className="flex flex-wrap gap-2">
                {paymentStatusFilters.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={
                      paymentStatusFilter === option.value
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="rounded-full"
                    onClick={() => setPaymentStatusFilter(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
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

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Payment counts
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Pending {payments.filter((payment) => payment.paymentStatus === "PENDING_REVIEW").length}</Badge>
                <Badge variant="secondary">Approved {payments.filter((payment) => payment.paymentStatus === "APPROVED").length}</Badge>
                <Badge variant="secondary">Rejected {payments.filter((payment) => payment.paymentStatus === "REJECTED").length}</Badge>
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
              No savings payment submissions found for the current filters.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <Link
                  key={payment.id}
                  href={`/account/dashboard/admin/savings-payments/${payment.id}`}
                  className="block rounded-2xl border border-border/60 p-4 transition hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {payment.account.name} savings account
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.claimedAmount.toLocaleString()} {payment.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted by{" "}
                        {payment.submittedBy.name ?? payment.submittedBy.email ?? "Unknown"}{" "}
                        - {formatDate(payment.submittedAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {formatEnumLabel(payment.paymentStatus)}
                      </Badge>
                      <Badge variant="outline">
                        {formatEnumLabel(payment.intentStatus)}
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
