"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { approveSavingsTransactionPayment } from "@/actions/admin/savings-payments/approveSavingsTransactionPayment";
import { rejectSavingsTransactionPayment } from "@/actions/admin/savings-payments/rejectSavingsTransactionPayment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import type { SavingsPaymentReviewDetails } from "@/lib/types/payments/savingsPaymentReview.types";

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function surfaceTileClass() {
  return "rounded-[1.5rem] border border-border/60 bg-white/80 p-4 shadow-sm dark:bg-white/[0.04]";
}

function statusPillClass() {
  return "rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-white";
}

export default function SavingsPaymentReviewDetail({
  payment,
}: {
  payment: SavingsPaymentReviewDetails;
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

  function submitReview(
    approvedAmountValue: number,
    approvalMode: "FULL" | "PARTIAL",
    successMessage: string,
  ) {
    startTransition(async () => {
      const result = await approveSavingsTransactionPayment({
        paymentId: payment.id,
        approvedAmount: approvedAmountValue,
        approvalMode,
        proofMode:
          payment.type === "CRYPTO_PROVIDER"
            ? "CRYPTO_PROVIDER"
            : "BANK_TRANSFER",
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
    submitReview(
      approvedAmount,
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
      const result = await rejectSavingsTransactionPayment({
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Card className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl text-slate-950 dark:text-white">
            Savings payment review
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={statusPillClass()}>
              {formatEnumLabel(payment.status)}
            </Badge>
            <Badge variant="outline" className={statusPillClass()}>
              {formatEnumLabel(payment.type)}
            </Badge>
            <Badge variant="outline" className={statusPillClass()}>
              {formatEnumLabel(payment.fundingIntent.status)}
            </Badge>
            <Badge variant="outline" className={statusPillClass()}>
              {formatEnumLabel(payment.fundingIntent.account.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className={surfaceTileClass()}>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Investor
              </p>
              <p className="mt-2 break-words font-semibold text-slate-950 dark:text-white">
                {payment.submittedBy.name ?? "-"}
              </p>
              <p className="break-words text-sm text-slate-600 dark:text-slate-300">
                {payment.submittedBy.email ?? "-"}
              </p>
            </div>

            <div className={surfaceTileClass()}>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Savings account
              </p>
              <p className="mt-2 break-words font-semibold text-slate-950 dark:text-white">
                {payment.fundingIntent.account.name}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {payment.fundingIntent.account.product.name}
              </p>
            </div>

            <div className={surfaceTileClass()}>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Claimed amount
              </p>
              <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                {payment.claimedAmount.toLocaleString()} {payment.currency}
              </p>
            </div>

            <div className={surfaceTileClass()}>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Balance progress
              </p>
              <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                Balance:{" "}
                {payment.fundingIntent.account.balance.toLocaleString()} /{" "}
                {payment.fundingIntent.account.targetAmount?.toLocaleString() ??
                  "Not set"}{" "}
                {payment.fundingIntent.account.currency}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Funding intent credited:{" "}
                {payment.fundingIntent.creditedAmount.toLocaleString()}{" "}
                {payment.currency}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
        <CardHeader className="space-y-2 px-4 pt-5 sm:px-6 sm:pt-6">
          <CardTitle className="text-lg text-slate-950 dark:text-white">
            Submission details
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className={surfaceTileClass()}>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Depositor
              </span>
              <p className="mt-2 break-words font-semibold text-slate-950 dark:text-white">
                {payment.depositorName ?? "-"}
              </p>
            </div>

            <div className={surfaceTileClass()}>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Account name
              </span>
              <p className="mt-2 break-words font-semibold text-slate-950 dark:text-white">
                {payment.depositorAccountName ?? "-"}
              </p>
            </div>

            <div className={surfaceTileClass()}>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Account number
              </span>
              <p className="mt-2 break-words font-semibold text-slate-950 dark:text-white">
                {payment.depositorAccountNo ?? "-"}
              </p>
            </div>

            <div className={surfaceTileClass()}>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Transfer reference
              </span>
              <p className="mt-2 break-words font-semibold text-slate-950 dark:text-white">
                {payment.transferReference ?? "-"}
              </p>
            </div>

            <div className={surfaceTileClass()}>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Submitted
              </span>
              <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                {formatDate(payment.submittedAt)}
              </p>
            </div>

            <div className={surfaceTileClass()}>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Reviewed
              </span>
              <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                {formatDate(payment.reviewedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {payment.bankMethod ? (
        <Card className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
          <CardHeader className="space-y-2 px-4 pt-5 sm:px-6 sm:pt-6">
            <CardTitle className="text-lg text-slate-950 dark:text-white">
              Bank method
            </CardTitle>
          </CardHeader>

          <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className={surfaceTileClass()}>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Label
                </span>
                <p className="mt-2 break-words font-semibold text-slate-950 dark:text-white">
                  {payment.bankMethod.label}
                </p>
              </div>

              <div className={surfaceTileClass()}>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Bank name
                </span>
                <p className="mt-2 break-words font-semibold text-slate-950 dark:text-white">
                  {payment.bankMethod.bankName ?? "-"}
                </p>
              </div>

              <div className={surfaceTileClass()}>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Account name
                </span>
                <p className="mt-2 break-words font-semibold text-slate-950 dark:text-white">
                  {payment.bankMethod.accountName ?? "-"}
                </p>
              </div>

              <div className={surfaceTileClass()}>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Account number
                </span>
                <p className="mt-2 break-words font-semibold text-slate-950 dark:text-white">
                  {payment.bankMethod.accountNumber ?? "-"}
                </p>
              </div>

              <div className={surfaceTileClass()}>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Reference
                </span>
                <p className="mt-2 break-words font-semibold text-slate-950 dark:text-white">
                  {payment.bankMethod.reference ?? "-"}
                </p>
              </div>

              <div className={surfaceTileClass()}>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Routing number
                </span>
                <p className="mt-2 break-words font-semibold text-slate-950 dark:text-white">
                  {payment.bankMethod.routingNumber ?? "-"}
                </p>
              </div>

              <div className={surfaceTileClass()}>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Bank address
                </span>
                <p className="mt-2 break-words font-semibold text-slate-950 dark:text-white">
                  {payment.bankMethod.bankAddress ?? "-"}
                </p>
              </div>

              {payment.bankMethod.instructions ? (
                <div
                  className={`${surfaceTileClass()} md:col-span-2 xl:col-span-3`}
                >
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Instructions
                  </span>
                  <p className="mt-2 break-words font-semibold text-slate-950 dark:text-white">
                    {payment.bankMethod.instructions}
                  </p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {payment.receipt?.url ? (
        <Card className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
          <CardHeader className="space-y-2 px-4 pt-5 sm:px-6 sm:pt-6">
            <CardTitle className="text-lg text-slate-950 dark:text-white">
              Receipt
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">
            <a
              href={payment.receipt.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-900 underline-offset-4 transition hover:bg-sky-100 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100"
            >
              View uploaded receipt
            </a>
          </CardContent>
        </Card>
      ) : null}

      <Card className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
        <CardHeader className="space-y-2 px-4 pt-5 sm:px-6 sm:pt-6">
          <CardTitle className="text-lg text-slate-950 dark:text-white">
            Review action
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="rounded-[1.5rem] border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Submitted amount
            </p>
            <p className="mt-2 font-semibold text-slate-950 dark:text-white">
              {payment.claimedAmount.toLocaleString()} {payment.currency}
            </p>
          </div>

          <div className="grid max-w-sm gap-2">
            <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Review amount
            </label>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(Number(e.target.value))}
              disabled={!canReview || pending}
              className="h-11 rounded-2xl border-border/70 bg-background px-4 text-slate-800 shadow-sm dark:text-slate-100"
            />
            <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
              Enter the amount that was actually received. Use the full button
              for the submitted amount or reduce it before marking partial.
            </p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Review note
            </label>
            <Textarea
              rows={4}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              disabled={!canReview || pending}
              className="rounded-2xl border-border/70 bg-background px-4 py-3 text-slate-800 shadow-sm dark:text-slate-100"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Rejection reason
            </label>
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
              className="rounded-2xl border-border/70 bg-background px-4 py-3 text-slate-800 shadow-sm dark:text-slate-100"
            />
            {rejectionReasonError ? (
              <p className="text-xs text-destructive">{rejectionReasonError}</p>
            ) : null}
          </div>

          {canReview ? (
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleApproveFull}
                disabled={pending}
                className="rounded-2xl px-4 py-2.5 text-sm font-medium"
              >
                Approve full payment
              </Button>
              {payment.canOfferPartialApproval ? (
                <Button
                  variant="secondary"
                  onClick={handleMarkPartiallyPaid}
                  disabled={pending}
                  className="rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-800"
                >
                  Mark partially paid
                </Button>
              ) : null}
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={pending}
                className="rounded-2xl px-4 py-2.5 text-sm font-medium"
              >
                Reject payment
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This payment has already been reviewed.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
