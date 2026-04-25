"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import { getPartialApprovalAmount } from "@/lib/payments/getPartialApprovalAmount";
import type { InvestmentPaymentReviewDetails } from "@/lib/types/payments/investmentPaymentReview.types";

import { approveInvestmentOrderPayment } from "@/actions/admin/investment-payments/approveInvestmentOrderPayment";
import { rejectInvestmentOrderPayment } from "@/actions/admin/investment-payments/rejectInvestmentOrderPayment";

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default function InvestmentPaymentReviewDetail({
  payment,
}: {
  payment: InvestmentPaymentReviewDetails;
}) {
  const router = useRouter();
  const [approvedAmount, setApprovedAmount] = useState(
    payment.approvedAmount ?? payment.claimedAmount,
  );
  const [reviewNote, setReviewNote] = useState(payment.reviewNote ?? "");
  const [rejectionReason, setRejectionReason] = useState(
    payment.rejectionReason ?? "",
  );
  const [rejectionReasonError, setRejectionReasonError] = useState("");
  const [pending, startTransition] = useTransition();

  const canReview = payment.status === "PENDING_REVIEW";
  const isFinalPayment = payment.claimedAmount >= payment.order.remainingAmount;
  const canOfferPartialApproval = canReview && !isFinalPayment;
  const partialApprovalAmount = getPartialApprovalAmount(
    payment.claimedAmount,
    approvedAmount,
  );

  useEffect(() => {
    setApprovedAmount(payment.claimedAmount);
  }, [payment.claimedAmount, payment.id]);

  function submitReview(
    approvedAmountValue: number,
    approvalMode: "FULL" | "PARTIAL",
    successMessage: string,
  ) {
    startTransition(async () => {
      const result = await approveInvestmentOrderPayment({
        paymentId: payment.id,
        approvedAmount: approvedAmountValue,
        approvalMode,
        reviewNote,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(successMessage);
      router.refresh();
    });
  }

  function handleApproveFull() {
    submitReview(
      payment.claimedAmount,
      "FULL",
      "Payment submission marked as fully paid.",
    );
  }

  function handleMarkPartiallyPaid() {
    if (partialApprovalAmount === null) {
      toast.error("Partial approval needs a valid amount below the claimed amount.");
      return;
    }

    submitReview(
      partialApprovalAmount,
      "PARTIAL",
      "Payment submission marked as partially paid.",
    );
  }

  function handleReject() {
    if (!rejectionReason.trim()) {
      setRejectionReasonError("Rejection reason is required.");
      toast.error("Rejection reason is required.");
      return;
    }

    setRejectionReasonError("");

    startTransition(async () => {
      const result = await rejectInvestmentOrderPayment({
        paymentId: payment.id,
        rejectionReason,
        reviewNote,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Payment review</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{formatEnumLabel(payment.status)}</Badge>
            <Badge variant="outline">{formatEnumLabel(payment.type)}</Badge>
            <Badge variant="outline">
              {formatEnumLabel(payment.order.status)}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Investor
              </p>
              <p className="mt-2 font-semibold">
                {payment.order.investor.name ?? "-"}
              </p>
              <p className="text-sm text-muted-foreground">
                {payment.order.investor.email ?? "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Order
              </p>
              <p className="mt-2 font-semibold">{payment.order.plan.name}</p>
              <p className="text-sm text-muted-foreground">
                Order status: {formatEnumLabel(payment.order.status)}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Claimed amount
              </p>
              <p className="mt-2 font-semibold">
                {payment.claimedAmount.toLocaleString()} {payment.currency}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Order progress
              </p>
              <p className="mt-2 font-semibold">
                Paid: {payment.order.amountPaid.toLocaleString()} /{" "}
                {payment.order.amount.toLocaleString()} {payment.order.currency}
              </p>
              <p className="text-sm text-muted-foreground">
                Remaining: {payment.order.remainingAmount.toLocaleString()}{" "}
                {payment.order.currency}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Submission details</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="font-medium">Depositor:</span>{" "}
            {payment.depositorName ?? "-"}
          </div>
          <div>
            <span className="font-medium">Account name:</span>{" "}
            {payment.depositorAccountName ?? "-"}
          </div>
          <div>
            <span className="font-medium">Account number:</span>{" "}
            {payment.depositorAccountNo ?? "-"}
          </div>
          <div>
            <span className="font-medium">Transfer reference:</span>{" "}
            {payment.transferReference ?? "-"}
          </div>
          <div>
            <span className="font-medium">Submitted:</span>{" "}
            {formatDate(payment.submittedAt)}
          </div>
          <div>
            <span className="font-medium">Reviewed:</span>{" "}
            {formatDate(payment.reviewedAt)}
          </div>
        </CardContent>
      </Card>

      {payment.receipt?.url ? (
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={payment.receipt.url}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              View uploaded receipt
            </a>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Review action</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Submitted amount
            </p>
            <p className="mt-2 font-semibold">
              {payment.claimedAmount.toLocaleString()} {payment.currency}
            </p>
          </div>

          <div className="grid gap-2 max-w-sm">
            <label className="text-sm font-medium">Review amount</label>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(Number(e.target.value))}
              disabled={!canReview || pending}
            />
            <p className="text-xs text-muted-foreground">
              Auto-filled from the submitted amount. Adjust it only for partial approvals.
            </p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Review note</label>
            <Textarea
              rows={4}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              disabled={!canReview || pending}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Rejection reason</label>
            <Textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (rejectionReasonError) {
                  setRejectionReasonError("");
                }
              }}
              aria-invalid={Boolean(rejectionReasonError)}
              disabled={!canReview || pending}
            />
            {rejectionReasonError ? (
              <p className="text-xs text-destructive">{rejectionReasonError}</p>
            ) : null}
          </div>

            {canReview ? (
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleApproveFull} disabled={pending}>
                  Approve full payment
                </Button>
                {canOfferPartialApproval ? (
                  <Button
                    variant="secondary"
                    onClick={handleMarkPartiallyPaid}
                    disabled={pending}
                  >
                    Mark partially paid
                  </Button>
                ) : null}
                <Button
                  variant="destructive"
                  onClick={handleReject}
                disabled={pending}
              >
                Reject payment
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              This payment has already been reviewed.
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
