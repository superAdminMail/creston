"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { approveWithdrawalCommission } from "@/actions/admin/withdrawals/approveWithdrawalCommission";
import { rejectWithdrawalCommission } from "@/actions/admin/withdrawals/rejectWithdrawalCommission";
import { updateWithdrawalCommission } from "@/actions/admin/withdrawals/updateWithdrawalCommission";
import type { AdminWithdrawalDetails } from "@/actions/admin/withdrawals/getAdminWithdrawalDetails";
import { createInitialFormState } from "@/lib/forms/actionState";
import { formatCurrency, formatEnumLabel } from "@/lib/formatters/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type FieldName =
  | "withdrawalId"
  | "hasCommissionFees"
  | "commissionPercent"
  | "feeAmount";

const initialState = createInitialFormState<FieldName>();

function formatDateTime(value: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

export function AdminWithdrawalDetailsClient({
  withdrawal,
}: {
  withdrawal: AdminWithdrawalDetails;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateWithdrawalCommission,
    initialState,
  );
  const [hasCommissionFees, setHasCommissionFees] = useState(
    withdrawal.hasCommissionFees,
  );
  const [commissionPercent, setCommissionPercent] = useState(
    withdrawal.sourceType === "INVESTMENT_ORDER" &&
    withdrawal.commissionPercent > 0
      ? withdrawal.commissionPercent.toFixed(2)
      : "",
  );
  const [feeAmount, setFeeAmount] = useState(
    withdrawal.sourceType === "SAVINGS_ACCOUNT" &&
    withdrawal.savingsFeeAmount !== null
      ? withdrawal.savingsFeeAmount.toFixed(2)
      : "",
  );
  const [reviewAmount, setReviewAmount] = useState(
    withdrawal.commissionPayment?.claimedAmount
      ? withdrawal.commissionPayment.claimedAmount.toFixed(2)
      : "",
  );
  const [reviewNote, setReviewNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonError, setRejectionReasonError] = useState("");
  const [reviewPending, startReviewTransition] = useTransition();
  const lastToast = useRef<string | null>(null);
  const commissionReviewStatus =
    withdrawal.commissionPayment?.reviewStatus ?? null;
  const canReviewCommission = commissionReviewStatus === "PENDING_REVIEW";

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    const toastKey = `${state.status}:${state.message}:${withdrawal.id}`;

    if (lastToast.current === toastKey) {
      return;
    }

    lastToast.current = toastKey;

    if (state.status === "success") {
      toast.success(state.message);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [lastToast, router, state.message, state.status, withdrawal.id]);

  function submitCommissionReview(input: {
    approvalMode: "FULL" | "PARTIAL" | "REJECT";
    approvedAmount?: number;
    rejectionReason?: string;
  }) {
    startReviewTransition(async () => {
      const result =
        input.approvalMode === "REJECT"
          ? await rejectWithdrawalCommission({
              withdrawalId: withdrawal.id,
              rejectionReason: input.rejectionReason ?? "",
              reviewNote,
            })
          : await approveWithdrawalCommission({
              withdrawalId: withdrawal.id,
              approvedAmount: input.approvedAmount ?? 0,
              approvalMode: input.approvalMode,
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

  function handleApproveFull() {
    submitCommissionReview({
      approvalMode: "FULL",
      approvedAmount: withdrawal.commissionPayment?.claimedAmount ?? 0,
    });
  }

  function handleApprovePartial() {
    submitCommissionReview({
      approvalMode: "PARTIAL",
      approvedAmount: Number(reviewAmount),
    });
  }

  function handleReject() {
    if (!rejectionReason.trim()) {
      setRejectionReasonError("Rejection reason is required.");
      toast.error("Rejection reason is required.");
      return;
    }

    setRejectionReasonError("");
    submitCommissionReview({
      approvalMode: "REJECT",
      rejectionReason,
    });
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <div className="space-y-3">
        <Link
          href="/account/dashboard/admin/Withdrawals"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Back to withdrawals
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">
              Withdrawal commission
            </h1>
            <p className="text-sm leading-7 text-slate-400">
              {withdrawal.requester.name ?? "Unnamed investor"} |{" "}
              {withdrawal.requester.email ?? "Unknown email"} |{" "}
              {withdrawal.sourceLabel}
            </p>
          </div>

          <Badge
            variant="secondary"
            className={cn(
              "w-fit border",
              withdrawal.hasCommissionFees
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : "border-white/10 bg-white/[0.04] text-slate-200",
            )}
          >
            {withdrawal.hasCommissionFees
              ? "Commission enabled"
              : "Commission disabled"}
          </Badge>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Status" value={withdrawal.statusLabel} />
        <InfoCard
          label="Commission status"
          value={withdrawal.commissionStatusLabel}
        />
        <InfoCard
          label="Commission review"
          value={
            commissionReviewStatus
              ? formatEnumLabel(commissionReviewStatus)
              : "Not submitted"
          }
        />
        <InfoCard label="Amount" value={withdrawal.amount} />
        <InfoCard label="Currency" value={withdrawal.currency} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold text-white">
                Commission settings
              </h2>

              <form action={formAction} className="space-y-6">
                <input type="hidden" name="withdrawalId" value={withdrawal.id} />
                <input
                  type="hidden"
                  name="hasCommissionFees"
                  value={hasCommissionFees ? "true" : "false"}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-white">
                        Charge commission
                      </Label>
                      <p className="text-sm text-slate-400">
                        Enable this to apply a commission to the withdrawal.
                      </p>
                    </div>

                    <Switch
                      checked={hasCommissionFees}
                      onCheckedChange={setHasCommissionFees}
                      disabled={!withdrawal.canEditCommission || pending}
                    />
                  </div>

                  {withdrawal.sourceType === "INVESTMENT_ORDER" ? (
                    <div className="grid max-w-sm gap-2">
                      <Label
                        htmlFor="commissionPercent"
                        className="text-sm font-medium text-white"
                      >
                        Commission percent
                      </Label>
                      <Input
                        id="commissionPercent"
                        name="commissionPercent"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={commissionPercent}
                        onChange={(event) =>
                          setCommissionPercent(event.target.value)
                        }
                        disabled={
                          !withdrawal.canEditCommission ||
                          pending ||
                          !hasCommissionFees
                        }
                        className="rounded-2xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                        placeholder="5.00"
                      />
                      <p className="text-xs text-slate-400">
                        {hasCommissionFees
                          ? "Enter a percent between 0 and 100."
                          : "Enable commission to edit the percent."}
                      </p>
                      {state.fieldErrors?.commissionPercent?.length ? (
                        <p className="text-xs text-rose-300">
                          {state.fieldErrors.commissionPercent[0]}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {withdrawal.sourceType === "SAVINGS_ACCOUNT" ? (
                    <div className="grid max-w-sm gap-2">
                      <Label
                        htmlFor="feeAmount"
                        className="text-sm font-medium text-white"
                      >
                        Fee amount
                      </Label>
                      <Input
                        id="feeAmount"
                        name="feeAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={feeAmount}
                        onChange={(event) => setFeeAmount(event.target.value)}
                        disabled={
                          !withdrawal.canEditCommission ||
                          pending ||
                          !hasCommissionFees
                        }
                        className="rounded-2xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-slate-400">
                        {hasCommissionFees
                          ? "Enter the fixed fee amount for this savings withdrawal."
                          : "Enable commission to edit the fee amount."}
                      </p>
                      {state.fieldErrors?.feeAmount?.length ? (
                        <p className="text-xs text-rose-300">
                          {state.fieldErrors.feeAmount[0]}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {withdrawal.sourceType === "SAVINGS_ACCOUNT" && hasCommissionFees ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                      Savings withdrawals store the fixed fee amount on the order.
                      {withdrawal.savingsFeeAmount !== null ? (
                        <span className="text-white">
                          {" "}
                          Current stored fee:{" "}
                          {formatCurrency(
                            withdrawal.savingsFeeAmount,
                            withdrawal.currency,
                          )}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {state.status === "error" && state.message ? (
                  <p className="text-sm text-rose-300">{state.message}</p>
                ) : null}

                {withdrawal.canEditCommission ? (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="submit"
                      disabled={pending}
                      className={cn(
                        "rounded-2xl",
                        hasCommissionFees
                          ? "bg-emerald-600 hover:bg-emerald-500"
                          : "bg-slate-700 hover:bg-slate-600",
                      )}
                    >
                      {pending ? "Saving..." : "Save commission"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    Commission settings can only be edited while the withdrawal is pending.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold text-white">
                Withdrawal details
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard
                  label="Requested at"
                  value={formatDateTime(withdrawal.requestedAt)}
                />
                <InfoCard
                  label="Processed at"
                  value={formatDateTime(withdrawal.processedAt)}
                />
                <InfoCard
                  label="Completed at"
                  value={formatDateTime(withdrawal.completedAt)}
                />
                <InfoCard
                  label="Rejected at"
                  value={formatDateTime(withdrawal.rejectedAt)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard label="Source" value={withdrawal.sourceLabel} />
                <InfoCard
                  label={
                    withdrawal.sourceType === "SAVINGS_ACCOUNT"
                      ? "Fee amount"
                      : "Commission percent"
                  }
                  value={
                    withdrawal.hasCommissionFees
                      ? withdrawal.sourceType === "INVESTMENT_ORDER"
                        ? `${withdrawal.commissionPercent.toFixed(2)}%`
                        : withdrawal.savingsFeeAmount !== null
                          ? formatCurrency(
                              withdrawal.savingsFeeAmount,
                              withdrawal.currency,
                            )
                          : "Not available"
                      : "Not enabled"
                  }
                />
              </div>
            </CardContent>
          </Card>

          {canReviewCommission ? (
            <Card className="rounded-[1.75rem] border border-amber-400/20 bg-amber-500/10">
              <CardContent className="space-y-5 p-6">
                <h2 className="text-lg font-semibold text-white">
                  Commission proof review
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoCard
                    label="Submitted amount"
                    value={
                      withdrawal.commissionPayment
                        ? formatCurrency(
                            withdrawal.commissionPayment.claimedAmount,
                            withdrawal.currency,
                          )
                        : "Not available"
                    }
                  />
                  <InfoCard
                    label="Proof mode"
                    value={
                      withdrawal.commissionPayment?.proofMode
                        ? formatEnumLabel(
                            withdrawal.commissionPayment.proofMode,
                          )
                        : "Not available"
                    }
                  />
                  <InfoCard
                    label="Approved so far"
                    value={
                      withdrawal.commissionPayment
                        ? formatCurrency(
                            withdrawal.commissionPayment.paidAmount,
                            withdrawal.currency,
                          )
                        : "Not available"
                    }
                  />
                  <InfoCard
                    label="Remaining commission"
                    value={
                      withdrawal.commissionPayment
                        ? formatCurrency(
                            Math.max(
                              0,
                              withdrawal.commissionPayment.remainingAmount,
                            ),
                            withdrawal.currency,
                          )
                        : "Not available"
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoCard
                    label="Depositor"
                    value={
                      withdrawal.commissionPayment?.depositorName ??
                      "Not available"
                    }
                  />
                  <InfoCard
                    label="Account name"
                    value={
                      withdrawal.commissionPayment?.depositorAccountName ??
                      "Not available"
                    }
                  />
                  <InfoCard
                    label="Account number"
                    value={
                      withdrawal.commissionPayment?.depositorAccountNo ??
                      "Not available"
                    }
                  />
                  <InfoCard
                    label="Transfer reference"
                    value={
                      withdrawal.commissionPayment?.transferReference ??
                      "Not available"
                    }
                  />
                  <InfoCard
                    label="Receipt file"
                    value={
                      withdrawal.commissionPayment?.receiptFileId ??
                      "Not available"
                    }
                  />
                  <InfoCard
                    label="Submitted at"
                    value={
                      withdrawal.commissionPayment?.submittedAt
                        ? formatDateTime(
                            withdrawal.commissionPayment.submittedAt,
                          )
                        : "Not available"
                    }
                  />
                </div>

                <div className="grid max-w-sm gap-2">
                  <Label
                    htmlFor="commissionReviewAmount"
                    className="text-sm font-medium text-white"
                  >
                    Review amount
                  </Label>
                  <Input
                    id="commissionReviewAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={reviewAmount}
                    onChange={(event) => setReviewAmount(event.target.value)}
                    disabled={reviewPending}
                    className="rounded-2xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-slate-300">
                    Enter the amount that was actually received. Use the full
                    button for the submitted amount or reduce it before marking
                    partial.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="commissionReviewNote"
                    className="text-sm font-medium text-white"
                  >
                    Review note
                  </Label>
                  <Textarea
                    id="commissionReviewNote"
                    rows={4}
                    value={reviewNote}
                    onChange={(event) => setReviewNote(event.target.value)}
                    disabled={reviewPending}
                    className="rounded-2xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="commissionRejectionReason"
                    className="text-sm font-medium text-white"
                  >
                    Rejection reason
                  </Label>
                  <Textarea
                    id="commissionRejectionReason"
                    rows={4}
                    value={rejectionReason}
                    onChange={(event) => {
                      setRejectionReason(event.target.value);
                      if (rejectionReasonError) {
                        setRejectionReasonError("");
                      }
                    }}
                    aria-invalid={Boolean(rejectionReasonError)}
                    disabled={reviewPending}
                    className="rounded-2xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                  />
                  {rejectionReasonError ? (
                    <p className="text-xs text-rose-300">
                      {rejectionReasonError}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={handleApproveFull}
                    disabled={reviewPending}
                    className="rounded-2xl bg-emerald-600 hover:bg-emerald-500"
                  >
                    {reviewPending ? "Saving..." : "Approve full payment"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleApprovePartial}
                    disabled={reviewPending}
                    className="rounded-2xl"
                  >
                    Mark partially paid
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleReject}
                    disabled={reviewPending}
                    className="rounded-2xl"
                  >
                    Reject payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-white">Payment method</h2>
              <InfoCard
                label="Type"
                value={withdrawal.payoutMethod?.type ?? "Not available"}
              />
              <InfoCard
                label="Bank name"
                value={withdrawal.payoutMethod?.bankName ?? "Not available"}
              />
              <InfoCard
                label="Account name"
                value={withdrawal.payoutMethod?.accountName ?? "Not available"}
              />
              <InfoCard
                label="Account number"
                value={withdrawal.payoutMethod?.accountNumber ?? "Not available"}
              />
              <InfoCard
                label="Network"
                value={withdrawal.payoutMethod?.network ?? "Not available"}
              />
              <InfoCard
                label="Address"
                value={withdrawal.payoutMethod?.address ?? "Not available"}
              />
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-white">Admin notes</h2>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
                {withdrawal.adminNotes || "No admin notes recorded for this withdrawal."}
              </div>
              <h3 className="text-sm font-medium text-slate-200">
                {withdrawal.status === "REJECTED"
                  ? "Rejection reason"
                  : "Commission status"}
              </h3>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
                {withdrawal.rejectionReason ||
                  (withdrawal.status === "REJECTED"
                    ? "No rejection reason recorded."
                    : `${withdrawal.commissionStatusLabel} commission state.`)}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
