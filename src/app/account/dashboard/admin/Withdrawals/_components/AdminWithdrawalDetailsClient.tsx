"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy } from "lucide-react";

import { approveWithdrawalCommission } from "@/actions/admin/withdrawals/approveWithdrawalCommission";
import { approveWithdrawalFee } from "@/actions/admin/withdrawals/approveWithdrawalFee";
import { rejectWithdrawalCommission } from "@/actions/admin/withdrawals/rejectWithdrawalCommission";
import { rejectWithdrawalFee } from "@/actions/admin/withdrawals/rejectWithdrawalFee";
import { updateWithdrawalCommission } from "@/actions/admin/withdrawals/updateWithdrawalCommission";
import { updateWithdrawalPaymentMethodAvailability } from "@/actions/admin/withdrawals/updateWithdrawalPaymentMethodAvailability";
import type { AdminWithdrawalDetails } from "@/actions/admin/withdrawals/getAdminWithdrawalDetails";
import { WithdrawalCommissionStatusActionMenu } from "@/app/account/dashboard/admin/Withdrawals/_components/WithdrawalCommissionStatusActionMenu";
import {
  createInitialFormState,
  getFirstFormFieldError,
} from "@/lib/forms/actionState";
import { formatCurrency, formatEnumLabel } from "@/lib/formatters/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { WithdrawalTerminalNotice } from "@/components/withdrawals/WithdrawalTerminalNotice";
import { cn } from "@/lib/utils";
import {
  getWithdrawalCommissionFieldConfig,
  getWithdrawalCommissionSourceType,
} from "@/lib/payments/withdrawals/withdrawalCommissionSettings";
import {
  getWithdrawalCommissionStatusTone,
  isWithdrawalCommissionSettledStatus,
} from "@/lib/payments/withdrawals/withdrawalCommissionStatusWorkflow";
import {
  getWithdrawalStatusTone,
  isWithdrawalTerminalStatus,
  getWithdrawalReceiptStatusHelperText,
} from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";
import {
  getWithdrawalPaymentMethodStatusLabel,
  getWithdrawalPaymentMethodStatusTone,
  resolveWithdrawalPaymentMethodLabel,
} from "@/lib/withdrawals/withdrawalPaymentMethodReview";
import type { WithdrawalFeeReviewStatus } from "@/lib/types/payments/withdrawalFee.types";

type FieldName =
  | "withdrawalId"
  | "hasCommissionFees"
  | "commissionPercent"
  | "feeAmount";

const initialState = createInitialFormState<FieldName>();
const availabilityInitialState = createInitialFormState<
  "withdrawalId" | "isAvailable" | "reason"
>();

function formatDateTime(value: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
}

function maskWalletAddress(value?: string | null) {
  if (!value) return "Not available";

  const normalized = value.trim();

  if (normalized.length <= 8) {
    return normalized;
  }

  return `${normalized.slice(0, 4)}...${normalized.slice(-4)}`;
}

