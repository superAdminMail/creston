import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { formatCurrency, formatEnumLabel } from "@/lib/formatters/formatters";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { WithdrawalTerminalNotice } from "@/components/withdrawals/WithdrawalTerminalNotice";
import {
  buildWithdrawalFeeCheckoutUrl,
  calculateWithdrawalAppliedFeeAmount,
} from "@/lib/withdrawals/withdrawalFeeCheckout";
import { buildWithdrawalCommissionCheckoutUrl } from "@/lib/withdrawals/withdrawalCommissionCheckout";
import { readWithdrawalCommissionPaymentSnapshot } from "@/lib/withdrawals/withdrawalCommissionSnapshot";
import { readWithdrawalFeePaymentSnapshot } from "@/lib/withdrawals/withdrawalFeeSnapshot";
import { resolveWithdrawalSourceDisplayLabel } from "@/lib/withdrawals/withdrawalSourceDisplay";
import {
  readWithdrawalPaymentMethodSnapshot,
  resolveWithdrawalPaymentMethodLabel,
} from "@/lib/withdrawals/withdrawalPaymentMethodReview";
import {
  calculateWithdrawalCommissionDueAmount,
  getWithdrawalCommissionSourceType,
} from "@/lib/payments/withdrawals/withdrawalCommissionSettings";
import {
  getWithdrawalStatusTone,
  getWithdrawalReceiptStatusHelperText,
  isWithdrawalTerminalStatus,
} from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";
import { isWithdrawalCommissionSettledStatus } from "@/lib/payments/withdrawals/withdrawalCommissionStatusWorkflow";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../../_components/dashboardSurfaces";
import { cn } from "@/lib/utils";
import { WithdrawalPaymentMethodUpdateDrawer } from "../_components/WithdrawalPaymentMethodUpdateDrawer";
import { WithdrawalPrivateSupportChatButton } from "../_components/WithdrawalPrivateSupportChatButton";

