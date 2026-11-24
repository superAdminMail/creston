import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Landmark,
  Wallet,
  AlertCircle,
  Layers3,
  ReceiptText,
  ShieldAlert,
} from "lucide-react";

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

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-800 dark:text-sky-300">
        {eyebrow}
      </p>
      <h2 className="text-base font-semibold tracking-tight text-slate-950 dark:text-white">
        {title}
      </h2>
      {description ? (
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ReceiptRow({
  label,
  value,
  helperText,
  icon,
}: {
  label: string;
  value: ReactNode;
  helperText?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-200/70 py-4 last:border-b-0 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="flex min-w-0 items-start gap-2.5">
        {icon ? (
          <span className="mt-0.5 text-slate-500 dark:text-slate-400">
            {icon}
          </span>
        ) : null}
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {label}
        </span>
      </div>
      <div className="min-w-0 space-y-1 sm:max-w-[60%] sm:text-right">
        <div className="break-words text-sm font-semibold leading-6 text-slate-950 dark:text-white">
          {value}
        </div>
        {helperText ? (
          <div className="break-words text-xs leading-5 text-slate-600 dark:text-slate-400">
            {helperText}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InformationCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        DASHBOARD_PAGE_SURFACE_CLASS,
        "min-w-0 p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ActionNotice({
  tone,
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  tone: "amber" | "sky" | "emerald";
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  children?: ReactNode;
}) {
  const styles = {
    amber: {
      wrapper:
        "border-amber-300/80 bg-amber-50/80 dark:border-amber-400/20 dark:bg-amber-500/[0.08]",
      icon: "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200",
      eyebrow: "text-amber-800 dark:text-amber-300",
      title: "text-amber-950 dark:text-amber-50",
      description: "text-amber-900/80 dark:text-amber-100/80",
    },
    sky: {
      wrapper:
        "border-sky-200 bg-sky-50/80 dark:border-sky-400/20 dark:bg-sky-500/[0.08]",
      icon: "bg-sky-100 text-sky-800 dark:bg-sky-400/10 dark:text-sky-200",
      eyebrow: "text-sky-800 dark:text-sky-300",
      title: "text-slate-950 dark:text-white",
      description: "text-slate-700 dark:text-slate-300",
    },
    emerald: {
      wrapper:
        "border-emerald-200 bg-emerald-50/80 dark:border-emerald-400/20 dark:bg-emerald-500/[0.08]",
      icon: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200",
      eyebrow: "text-emerald-800 dark:text-emerald-300",
      title: "text-slate-950 dark:text-white",
      description: "text-emerald-900/80 dark:text-emerald-100/80",
    },
  }[tone];

  return (
    <div className={cn("rounded-2xl border p-4 sm:p-5", styles.wrapper)}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            styles.icon,
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.2em]",
              styles.eyebrow,
            )}
          >
            {eyebrow}
          </p>
          <h3 className={cn("mt-1 text-base font-semibold", styles.title)}>
            {title}
          </h3>
          <p className={cn("mt-1 text-sm leading-6", styles.description)}>
            {description}
          </p>
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
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

  const isTerminal = isWithdrawalTerminalStatus(withdrawal.status);
  const isPaymentMethodUnavailable =
    paymentMethodSnapshot.review.status === "UNAVAILABLE" && !isTerminal;
  const isPaymentMethodUpdated =
    paymentMethodSnapshot.review.status === "UPDATED";

  const withdrawalModeLabel =
    normalizedWithdrawalMode === "EARLY_WITHDRAWAL"
      ? "Early withdrawal"
      : "Normal withdrawal";

  return (
    <div className="relative mx-auto min-h-[calc(100vh-9rem)] w-full max-w-6xl">
      <div className="absolute inset-x-4 top-8 -z-10 h-40 rounded-[2rem] bg-[#3c9ee0]/10 blur-3xl" />

      <div className="space-y-5 sm:space-y-6">
        <Link
          href="/account/dashboard/user/withdrawals"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to withdrawals
        </Link>

        <section className={cn(DASHBOARD_PAGE_PANEL_CLASS, "overflow-hidden")}>
          <div className="space-y-6 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col gap-5 border-b border-slate-200/70 pb-6 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
                  <ReceiptText className="size-3.5" />
                  Withdrawal receipt
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Requested withdrawal amount
                  </p>
                  <h1 className="mt-2 break-words text-3xl font-bold tracking-[-0.045em] text-slate-950 sm:text-4xl md:text-5xl dark:text-white">
                    {formatCurrency(
                      Number(requestedAmount),
                      withdrawal.currency,
                    )}
                  </h1>
                  <p className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Layers3 className="size-4 shrink-0" />
                    {sourceLabel}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2 sm:items-end">
                <span
                  className={cn(
                    "inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold",
                    statusTone,
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {formatEnumLabel(withdrawal.status)}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Requested {withdrawal.requestedAt.toLocaleDateString()}
                </p>
              </div>
            </div>

            {isPaymentMethodUnavailable ? (
              <ActionNotice
                tone="amber"
                eyebrow="Action required"
                title="Your payout method is unavailable"
                description={
                  paymentMethodSnapshot.review.reason ??
                  "Alternate payout details are required before this withdrawal can be processed."
                }
                icon={<ShieldAlert className="size-5" />}
              >
                <WithdrawalPaymentMethodUpdateDrawer
                  withdrawalId={withdrawal.id}
                  paymentMethodLabel={effectivePaymentMethodLabel}
                  unavailableReason={paymentMethodSnapshot.review.reason}
                />
              </ActionNotice>
            ) : null}

            <div className="grid gap-5 xl:grid-cols-2">
              <InformationCard>
                <SectionHeading
                  eyebrow="Request information"
                  title="Withdrawal details"
                  description="The details submitted with this withdrawal request."
                />

                <div className="mt-3">
                  <ReceiptRow
                    label="Requested at"
                    value={withdrawal.requestedAt.toLocaleString()}
                    icon={<CalendarDays className="size-4" />}
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
                    icon={<CreditCard className="size-4" />}
                  />
                  <ReceiptRow
                    label="Withdrawal mode"
                    value={withdrawalModeLabel}
                    icon={<Wallet className="size-4" />}
                  />
                  <ReceiptRow
                    label="Status"
                    value={formatEnumLabel(withdrawal.status)}
                    helperText={getWithdrawalReceiptStatusHelperText(
                      withdrawal.status,
                    )}
                    icon={<Clock3 className="size-4" />}
                  />
                </div>
              </InformationCard>

              <InformationCard>
                <SectionHeading
                  eyebrow="Financial summary"
                  title="Charges and payout"
                  description="A breakdown of the fees and amounts associated with this request."
                />

                <div className="mt-3">
                  <ReceiptRow
                    label="Withdrawal source"
                    value={sourceLabel}
                    helperText={
                      isAutoAllocation
                        ? "Automatically split across eligible balances."
                        : null
                    }
                    icon={<Landmark className="size-4" />}
                  />
                  <ReceiptRow
                    label="Commission (Taxes and Platform fees)"
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
                    icon={<ReceiptText className="size-4" />}
                  />
                  {normalizedWithdrawalMode === "EARLY_WITHDRAWAL" ? (
                    <ReceiptRow
                      label="Early withdrawal penalty"
                      value={formatCurrency(
                        Number(normalizedEarlyWithdrawalPenalty ?? 0),
                        withdrawal.currency,
                      )}
                      icon={<AlertCircle className="size-4" />}
                    />
                  ) : null}
                  {payoutSnapshot?.netPayoutAmount ? (
                    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-400/20 dark:bg-emerald-500/[0.08]">
                      <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                        Net payout
                      </p>
                      <p className="mt-1 break-words text-2xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">
                        {formatCurrency(
                          Number(payoutSnapshot.netPayoutAmount),
                          withdrawal.currency,
                        )}
                      </p>
                    </div>
                  ) : null}
                </div>
              </InformationCard>
            </div>

            {isAutoAllocation && allocations.length > 0 ? (
              <InformationCard>
                <SectionHeading
                  eyebrow="Funding breakdown"
                  title="Allocation details"
                  description="How the requested amount was distributed across eligible withdrawal sources."
                />

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {allocations.map((allocation, index) => (
                    <div
                      key={`${allocation.sourceType ?? "source"}-${allocation.sourceLabel ?? "allocation"}-${index}`}
                      className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-slate-950 dark:text-white">
                            {allocation.sourceLabel ?? "Withdrawal source"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {formatEnumLabel(allocation.sourceType ?? "SOURCE")}
                          </p>
                        </div>
                        <span className="rounded-lg bg-white p-2 text-slate-500 shadow-sm dark:bg-white/[0.06] dark:text-slate-300">
                          <Wallet className="size-4" />
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 border-t border-slate-200/70 pt-3 dark:border-white/10">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Gross amount
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {formatCurrency(
                              Number(allocation.sourceGrossAmount ?? 0),
                              allocation.currency ?? withdrawal.currency,
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Penalty
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {formatCurrency(
                              Number(allocation.sourcePenaltyAmount ?? 0),
                              allocation.currency ?? withdrawal.currency,
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-2 text-xs dark:border-white/10">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Net amount
                          </span>
                          <span className="font-semibold text-slate-950 dark:text-white">
                            {formatCurrency(
                              Number(allocation.sourceNetAmount ?? 0),
                              allocation.currency ?? withdrawal.currency,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </InformationCard>
            ) : null}

            {canShowCommissionCallout ? (
              <ActionNotice
                tone="amber"
                eyebrow="Commission payment"
                title={
                  isCommissionUnderReview
                    ? "Your commission proof is under review"
                    : "Commission payment is required"
                }
                description={
                  isCommissionUnderReview
                    ? "You can check back once the admin team confirms the payment."
                    : "Submit commission payment to complete this withdrawal."
                }
                icon={<ReceiptText className="size-5" />}
              >
                {isCommissionUnderReview ? (
                  <Button
                    type="button"
                    disabled
                    className="w-full rounded-full sm:w-auto"
                  >
                    Payment under review
                  </Button>
                ) : (
                  <Button asChild className="w-full rounded-full sm:w-auto">
                    <Link
                      href={buildWithdrawalCommissionCheckoutUrl(withdrawal.id)}
                    >
                      Pay{" "}
                      {formatCurrency(commissionDueAmount, withdrawal.currency)}
                      <ArrowUpRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                )}
              </ActionNotice>
            ) : null}

            {isPaymentMethodUpdated ? (
              <ActionNotice
                tone="sky"
                eyebrow="Payout details updated"
                title="Your alternate payout details have been submitted"
                description="For Western Union and cash delivery, a 2% fee is applied. Contact support for more information."
                icon={<CheckCircle2 className="size-5" />}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {supportFeeAmount !== null && !isFeeSettled ? (
                    isFeeUnderReview ? (
                      <Button
                        type="button"
                        disabled
                        className="w-full rounded-full sm:w-auto"
                      >
                        Payment under review
                      </Button>
                    ) : (
                      <Button asChild className="w-full rounded-full sm:w-auto">
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
                          <ArrowUpRight className="ml-2 size-4" />
                        </Link>
                      </Button>
                    )
                  ) : null}

                  <WithdrawalPrivateSupportChatButton
                    withdrawalId={withdrawal.id}
                  />
                </div>
              </ActionNotice>
            ) : null}

            {isTerminal ? (
              <WithdrawalTerminalNotice
                status={withdrawal.status}
                reason={withdrawal.rejectionReason}
              />
            ) : commissionPayment?.reviewStatus === "PENDING_REVIEW" &&
              !isWithdrawalCommissionSettledStatus(
                withdrawal.commissionStatus,
              ) ? (
              <ActionNotice
                tone="amber"
                eyebrow="Commission under review"
                title="Your commission proof is awaiting admin review"
                description="You can check back once the admin team confirms the payment."
                icon={<Clock3 className="size-5" />}
              />
            ) : null}

            {isPaymentMethodUpdated ? (
              <ActionNotice
                tone="emerald"
                eyebrow="Payment method updated"
                title="Updated payout details have been submitted"
                description={`The current payout method is now ${effectivePaymentMethodLabel}.`}
                icon={<CheckCircle2 className="size-5" />}
              />
            ) : null}

            <div className="flex flex-col gap-3 border-t border-slate-200/70 pt-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                <FileText className="mt-0.5 size-4 shrink-0" />
                <p>
                  Keep this receipt for your records. You can return to your
                  withdrawal history to review other requests.
                </p>
              </div>
              <Button
                asChild
                variant="default"
                className="w-full rounded-full sm:w-auto"
              >
                <Link href="/account/dashboard/user/withdrawals">
                  View withdrawals
                  <ArrowUpRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