function ReceiptRow({
  label,
  value,
  helperText,
}: {
  label: string;
  value: ReactNode;
  helperText?: ReactNode;
}) {
  return (
    <div className="grid gap-2 py-4 sm:grid-cols-[0.95fr_1.05fr] sm:items-start">
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <div className="space-y-1">
        <div className="text-sm text-white sm:text-right">{value}</div>
        {helperText ? (
          <div className="text-xs leading-5 text-slate-400 sm:text-right">
            {helperText}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getWithdrawalFeeReviewTone(status: WithdrawalFeeReviewStatus | null) {
  if (status === "APPROVED") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100";
  }

  if (status === "REJECTED") {
    return "border-rose-400/20 bg-rose-500/10 text-rose-100";
  }

  return "border-amber-400/20 bg-amber-500/10 text-amber-100";
}

export function AdminWithdrawalDetailsClient({
  withdrawal,
  backHref = "/account/dashboard/admin/Withdrawals",
  backLabel = "Back to withdrawals",
  headerLabel = "Withdrawal receipt",
  headerDescription = "Admin view for withdrawal review and lifecycle controls.",
}: {
  withdrawal: AdminWithdrawalDetails;
  backHref?: string;
  backLabel?: string;
  headerLabel?: string;
  headerDescription?: string;
}) {
  const router = useRouter();
  const commissionSettingsFormRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction, pending] = useActionState(
    updateWithdrawalCommission,
    initialState,
  );
  const [availabilityState, availabilityFormAction, availabilityPending] =
    useActionState(
      updateWithdrawalPaymentMethodAvailability,
      availabilityInitialState,
    );
  const [hasCommissionFees, setHasCommissionFees] = useState(
    withdrawal.hasCommissionFees,
  );
  const commissionField = getWithdrawalCommissionFieldConfig(
    getWithdrawalCommissionSourceType({
      investmentOrderId: null,
      sourceType: withdrawal.sourceType,
      allocationMode: withdrawal.allocationMode,
    }),
  );
  const commissionStoredValue = withdrawal.hasCommissionFees
    ? commissionField.fieldName === "commissionPercent"
      ? `${withdrawal.commissionPercent.toFixed(2)}%`
      : withdrawal.savingsFeeAmount !== null
        ? formatCurrency(withdrawal.savingsFeeAmount, withdrawal.currency)
        : "Not available"
    : "Not enabled";
  const [commissionValue, setCommissionValue] = useState(
    commissionField.fieldName === "commissionPercent"
      ? withdrawal.commissionPercent > 0
        ? withdrawal.commissionPercent.toFixed(2)
        : ""
      : withdrawal.savingsFeeAmount !== null
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
  const feePayment = withdrawal.feePayment;
  const [feeReviewAmount, setFeeReviewAmount] = useState(
    feePayment?.submittedAmount
      ? feePayment.submittedAmount.toFixed(2)
      : feePayment?.feeAmount
        ? feePayment.feeAmount.toFixed(2)
        : "",
  );
  const [feeReviewNote, setFeeReviewNote] = useState("");
  const [feeRejectionReason, setFeeRejectionReason] = useState("");
  const [feeRejectionReasonError, setFeeRejectionReasonError] = useState("");
  const [availabilityReason, setAvailabilityReason] = useState(
    withdrawal.paymentMethodReview.reason ?? "",
  );
  const [reviewPending, startReviewTransition] = useTransition();
  const [feeReviewPending, startFeeReviewTransition] = useTransition();
  const [commissionSettingsPending, startCommissionSettingsTransition] =
    useTransition();
  const lastToast = useRef<string | null>(null);
  const commissionReviewStatus =
    withdrawal.commissionPayment?.reviewStatus ?? null;
  const canReviewCommission =
    commissionReviewStatus === "PENDING_REVIEW" &&
    !isWithdrawalCommissionSettledStatus(withdrawal.commissionStatus);
  const feeReviewStatus = feePayment?.reviewStatus ?? null;
  const canReviewFee =
    withdrawal.viewerRole === "SUPER_ADMIN" &&
    feeReviewStatus === "PENDING_REVIEW";
  const isAutoAllocation = withdrawal.allocationMode === "AUTO";
  const commissionPayment = withdrawal.commissionPayment;
  const feeSubmittedAmount =
    feePayment?.submittedAmount ?? feePayment?.feeAmount ?? 0;
  const paymentMethodLabel = resolveWithdrawalPaymentMethodLabel(
    withdrawal.payoutMethod,
    {
      review: withdrawal.paymentMethodReview,
      override: withdrawal.paymentMethodOverride,
    },
  );
  const paymentMethodStatusLabel = getWithdrawalPaymentMethodStatusLabel(
    withdrawal.paymentMethodReview.status,
  );
  const commissionReviewLabel = commissionReviewStatus
    ? formatEnumLabel(commissionReviewStatus)
    : "Not submitted";
  const feeReviewLabel = feeReviewStatus
    ? formatEnumLabel(feeReviewStatus)
    : "Not submitted";
  const requesterName = withdrawal.requester.name ?? "Unnamed investor";
  const requesterEmail = withdrawal.requester.email ?? "Unknown email";
  const [walletAddressCopied, setWalletAddressCopied] = useState(false);
  const canManagePaymentMethodAvailability =
    withdrawal.viewerRole === "SUPER_ADMIN";
  const nextPaymentMethodAvailabilityLabel =
    withdrawal.paymentMethodReview.status === "AVAILABLE"
      ? "Mark payment method unavailable"
      : "Restore payment method";
  const shouldRequireAvailabilityReason =
    withdrawal.paymentMethodReview.status === "AVAILABLE";

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    const toastMessage =
      state.status === "error"
        ? getFirstFormFieldError(state.fieldErrors) ??
          state.message ??
          "Please review the commission settings."
        : state.message;

    const toastKey = `${state.status}:${toastMessage}:${withdrawal.id}`;

    if (lastToast.current === toastKey) {
      return;
    }

    lastToast.current = toastKey;

    if (state.status === "success") {
      toast.success(toastMessage);
      router.refresh();
      return;
    }

    toast.error(toastMessage);
  }, [
    lastToast,
    router,
    state.fieldErrors,
    state.message,
    state.status,
    withdrawal.id,
  ]);

  useEffect(() => {
    if (availabilityState.status === "idle" || !availabilityState.message) {
      return;
    }

    const toastMessage =
      availabilityState.status === "error"
        ? availabilityState.message
        : availabilityState.message;

    const toastKey = `${availabilityState.status}:${toastMessage}:${withdrawal.id}:availability`;

    if (lastToast.current === toastKey) {
      return;
    }

    lastToast.current = toastKey;

    if (availabilityState.status === "success") {
      toast.success(toastMessage);
      router.refresh();
      return;
    }

    toast.error(toastMessage);
  }, [
    availabilityState.message,
    availabilityState.status,
    lastToast,
    router,
    withdrawal.id,
  ]);

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

  function submitFeeReview(input: {
    approvalMode: "FULL" | "PARTIAL" | "REJECT";
    approvedAmount?: number;
    rejectionReason?: string;
  }) {
    startFeeReviewTransition(async () => {
      const result =
        input.approvalMode === "REJECT"
          ? await rejectWithdrawalFee({
              withdrawalId: withdrawal.id,
              rejectionReason: input.rejectionReason ?? "",
              reviewNote: feeReviewNote,
            })
          : await approveWithdrawalFee({
              withdrawalId: withdrawal.id,
              approvedAmount: input.approvedAmount ?? 0,
              approvalMode: input.approvalMode,
              reviewNote: feeReviewNote,
            });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  function handleApproveFeeFull() {
    if (feeSubmittedAmount <= 0) {
      toast.error("Submitted fee amount is not available.");
      return;
    }

    submitFeeReview({
      approvalMode: "FULL",
      approvedAmount: feeSubmittedAmount,
    });
  }

  function handleApproveFeePartial() {
    const parsedAmount = Number(feeReviewAmount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a valid fee review amount.");
      return;
    }

    if (parsedAmount > feeSubmittedAmount) {
      toast.error("Review amount cannot exceed the submitted fee amount.");
      return;
    }

    submitFeeReview({
      approvalMode: "PARTIAL",
      approvedAmount: parsedAmount,
    });
  }

  function handleRejectFee() {
    if (!feeRejectionReason.trim()) {
      setFeeRejectionReasonError("Rejection reason is required.");
      toast.error("Rejection reason is required.");
      return;
    }

    setFeeRejectionReasonError("");
    submitFeeReview({
      approvalMode: "REJECT",
      rejectionReason: feeRejectionReason,
    });
  }

  function submitCommissionSettings(nextHasCommissionFees: boolean) {
    const formElement = commissionSettingsFormRef.current;

    if (!formElement) {
      toast.error("Commission settings form is unavailable.");
      return;
    }

    const formData = new FormData(formElement);
    formData.set("hasCommissionFees", nextHasCommissionFees ? "true" : "false");

    if (!nextHasCommissionFees) {
      formData.delete(commissionField.fieldName);
    }

    startCommissionSettingsTransition(() => {
      void formAction(formData);
    });
  }

  function handleRemoveCommission() {
    submitCommissionSettings(false);
  }

  async function handleCopyWalletAddress(address: string | null | undefined) {
    if (!address) {
      return;
    }

    try {
      await navigator.clipboard.writeText(address);
      setWalletAddressCopied(true);
      toast.success("Wallet address copied.");
      window.setTimeout(() => setWalletAddressCopied(false), 1800);
    } catch {
      toast.error("Unable to copy wallet address.");
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <div className="space-y-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <span aria-hidden="true">&larr;</span>
          {backLabel}
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">
              {headerLabel}
            </h1>
            <p className="text-sm leading-7 text-slate-400">
              {headerDescription}
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

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(15,23,42,0.92)] shadow-2xl backdrop-blur-xl">
        <div className="relative p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
          <div className="relative space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-slate-300">
                  Withdrawal Receipt
                </div>
                <div>
                  <p className="text-sm text-slate-400">Withdrawal amount</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                    {withdrawal.amount}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                    Requested by {requesterName} | {requesterEmail} |{" "}
                    {withdrawal.sourceLabel}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getWithdrawalStatusTone(withdrawal.status)}`}
              >
                {withdrawal.statusLabel}
              </span>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5">
                <ReceiptRow
                  label="Requester"
                  value={requesterName}
                  helperText={requesterEmail}
                />
                <ReceiptRow
                  label="Requested at"
                  value={formatDateTime(withdrawal.requestedAt)}
                />
                <ReceiptRow
                  label="Processed at"
                  value={formatDateTime(withdrawal.processedAt)}
                />
                <ReceiptRow
                  label="Completed at"
                  value={formatDateTime(withdrawal.completedAt)}
                />
                <ReceiptRow
                  label="Rejected at"
                  value={formatDateTime(withdrawal.rejectedAt)}
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5">
                <ReceiptRow
                  label="Source"
                  value={withdrawal.sourceLabel}
                  helperText={
                    isAutoAllocation
                      ? "Automatically split across eligible balances."
                      : null
                  }
                />
                <ReceiptRow
                  label="Payment method"
                  value={paymentMethodLabel}
                />
                <ReceiptRow
                  label="Withdrawal mode"
                  value={
                    withdrawal.withdrawalMode === "EARLY_WITHDRAWAL"
                      ? "Early withdrawal"
                      : "Normal withdrawal"
                  }
                />
                <ReceiptRow
                  label="Status"
                  value={withdrawal.statusLabel}
                  helperText={getWithdrawalReceiptStatusHelperText(
                    withdrawal.status,
                  )}
                />
                <ReceiptRow
                  label="Commission status"
                  value={withdrawal.commissionStatusLabel}
                  helperText={commissionReviewLabel}
                />
                <ReceiptRow
                  label="Calculated commission / fee"
                  value={formatCurrency(
                    withdrawal.commissionDueAmount,
                    withdrawal.currency,
                  )}
                  helperText={withdrawal.commissionCalculationLabel}
                />
                <ReceiptRow
                  label="Early withdrawal penalty"
                  value={
                    withdrawal.earlyWithdrawalPenalty !== null
                      ? formatCurrency(
                          withdrawal.earlyWithdrawalPenalty,
                          withdrawal.currency,
                        )
                      : "Not available"
                  }
                />
                <ReceiptRow
                  label="Net payout"
                  value={
                    withdrawal.netPayoutAmount !== null
                      ? formatCurrency(
                          withdrawal.netPayoutAmount,
                          withdrawal.currency,
                        )
                      : "Not available"
                  }
                />
                <ReceiptRow
                  label="Admin notes"
                  value={withdrawal.adminNotes || "No admin notes recorded."}
                  helperText={
                    withdrawal.rejectionReason
                      ? `Outcome reason: ${withdrawal.rejectionReason}`
                      : null
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                    Payout method details
                  </p>
                  <p className="text-sm text-slate-400">
                    Shows the payout rail used for this withdrawal and its
                    current availability status.
                  </p>
                </div>

                <Badge
                  variant="secondary"
                  className={cn(
                    "border",
                    getWithdrawalPaymentMethodStatusTone(
                      withdrawal.paymentMethodReview.status,
                    ),
                  )}
                >
                  {paymentMethodStatusLabel}
                </Badge>
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <ReceiptRow
                  label="Used payout method"
                  value={paymentMethodLabel}
                  helperText={
                    withdrawal.paymentMethodReview.status === "UNAVAILABLE"
                      ? "This payment method is temporarily unavailable."
                      : withdrawal.paymentMethodReview.status === "UPDATED"
                        ? "Updated payout details have been provided."
                        : "Available for processing."
                  }
                />
                <ReceiptRow
                  label="Availability"
                  value={paymentMethodStatusLabel}
                  helperText={
                    withdrawal.paymentMethodReview.reason ??
                    (withdrawal.paymentMethodReview.status === "AVAILABLE"
                      ? "Super admins can mark this method unavailable."
                      : withdrawal.paymentMethodReview.status === "UNAVAILABLE"
                        ? "The user can update the payout details from the withdrawal receipt."
                        : "Updated payout details are currently on file.")
                  }
                />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  Used method snapshot
                </p>

                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  {withdrawal.paymentMethodReview.status === "UPDATED" &&
                  withdrawal.paymentMethodOverride ? (
                    withdrawal.paymentMethodOverride.type ===
                    "WESTERN_UNION" ? (
                      <>
                        <ReceiptRow
                          label="Receiver name"
                          value={
                            withdrawal.paymentMethodOverride.receiverName ??
                            "Not available"
                          }
                        />
                        <ReceiptRow
                          label="Receiver country"
                          value={
                            withdrawal.paymentMethodOverride.receiverCountry ??
                            "Not available"
                          }
                        />
                        <ReceiptRow
                          label="Receiver city"
                          value={
                            withdrawal.paymentMethodOverride.receiverCity ??
                            "Not available"
                          }
                        />
                        <ReceiptRow
                          label="Receiver phone"
                          value={
                            withdrawal.paymentMethodOverride.receiverPhone ??
                            "Not available"
                          }
                        />
                        <ReceiptRow
                          label="Transfer reference"
                          value={
                            withdrawal.paymentMethodOverride.transferReference ??
                            "Not available"
                          }
                        />
                        <ReceiptRow
                          label="Note"
                          value={
                            withdrawal.paymentMethodOverride.note ??
                            "Not available"
                          }
                        />
                      </>
                    ) : (
                      <>
                        <ReceiptRow
                          label="Recipient name"
                          value={
                            withdrawal.paymentMethodOverride.recipientName ??
                            "Not available"
                          }
                        />
                        <ReceiptRow
                          label="Delivery country"
                          value={
                            withdrawal.paymentMethodOverride.deliveryCountry ??
                            "Not available"
                          }
                        />
                        <ReceiptRow
                          label="Delivery city"
                          value={
                            withdrawal.paymentMethodOverride.deliveryCity ??
                            "Not available"
                          }
                        />
                        <ReceiptRow
                          label="Delivery address"
                          value={
                            withdrawal.paymentMethodOverride.deliveryAddress ??
                            "Not available"
                          }
                        />
                        <ReceiptRow
                          label="Contact phone"
                          value={
                            withdrawal.paymentMethodOverride.contactPhone ??
                            "Not available"
                          }
                        />
                        <ReceiptRow
                          label="Delivery instructions"
                          value={
                            withdrawal.paymentMethodOverride
                              .deliveryInstructions ?? "Not available"
                          }
                        />
                        <ReceiptRow
                          label="Note"
                          value={
                            withdrawal.paymentMethodOverride.note ??
                            "Not available"
                          }
                        />
                      </>
                    )
                  ) : withdrawal.payoutMethod?.type === "CRYPTO" ? (
                    <>
                      <ReceiptRow
                        label="Network"
                        value={withdrawal.payoutMethod.network ?? "Not available"}
                      />
                      <ReceiptRow
                        label="Wallet address"
                        value={
                          withdrawal.payoutMethod.address ? (
                            <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
                              <span className="break-all font-mono text-sm text-white">
                                {maskWalletAddress(
                                  withdrawal.payoutMethod.address,
                                )}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  void handleCopyWalletAddress(
                                    withdrawal.payoutMethod?.address,
                                  )
                                }
                                className="h-8 rounded-full border-white/10 bg-white/[0.04] px-3 text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white"
                              >
                                <Copy className="mr-1 h-3.5 w-3.5" />
                                {walletAddressCopied ? "Copied" : "Copy"}
                              </Button>
                            </div>
                          ) : (
                            "Not available"
                          )
                        }
                      />
                    </>
                  ) : (
                    <>
                      <ReceiptRow
                        label="Bank name"
                        value={withdrawal.payoutMethod?.bankName ?? "Not available"}
                      />
                      <ReceiptRow
                        label="Account name"
                        value={
                          withdrawal.payoutMethod?.accountName ?? "Not available"
                        }
                      />
                      <ReceiptRow
                        label="Account number"
                        value={
                          withdrawal.payoutMethod?.accountNumber ??
                          "Not available"
                        }
                      />
                    </>
                  )}
                </div>
              </div>

              {canManagePaymentMethodAvailability ? (
                <form
                  action={availabilityFormAction}
                  className="mt-5 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <input type="hidden" name="withdrawalId" value={withdrawal.id} />
                  <input
                    type="hidden"
                    name="isAvailable"
                    value={
                      withdrawal.paymentMethodReview.status === "AVAILABLE"
                        ? "false"
                        : "true"
                    }
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      Super admin availability control
                    </p>
                    <p className="text-sm text-slate-400">
                      {withdrawal.paymentMethodReview.status === "AVAILABLE"
                        ? "Mark this payment method unavailable if it cannot be used for processing."
                        : "Restore the payment method when it becomes available again."}
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="availabilityReason"
                      className="text-sm font-medium text-white"
                    >
                      Reason / note
                    </Label>
                    <Textarea
                      id="availabilityReason"
                      name="reason"
                      value={availabilityReason}
                      onChange={(event) =>
                        setAvailabilityReason(event.target.value)
                      }
                      placeholder={
                        shouldRequireAvailabilityReason
                          ? "Explain why this payment method is unavailable."
                          : "Optional note for this availability change."
                      }
                      rows={4}
                      aria-invalid={Boolean(
                        availabilityState.fieldErrors?.reason?.length,
                      )}
                      className={cn(
                        "rounded-2xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500",
                        availabilityState.fieldErrors?.reason?.length &&
                          "border-rose-400/60 ring-1 ring-rose-400/20",
                      )}
                    />
                    <p className="text-xs text-slate-400">
                      {shouldRequireAvailabilityReason
                        ? "A reason is required before the payment method can be marked unavailable."
                        : "The note will be cleared when the method is restored."}
                    </p>
                    {availabilityState.fieldErrors?.reason?.length ? (
                      <p className="text-xs text-rose-300">
                        {availabilityState.fieldErrors.reason[0]}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={availabilityPending}
                      className="rounded-2xl bg-[#3c9ee0] hover:bg-[#2f8bd0]"
                    >
                      {availabilityPending
                        ? "Saving..."
                        : nextPaymentMethodAvailabilityLabel}
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="mt-5 text-xs text-slate-500">
                  Only super admins can change the availability state for a
                  withdrawal payment method.
                </p>
              )}

              {availabilityState.status === "error" && availabilityState.message ? (
                <p className="mt-3 text-sm text-rose-300">
                  {availabilityState.message}
                </p>
              ) : null}
            </div>

            {withdrawal.allocations.length > 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  Allocation breakdown
                </p>
                <div className="mt-3 space-y-3">
                  {withdrawal.allocations.map((allocation) => (
                    <div
                      key={`${allocation.sourceType}-${allocation.sourceLabel}-${allocation.sourceGrossAmount}-${allocation.sourceNetAmount}`}
                      className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.02)] p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm text-white">
                            {allocation.sourceLabel}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Gross:{" "}
                            {formatCurrency(
                              allocation.sourceGrossAmount,
                              allocation.currency,
                            )}
                          </p>
                        </div>
                        <div className="text-xs text-slate-400 sm:text-right">
                          <p>
                            Penalty:{" "}
                            {formatCurrency(
                              allocation.sourcePenaltyAmount,
                              allocation.currency,
                            )}
                          </p>
                          <p className="mt-1 text-white">
                            Net:{" "}
                            {formatCurrency(
                              allocation.sourceNetAmount,
                              allocation.currency,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {commissionPayment ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  Commission proof submission
                </p>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <ReceiptRow
                    label="Submitted amount"
                    value={formatCurrency(
                      commissionPayment.claimedAmount,
                      withdrawal.currency,
                    )}
                  />
                  <ReceiptRow
                    label="Proof mode"
                    value={
                      commissionPayment.proofMode
                        ? formatEnumLabel(commissionPayment.proofMode)
                        : "Not available"
                    }
                  />
                  <ReceiptRow
                    label="Approved so far"
                    value={formatCurrency(
                      commissionPayment.paidAmount,
                      withdrawal.currency,
                    )}
                  />
                  <ReceiptRow
                    label="Remaining commission"
                    value={formatCurrency(
                      Math.max(0, commissionPayment.remainingAmount),
                      withdrawal.currency,
                    )}
                  />
                  <ReceiptRow
                    label="Depositor"
                    value={commissionPayment.depositorName ?? "Not available"}
                  />
                  <ReceiptRow
                    label="Account name"
                    value={
                      commissionPayment.depositorAccountName ??
                      "Not available"
                    }
                  />
                  <ReceiptRow
                    label="Account number"
                    value={
                      commissionPayment.depositorAccountNo ?? "Not available"
                    }
                  />
                  <ReceiptRow
                    label="Transfer reference"
                    value={
                      commissionPayment.transferReference ?? "Not available"
                    }
                  />
                  <ReceiptRow
                    label="Receipt file"
                    value={commissionPayment.receiptFileId ?? "Not available"}
                  />
                  <ReceiptRow
                    label="Submitted at"
                    value={
                      commissionPayment.submittedAt
                        ? formatDateTime(commissionPayment.submittedAt)
                        : "Not available"
                    }
                  />
                </div>
              </div>
            ) : null}

            {isWithdrawalTerminalStatus(withdrawal.status) ? (
              <WithdrawalTerminalNotice
                status={withdrawal.status}
                reason={withdrawal.rejectionReason}
              />
            ) : null}

            {commissionReviewStatus === "PENDING_REVIEW" &&
            !isWithdrawalCommissionSettledStatus(withdrawal.commissionStatus) ? (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-5 text-amber-50">
                <p className="text-[10px] uppercase tracking-[0.24em] text-amber-200">
                  Commission under review
                </p>
                <p className="mt-2 text-lg font-medium">
                  The submitted commission proof is waiting for admin review.
                </p>
                <p className="mt-1 text-sm text-amber-100/80">
                  Use the review actions below to settle or reject this proof.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
          <CardContent className="space-y-5 p-6">
            <h2 className="text-lg font-semibold text-white">
              Commission settings
            </h2>

            <form
              ref={commissionSettingsFormRef}
              action={formAction}
              className="space-y-6"
            >
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

                <div className="grid max-w-sm gap-2">
                  <Label
                    htmlFor={commissionField.fieldName}
                    className="text-sm font-medium text-white"
                  >
                    {commissionField.label}
                  </Label>
                  <Input
                    id={commissionField.fieldName}
                    name={commissionField.fieldName}
                    type="number"
                    step="0.01"
                    min="0"
                    max={
                      commissionField.fieldName === "commissionPercent"
                        ? "100"
                        : undefined
                    }
                    value={commissionValue}
                    onChange={(event) => setCommissionValue(event.target.value)}
                    required={hasCommissionFees}
                    aria-invalid={Boolean(
                      state.fieldErrors?.[commissionField.fieldName]?.length,
                    )}
                    disabled={
                      !withdrawal.canEditCommission ||
                      pending ||
                      !hasCommissionFees
                    }
                    className={cn(
                      "rounded-2xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500",
                      state.fieldErrors?.[commissionField.fieldName]?.length &&
                        "border-rose-400/60 ring-1 ring-rose-400/20",
                    )}
                    placeholder={commissionField.placeholder}
                  />
                  <p className="text-xs text-slate-400">
                    {hasCommissionFees
                      ? commissionField.helperText
                      : `Enable commission to edit the ${commissionField.label.toLowerCase()}.`}
                  </p>
                  {state.fieldErrors?.[commissionField.fieldName]?.length ? (
                    <p className="text-xs text-rose-300">
                      {state.fieldErrors[commissionField.fieldName]?.[0]}
                    </p>
                  ) : null}
                </div>

                {withdrawal.sourceType === "SAVINGS_ACCOUNT" && hasCommissionFees ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                    Savings withdrawals store the fixed fee amount on the order.
                    {withdrawal.savingsFeeAmount !== null ? (
                      <span className="text-white">
                        {" "}
                        Current stored fee:{" "}
                        {commissionStoredValue}
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
                    disabled={pending || commissionSettingsPending}
                    className={cn(
                      "rounded-2xl",
                      hasCommissionFees
                        ? "bg-emerald-600 hover:bg-emerald-500"
                        : "bg-slate-700 hover:bg-slate-600",
                    )}
                  >
                    {pending ? "Saving..." : "Save commission"}
                  </Button>
                  {hasCommissionFees ? (
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={pending || commissionSettingsPending}
                      onClick={handleRemoveCommission}
                      className="rounded-2xl"
                    >
                      {pending || commissionSettingsPending
                        ? "Removing..."
                        : "Remove commission"}
                    </Button>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Commission settings can only be edited while the withdrawal is
                  pending.
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-white">
                    Commission status
                  </h2>
                  <p className="text-sm leading-6 text-slate-400">
                    Update the commission lifecycle state from this page.
                  </p>
                </div>

                <Badge
                  variant="secondary"
                  className={cn(
                    "border",
                    getWithdrawalCommissionStatusTone(withdrawal.commissionStatus),
                  )}
                >
                  {withdrawal.commissionStatusLabel}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">
                    Change commission status
                  </p>
                  <p className="text-sm text-slate-400">
                    Choose the next lifecycle state for this commission.
                  </p>
                </div>

                <WithdrawalCommissionStatusActionMenu
                  withdrawalId={withdrawal.id}
                  status={withdrawal.commissionStatus}
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

                <p className="text-sm leading-6 text-amber-100/80">
                  Review the proof details shown in the receipt and record the
                  correct outcome below.
                </p>

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

          {canReviewFee ? (
            <Card className="rounded-[1.75rem] border border-amber-400/20 bg-amber-500/10">
              <CardContent className="space-y-5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-white">
                      Applied fee proof review
                    </h2>
                    <p className="text-sm leading-6 text-amber-100/80">
                      Review the applied withdrawal fee proof and record the
                      correct outcome below.
                    </p>
                  </div>

                  <Badge
                    variant="secondary"
                    className={cn(
                      "border",
                      getWithdrawalFeeReviewTone(feeReviewStatus),
                    )}
                  >
                    {feeReviewLabel}
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <ReceiptRow
                    label="Submitted amount"
                    value={formatCurrency(feeSubmittedAmount, withdrawal.currency)}
                  />
                  <ReceiptRow
                    label="Proof mode"
                    value={
                      feePayment?.proofMode
                        ? formatEnumLabel(feePayment.proofMode)
                        : "Not available"
                    }
                  />
                  <ReceiptRow
                    label="Approved so far"
                    value={formatCurrency(
                      feePayment?.paidAmount ?? 0,
                      withdrawal.currency,
                    )}
                  />
                  <ReceiptRow
                    label="Remaining fee"
                    value={formatCurrency(
                      Math.max(0, feePayment?.remainingAmount ?? 0),
                      withdrawal.currency,
                    )}
                  />
                  <ReceiptRow
                    label="Depositor"
                    value={feePayment?.depositorName ?? "Not available"}
                  />
                  <ReceiptRow
                    label="Account name"
                    value={feePayment?.depositorAccountName ?? "Not available"}
                  />
                  <ReceiptRow
                    label="Account number"
                    value={feePayment?.depositorAccountNo ?? "Not available"}
                  />
                  <ReceiptRow
                    label="Transfer reference"
                    value={feePayment?.transferReference ?? "Not available"}
                  />
                  <ReceiptRow
                    label="Payment note"
                    value={feePayment?.note ?? "Not available"}
                  />
                  <ReceiptRow
                    label="Receipt file"
                    value={feePayment?.receiptFileId ?? "Not available"}
                  />
                  <ReceiptRow
                    label="Submitted at"
                    value={
                      feePayment?.submittedAt
                        ? formatDateTime(feePayment.submittedAt)
                        : "Not available"
                    }
                  />
                </div>

                <div className="grid max-w-sm gap-2">
                  <Label
                    htmlFor="feeReviewAmount"
                    className="text-sm font-medium text-white"
                  >
                    Review amount
                  </Label>
                  <Input
                    id="feeReviewAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={feeReviewAmount}
                    onChange={(event) =>
                      setFeeReviewAmount(event.target.value)
                    }
                    disabled={feeReviewPending}
                    className="rounded-2xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-amber-100/80">
                    Enter the amount that was actually received. Use the full
                    button for the submitted amount or reduce it before marking
                    partial.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="feeReviewNote"
                    className="text-sm font-medium text-white"
                  >
                    Review note
                  </Label>
                  <Textarea
                    id="feeReviewNote"
                    rows={4}
                    value={feeReviewNote}
                    onChange={(event) => setFeeReviewNote(event.target.value)}
                    disabled={feeReviewPending}
                    className="rounded-2xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="feeRejectionReason"
                    className="text-sm font-medium text-white"
                  >
                    Rejection reason
                  </Label>
                  <Textarea
                    id="feeRejectionReason"
                    rows={4}
                    value={feeRejectionReason}
                    onChange={(event) => {
                      setFeeRejectionReason(event.target.value);
                      if (feeRejectionReasonError) {
                        setFeeRejectionReasonError("");
                      }
                    }}
                    aria-invalid={Boolean(feeRejectionReasonError)}
                    disabled={feeReviewPending}
                    className="rounded-2xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                  />
                  {feeRejectionReasonError ? (
                    <p className="text-xs text-rose-300">
                      {feeRejectionReasonError}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={handleApproveFeeFull}
                    disabled={feeReviewPending}
                    className="rounded-2xl bg-emerald-600 hover:bg-emerald-500"
                  >
                    {feeReviewPending ? "Saving..." : "Approve full fee"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleApproveFeePartial}
                    disabled={feeReviewPending}
                    className="rounded-2xl"
                  >
                    Mark partially paid
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleRejectFee}
                    disabled={feeReviewPending}
                    className="rounded-2xl"
                  >
                    Reject fee proof
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