type Props = {
  params: Promise<{
    withdrawalId: string;
  }>;
};

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
    <div className="grid gap-3 py-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-start sm:py-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-600 sm:pt-1 dark:text-slate-400">
        {label}
      </p>
      <div className="min-w-0 space-y-1 sm:text-right">
        <div className="break-words text-sm font-medium leading-6 text-slate-950 sm:text-base dark:text-white">
          {value}
        </div>
        {helperText ? (
          <div className="break-words text-xs leading-5 text-slate-600 sm:text-right dark:text-slate-400">
            {helperText}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default async function WithdrawalDetailsPage({ params }: Props) {
  const { withdrawalId } = await params;
  const userId = await getCurrentUserId();

  if (!userId) notFound();

  const profile = await prisma.investorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) notFound();

  const withdrawal = await prisma.withdrawalOrder.findFirst({
    where: {
      id: withdrawalId,
      investorProfileId: profile.id,
    },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      commissionStatus: true,
      hasCommissionFees: true,
      commissionPercent: true,
      savingsFeeAmount: true,
      rejectionReason: true,
      requestedAt: true,
      payoutSnapshot: true,
      payoutMethod: {
        select: {
          id: true,
          type: true,
          bankName: true,
          network: true,
        },
      },
      investmentOrderId: true,
      investmentAccountId: true,
      investmentOrder: {
        select: {
          id: true,
          investmentPlan: {
            select: {
              name: true,
            },
          },
        },
      },
      investmentAccount: {
        select: {
          id: true,
          investmentPlan: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!withdrawal) notFound();

  const payoutSnapshot =
    withdrawal.payoutSnapshot && typeof withdrawal.payoutSnapshot === "object"
      ? (withdrawal.payoutSnapshot as {
          sourceType?: string | null;
          sourceLabel?: string | null;
          allocationMode?: "AUTO" | "SINGLE" | null;
          withdrawalMode?: "NORMAL" | "EARLY_WITHDRAWAL" | null;
          penaltyAmount?: string | null;
          requestedAmount?: string | null;
          earlyWithdrawalPenalty?: string | null;
          netPayoutAmount?: string | null;
          allocations?: Array<{
            sourceType?: string | null;
            sourceLabel?: string | null;
            sourceGrossAmount?: string | null;
            sourcePenaltyAmount?: string | null;
            sourceNetAmount?: string | null;
            currency?: string | null;
          }>;
        })
      : null;
  const storedPenaltyAmount =
    payoutSnapshot?.penaltyAmount &&
    payoutSnapshot.penaltyAmount.trim().length > 0
      ? payoutSnapshot.penaltyAmount
      : null;
  const normalizedWithdrawalMode =
    payoutSnapshot?.withdrawalMode === "EARLY_WITHDRAWAL" ||
    payoutSnapshot?.withdrawalMode === "NORMAL"
      ? payoutSnapshot.withdrawalMode
      : storedPenaltyAmount && Number(storedPenaltyAmount) > 0
        ? "EARLY_WITHDRAWAL"
        : null;
  const normalizedEarlyWithdrawalPenalty =
    payoutSnapshot?.earlyWithdrawalPenalty &&
    payoutSnapshot.earlyWithdrawalPenalty.trim().length > 0
      ? payoutSnapshot.earlyWithdrawalPenalty
      : storedPenaltyAmount && Number(storedPenaltyAmount) > 0
        ? storedPenaltyAmount
        : null;
  const requestedAmount =
    payoutSnapshot?.requestedAmount &&
    payoutSnapshot.requestedAmount.trim().length > 0
      ? payoutSnapshot.requestedAmount
      : withdrawal.amount.toString();
  const commissionPayment = readWithdrawalCommissionPaymentSnapshot(
    withdrawal.payoutSnapshot,
  );
  const feePayment = readWithdrawalFeePaymentSnapshot(
    withdrawal.payoutSnapshot,
  );
  const paymentMethodSnapshot = readWithdrawalPaymentMethodSnapshot(
    withdrawal.payoutSnapshot,
  );
  const effectivePaymentMethodLabel = resolveWithdrawalPaymentMethodLabel(
    withdrawal.payoutMethod,
    paymentMethodSnapshot,
  );

  const sourceLabel = resolveWithdrawalSourceDisplayLabel(
    payoutSnapshot
      ? {
          sourceType: payoutSnapshot.sourceType ?? null,
          sourceLabel: payoutSnapshot.sourceLabel ?? null,
          allocations: payoutSnapshot.allocations ?? null,
        }
      : null,
    withdrawal.investmentOrder?.investmentPlan?.name ??
      withdrawal.investmentAccount?.investmentPlan?.name ??
      "Withdrawal source",
  );

  const statusTone = getWithdrawalStatusTone(withdrawal.status);
  const supportFeeBaseAmount =
    payoutSnapshot?.netPayoutAmount &&
    Number.isFinite(Number(payoutSnapshot.netPayoutAmount))
      ? Number(payoutSnapshot.netPayoutAmount)
      : Number(requestedAmount);
  const supportFeeAmount =
    Number.isFinite(supportFeeBaseAmount) && supportFeeBaseAmount > 0
      ? calculateWithdrawalAppliedFeeAmount(supportFeeBaseAmount)
      : null;
  const isFeeUnderReview = feePayment?.reviewStatus === "PENDING_REVIEW";
  const isFeeSettled =
    feePayment !== null &&
    (feePayment.reviewStatus === "APPROVED" || feePayment.remainingAmount <= 0);

  const sourceType =
    payoutSnapshot?.sourceType ??
    (withdrawal.investmentOrderId
      ? "INVESTMENT_ORDER"
      : withdrawal.investmentAccountId
        ? "SAVINGS_ACCOUNT"
        : null);
  const allocationMode = payoutSnapshot?.allocationMode ?? null;
  const allocations = payoutSnapshot?.allocations ?? [];
  const isAutoAllocation = allocationMode === "AUTO";
  const commissionSourceType = getWithdrawalCommissionSourceType({
    investmentOrderId: withdrawal.investmentOrderId,
    sourceType: payoutSnapshot?.sourceType ?? null,
    allocationMode,
  });
  const commissionAllocations = allocations
    .map((allocation) => {
      if (
        allocation.sourceType !== "INVESTMENT_ORDER" &&
        allocation.sourceType !== "SAVINGS_ACCOUNT"
      ) {
        return null;
      }

      return {
        sourceType: allocation.sourceType,
        sourceGrossAmount: Number(allocation.sourceGrossAmount ?? 0),
      };
    })
    .filter(
      (
        allocation,
      ): allocation is {
        sourceType: "INVESTMENT_ORDER" | "SAVINGS_ACCOUNT";
        sourceGrossAmount: number;
      } => allocation !== null,
    );
  const commissionDueAmount = withdrawal.hasCommissionFees
    ? calculateWithdrawalCommissionDueAmount({
        sourceType: commissionSourceType,
        amount: Number(withdrawal.amount),
        commissionPercent: Number(withdrawal.commissionPercent),
        savingsFeeAmount:
          withdrawal.savingsFeeAmount !== null
            ? Number(withdrawal.savingsFeeAmount)
            : null,
        allocations: commissionAllocations,
      })
    : 0;
  const canShowCommissionCallout =
    !isWithdrawalTerminalStatus(withdrawal.status) &&
    withdrawal.hasCommissionFees &&
    !isWithdrawalCommissionSettledStatus(withdrawal.commissionStatus);
  const isCommissionUnderReview =
    commissionPayment?.reviewStatus === "PENDING_REVIEW";

  return (
    <div className="relative mx-auto min-h-[calc(100vh-5rem)] w-full max-w-6xl ">
      <div className="absolute inset-x-4 top-8 -z-10 h-40 rounded-[2rem] bg-[#3c9ee0]/10 blur-3xl" />

      <div className="space-y-6">
        <Link
          href="/account/dashboard/user/withdrawals"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Back to withdrawals
        </Link>

        <section className={cn(DASHBOARD_PAGE_PANEL_CLASS, "overflow-hidden")}>
          <div className="relative p-4 sm:p-6 md:p-8">
            <div className="relative space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-sky-800 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100">
                    Withdrawal Receipt
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Withdrawal amount
                    </p>
                    <h1 className="mt-2 break-words text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">
                      {formatCurrency(
                        Number(requestedAmount),
                        withdrawal.currency,
                      )}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 dark:text-slate-400">
                      {sourceLabel}
                    </p>
                    {paymentMethodSnapshot.review.status === "UNAVAILABLE" &&
                    !isWithdrawalTerminalStatus(withdrawal.status) ? (
                      <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-amber-950 shadow-sm sm:p-5 dark:text-amber-50">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-amber-700 dark:text-amber-200">
                          Payment method unavailable
                        </p>
                        <p className="mt-2 text-base font-medium text-balance text-amber-900 dark:text-amber-50">
                          Alternate payout details are required before this
                          withdrawal can be processed.
                        </p>
                        <p className="mt-1 text-sm leading-6 text-amber-800 dark:text-amber-100/80">
                          {paymentMethodSnapshot.review.reason ??
                            "Please update the payout method to continue."}
                        </p>
                        <div className="mt-4">
                          <WithdrawalPaymentMethodUpdateDrawer
                            withdrawalId={withdrawal.id}
                            paymentMethodLabel={effectivePaymentMethodLabel}
                            unavailableReason={
                              paymentMethodSnapshot.review.reason
                            }
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-sm ${statusTone}`}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80" />
                  {formatEnumLabel(withdrawal.status)}
                </span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div
                  className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "px-4 sm:px-5")}
                >
                  <ReceiptRow
                    label="Requested at"
                    value={withdrawal.requestedAt.toLocaleString()}
                  />
                  <ReceiptRow
                    label="Payment method"
                    value={effectivePaymentMethodLabel}
                    helperText={
                      paymentMethodSnapshot.review.status === "UNAVAILABLE"
                        ? "This payout method is temporarily unavailable."
                        : paymentMethodSnapshot.review.status === "UPDATED"
                          ? "Updated payout details have been submitted."
                          : null
                    }
                  />
                  <ReceiptRow
                    label="Withdrawal mode"
                    value={
                      normalizedWithdrawalMode === "EARLY_WITHDRAWAL"
                        ? "Early withdrawal"
                        : "Normal withdrawal"
                    }
                  />
                  <ReceiptRow
                    label="Status"
                    value={formatEnumLabel(withdrawal.status)}
                    helperText={getWithdrawalReceiptStatusHelperText(
                      withdrawal.status,
                    )}
                  />
                </div>

                <div
                  className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "px-4 sm:px-5")}
                >
                  <ReceiptRow
                    label="Source"
                    value={sourceLabel}
                    helperText={
                      isAutoAllocation
                        ? "Automatically split across eligible balances."
                        : null
                    }
                  />
                  <ReceiptRow
                    label="Calculated commission / fee"
                    value={formatCurrency(
                      commissionDueAmount,
                      withdrawal.currency,
                    )}
                    helperText={
                      commissionSourceType === "SAVINGS_ACCOUNT"
                        ? "Fixed fee applied to this withdrawal."
                        : commissionSourceType === "MIXED"
                          ? "Calculated from the mixed withdrawal allocation."
                          : "Calculated from the withdrawal commission settings."
                    }
                  />
                  {normalizedWithdrawalMode === "EARLY_WITHDRAWAL" ? (
                    <ReceiptRow
                      label="Early withdrawal penalty"
                      value={formatCurrency(
                        Number(normalizedEarlyWithdrawalPenalty ?? 0),
                        withdrawal.currency,
                      )}
                    />
                  ) : null}
                  {payoutSnapshot?.netPayoutAmount ? (
                    <ReceiptRow
                      label="Net payout"
                      value={formatCurrency(
                        Number(payoutSnapshot.netPayoutAmount),
                        withdrawal.currency,
                      )}
                    />
                  ) : null}
                </div>
              </div>

              {canShowCommissionCallout ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-amber-950 shadow-sm sm:p-5 dark:text-amber-50">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-amber-700 dark:text-amber-200">
                        Commission payment
                      </p>
                      <p className="break-words text-lg font-medium text-balance text-slate-900 dark:text-white">
                        {isCommissionUnderReview
                          ? "Your commission proof is under review."
                          : `Pay commission ${formatCurrency(
                              commissionDueAmount,
                              withdrawal.currency,
                            )}`}
                      </p>
                      <p className="text-sm leading-6 text-slate-700 dark:text-amber-100/80">
                        {isCommissionUnderReview
                          ? "You can check back once the admin team confirms the payment."
                          : "Submit commission payment before this withdrawal can continue."}
                      </p>
                    </div>

                    {isCommissionUnderReview ? (
                      <Button
                        type="button"
                        disabled
                        className="w-full rounded-full bg-amber-50 text-slate-950 hover:bg-white sm:w-auto"
                      >
                        Payment under review
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className="w-full rounded-full bg-amber-50 text-slate-950 hover:bg-white sm:w-auto"
                      >
                        <Link
                          href={buildWithdrawalCommissionCheckoutUrl(
                            withdrawal.id,
                          )}
                        >
                          Pay commission{" "}
                          {formatCurrency(
                            commissionDueAmount,
                            withdrawal.currency,
                          )}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ) : null}

              {paymentMethodSnapshot.review.status === "UPDATED" ? (
                <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4 text-slate-950 shadow-sm sm:p-5 dark:text-sky-50">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-sky-700 dark:text-sky-200">
                    Support note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-800 dark:text-slate-100">
                    For Western Union and cash delivery, a 2% fee is applied.
                    Contact support for more information.
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {supportFeeAmount !== null && !isFeeSettled ? (
                      isFeeUnderReview ? (
                        <Button
                          type="button"
                          disabled
                          className="w-full rounded-full bg-sky-50 text-slate-950 hover:bg-white sm:w-auto"
                        >
                          Payment under review
                        </Button>
                      ) : (
                        <Button
                          asChild
                          className="w-full rounded-full bg-sky-50 text-slate-950 hover:bg-white sm:w-auto"
                        >
                          <Link
                            href={buildWithdrawalFeeCheckoutUrl(withdrawal.id, {
                              suggestedAmount: supportFeeAmount,
                            })}
                          >
                            Pay fee{" "}
                            {formatCurrency(
                              supportFeeAmount,
                              withdrawal.currency,
                            )}
                          </Link>
                        </Button>
                      )
                    ) : null}
                    <WithdrawalPrivateSupportChatButton
                      withdrawalId={withdrawal.id}
                    />
                  </div>
                </div>
              ) : null}

              {isAutoAllocation ? (
                <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-4 sm:p-5")}>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    Allocation breakdown
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {allocations.map((allocation) => (
                      <div
                        key={`${allocation.sourceType ?? "source"}-${allocation.sourceLabel ?? "allocation"}-${allocation.sourceGrossAmount ?? "0"}`}
                        className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-4")}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="break-words text-sm text-slate-950 dark:text-white">
                              {allocation.sourceLabel ?? "Withdrawal source"}
                            </p>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                              Gross:{" "}
                              {formatCurrency(
                                Number(allocation.sourceGrossAmount ?? 0),
                                allocation.currency ?? withdrawal.currency,
                              )}
                            </p>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 sm:text-right">
                            <p>
                              Penalty:{" "}
                              {formatCurrency(
                                Number(allocation.sourcePenaltyAmount ?? 0),
                                allocation.currency ?? withdrawal.currency,
                              )}
                            </p>
                            <p className="mt-1 text-slate-950 dark:text-white">
                              Net:{" "}
                              {formatCurrency(
                                Number(allocation.sourceNetAmount ?? 0),
                                allocation.currency ?? withdrawal.currency,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {isWithdrawalTerminalStatus(withdrawal.status) ? (
                <WithdrawalTerminalNotice
                  status={withdrawal.status}
                  reason={withdrawal.rejectionReason}
                />
              ) : commissionPayment?.reviewStatus === "PENDING_REVIEW" &&
                !isWithdrawalCommissionSettledStatus(
                  withdrawal.commissionStatus,
                ) ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-amber-950 shadow-sm sm:p-5 dark:text-amber-50">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-amber-700 dark:text-amber-200">
                    Commission under review
                  </p>
                  <p className="mt-2 text-lg font-medium text-balance text-slate-900 dark:text-white">
                    Your withdrawal commission proof is awaiting admin review.
                  </p>
                  <p className="mt-1 text-sm text-amber-800 dark:text-amber-100/80">
                    You can check back once the admin team confirms the payment.
                  </p>
                </div>
              ) : null}

              {paymentMethodSnapshot.review.status === "UPDATED" ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-emerald-950 shadow-sm sm:p-5 dark:text-emerald-50">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-200">
                    Payment method updated
                  </p>
                  <p className="mt-2 text-lg font-medium text-balance text-slate-900 dark:text-white">
                    Updated payout details have been submitted.
                  </p>
                  <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-100/80">
                    The current payout method is now{" "}
                    {effectivePaymentMethodLabel}.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
