"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bitcoin, Landmark, Shield } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WithdrawalTerminalNotice } from "@/components/withdrawals/WithdrawalTerminalNotice";
import { formatCurrency } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";
import type { WithdrawalFeeCheckoutDetails } from "@/lib/types/payments/withdrawalFee.types";
import {
  getCheckoutFundingMethodLabel,
  type CheckoutFundingMethodType,
} from "@/lib/types/payments/checkout.types";
import {
  getWithdrawalTerminalStatusDescription,
  getWithdrawalTerminalStatusTitle,
  isWithdrawalCompletedStatus,
} from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";

import CheckoutFundingMethodSelector from "./CheckoutFundingMethodSelector";
import { CopyableDetailRow } from "./CopyableDetailRow";
import WithdrawalFeeProofModal from "./WithdrawalFeeProofModal";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../_components/dashboardSurfaces";

function normalizeFundingMethodType(
  value: string | null | undefined,
): CheckoutFundingMethodType | null {
  if (value === "BANK_TRANSFER" || value === "CRYPTO_PROVIDER") {
    return value;
  }

  return null;
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "rounded-2xl p-4")}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default function WithdrawalFeeFunding({
  details,
  fundingMethodType,
  suggestedAmount,
}: {
  details: WithdrawalFeeCheckoutDetails;
  fundingMethodType: CheckoutFundingMethodType | null;
  suggestedAmount?: number | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialFundingMethod =
    normalizeFundingMethodType(fundingMethodType) ?? "BANK_TRANSFER";
  const [selectedFundingMethod, setSelectedFundingMethod] =
    useState<CheckoutFundingMethodType | null>(initialFundingMethod);
  const [proofOpen, setProofOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const updateCheckoutParams = ({
    nextFundingMethod,
  }: {
    nextFundingMethod?: CheckoutFundingMethodType | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextFundingMethod === null) {
      params.delete("fundingMethodType");
    } else if (nextFundingMethod) {
      params.set("fundingMethodType", nextFundingMethod);
    }

    const nextUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  async function handleCopyWalletAddress(address: string | null | undefined) {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
      toast.success("Copied.");
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Unable to copy.");
    }
  }

  const bankMethod = details.paymentMethod;
  const cryptoSelected = selectedFundingMethod === "CRYPTO_PROVIDER";
  const effectiveSuggestedAmount =
    typeof suggestedAmount === "number" &&
    Number.isFinite(suggestedAmount) &&
    suggestedAmount > 0
      ? Math.min(suggestedAmount, details.remainingFeeAmount)
      : details.remainingFeeAmount;
  const canOpenProof =
    details.remainingFeeAmount > 0 &&
    !!bankMethod &&
    !details.isUnderReview;

  if (details.isClosedWithdrawal) {
    const isCompletedWithdrawal = isWithdrawalCompletedStatus(
      details.withdrawal.status,
    );

    return (
      <div className="mx-auto max-w-3xl px-3 py-4 sm:px-4 sm:py-6 md:px-6">
        <Card
          className={cn(
            DASHBOARD_PAGE_PANEL_CLASS,
            "rounded-[1.35rem] sm:rounded-[1.75rem]",
            isCompletedWithdrawal
              ? "border-emerald-400/20 bg-emerald-500/10 dark:border-emerald-300/20 dark:bg-slate-900/60"
              : "border-rose-400/20 bg-rose-500/10 dark:border-rose-300/20 dark:bg-slate-900/60",
          )}
        >
          <CardHeader className="p-4 sm:p-6">
            <CardTitle
              className={cn(
                "text-base sm:text-lg",
                isCompletedWithdrawal
                  ? "text-emerald-950 dark:text-white"
                  : "text-white",
              )}
            >
              {getWithdrawalTerminalStatusTitle(details.withdrawal.status)}
            </CardTitle>
            <p
              className={cn(
                "mt-1 text-sm leading-6",
                isCompletedWithdrawal
                  ? "text-emerald-900/90 dark:text-emerald-100/90"
                  : "text-rose-100/90",
              )}
            >
              {getWithdrawalTerminalStatusDescription(details.withdrawal.status)}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
            <WithdrawalTerminalNotice
              status={details.withdrawal.status}
              reason={details.withdrawal.rejectionReason}
            />

            <div className="flex justify-end">
              <Button
                asChild
                className="rounded-full bg-white text-slate-950 hover:bg-slate-100"
              >
                <Link
                  href={`/account/dashboard/user/withdrawals/${details.withdrawal.id}`}
                >
                  View withdrawal
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3 py-4 sm:space-y-8 sm:px-4 sm:py-6 md:px-6">
      <div className={cn(DASHBOARD_PAGE_PANEL_CLASS, "w-full p-4 sm:p-6")}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Withdrawal fee
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950 sm:text-xl dark:text-white">
              {details.withdrawal.sourceLabel}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400">
              Choose a funding method, then submit proof after you have paid the
              applied withdrawal fee shown below.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryChip
            label="Fee amount"
            value={formatCurrency(details.feeAmount, details.withdrawal.currency)}
          />
          <SummaryChip
            label="Paid so far"
            value={formatCurrency(
              details.paidFeeAmount,
              details.withdrawal.currency,
            )}
          />
          <SummaryChip
            label="Remaining"
            value={formatCurrency(
              details.remainingFeeAmount,
              details.withdrawal.currency,
            )}
          />
        </div>
      </div>

      <CheckoutFundingMethodSelector
        value={selectedFundingMethod}
        onChange={(next) => {
          setSelectedFundingMethod(next);
          updateCheckoutParams({ nextFundingMethod: next });
        }}
        title="Choose payment route"
        description="Select bank transfer or crypto to continue paying the withdrawal fee."
      />

      {details.isUnderReview ? (
        <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, "w-full border-amber-200/70 bg-amber-50/90 dark:border-amber-400/20 dark:bg-slate-900/60")}>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
              Fee under review
            </CardTitle>
            <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400">
              Your fee proof has been submitted and is waiting for admin
              confirmation. You cannot submit another payment while it is being
              reviewed.
            </p>
          </CardHeader>
        </Card>
      ) : null}

      {!details.isSettled &&
      !details.isUnderReview &&
      selectedFundingMethod === "BANK_TRANSFER" &&
      !bankMethod ? (
        <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, "w-full")}>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
              Bank details unavailable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Bank details are not available yet. Please try crypto payment or
              contact support for help with this withdrawal fee payment.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {!details.isSettled &&
      selectedFundingMethod &&
      (cryptoSelected || bankMethod) ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)]">
          <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, "w-full")}>
            <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
              <div className="min-w-0">
                <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
                  {cryptoSelected ? "Crypto wallet funding" : "Bank transfer funding"}
                </CardTitle>
                <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400">
                  {cryptoSelected
                    ? "This fee checkout is set to the crypto wallet route."
                    : "Use the bank details below to send your transfer, then submit your proof for review."}
                </p>
              </div>

              <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "inline-flex max-w-full items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300")}>
                {cryptoSelected ? (
                  <>
                    <Bitcoin className="h-4 w-4 shrink-0 text-amber-400" />
                    <span className="truncate">Bitcoin</span>
                  </>
                ) : (
                  <>
                    <Landmark className="h-4 w-4 shrink-0" />
                    <span className="truncate">Bank transfer</span>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
              {cryptoSelected ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="w-full rounded-[1.15rem] border border-amber-200/20 bg-amber-50/90 p-4 shadow-sm sm:rounded-[1.25rem] dark:border-amber-300/20 dark:bg-slate-900/60">
                    <p className="text-xs uppercase tracking-[0.18em] text-amber-700/80 dark:text-amber-200/80">
                      Funding method
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                      Crypto wallet
                    </p>
                  </div>
                  <div className="w-full rounded-[1.15rem] border border-amber-200/20 bg-amber-50/90 p-4 shadow-sm sm:rounded-[1.25rem] dark:border-amber-300/20 dark:bg-slate-900/60">
                    <p className="text-xs uppercase tracking-[0.18em] text-amber-700/80 dark:text-amber-200/80">
                      Fee amount
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                      {formatCurrency(
                        details.remainingFeeAmount,
                        details.withdrawal.currency,
                      )}
                    </p>
                  </div>
                </div>
              ) : bankMethod ? (
                <div className="grid gap-3">
                  <CopyableDetailRow
                    label="Bank name"
                    value={bankMethod.bankName}
                  />
                  <CopyableDetailRow
                    label="Account name"
                    value={bankMethod.accountName}
                  />
                  <CopyableDetailRow
                    label="Reference"
                    value={bankMethod.reference}
                  />
                  <CopyableDetailRow
                    label="Bank address"
                    value={bankMethod.bankAddress}
                  />
                  <CopyableDetailRow
                    label="Account number"
                    value={bankMethod.accountNumber}
                  />
                  <CopyableDetailRow
                    label="Bank code"
                    value={bankMethod.bankCode}
                  />
                  <CopyableDetailRow
                    label="Wire routing number"
                    value={bankMethod.routingNumber}
                  />

                  {bankMethod.instructions ? (
                    <div className="w-full rounded-[1.15rem] border border-slate-200/80 bg-slate-50/95 p-4 dark:border-white/10 dark:bg-slate-900/60 sm:rounded-[1.25rem]">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Instructions
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {bankMethod.instructions}
                      </p>
                    </div>
                  ) : null}

                  {bankMethod.notes ? (
                    <div className="w-full rounded-[1.15rem] border border-slate-200/80 bg-slate-50/95 p-4 dark:border-white/10 dark:bg-slate-900/60 sm:rounded-[1.25rem]">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Notes
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {bankMethod.notes}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="rounded-[1.15rem] border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:rounded-[1.25rem]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Payment route
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {getCheckoutFundingMethodLabel(selectedFundingMethod)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setProofOpen(true)}
                    disabled={!canOpenProof}
                    className="rounded-full bg-slate-950 px-5 text-white shadow-[0_12px_28px_rgba(2,6,23,0.32)] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  >
                    {details.isUnderReview
                      ? "Payment under review"
                      : canOpenProof
                        ? "I've made this payment"
                        : "Fee unavailable"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedFundingMethod === "CRYPTO_PROVIDER" && bankMethod ? (
            <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, "w-full")}>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
                  Crypto wallet details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
                {bankMethod.walletAddress ? (
                  <>
                    <div className="rounded-[1.15rem] border border-slate-200/80 bg-white/80 p-3 dark:border-white/10 dark:bg-white/[0.03] sm:rounded-[1.25rem]">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Wallet address
                      </p>
                      <p className="mt-2 break-all text-sm font-medium text-slate-950 dark:text-white">
                        {bankMethod.walletAddress}
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          void handleCopyWalletAddress(bankMethod.walletAddress)
                        }
                        className="rounded-full border-slate-200/80 bg-white/80 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200"
                      >
                        {isCopied ? "Copied" : "Copy wallet address"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-[1.15rem] border border-slate-200/80 bg-slate-50/95 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300">
                    No wallet address is currently available for this fee payment.
                  </div>
                )}
                {bankMethod.notes ? (
                  <div className="rounded-[1.15rem] border border-slate-200/80 bg-slate-50/95 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300">
                    {bankMethod.notes}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      {details.isSettled ? (
        <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, "w-full border-emerald-200/70 bg-emerald-50/90 dark:border-emerald-400/20 dark:bg-slate-900/60")}>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
              Fee settled
            </CardTitle>
            <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400">
              This withdrawal fee has already been paid and no further proof is
              required.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4 text-sm text-slate-600 sm:px-6 sm:pb-6 dark:text-slate-300">
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryChip
                label="Fee amount"
                value={formatCurrency(details.feeAmount, details.withdrawal.currency)}
              />
              <SummaryChip
                label="Status"
                value={
                  details.feePayment?.reviewStatus === "APPROVED"
                    ? "Approved"
                    : "Settled"
                }
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {proofOpen && selectedFundingMethod === "BANK_TRANSFER" && bankMethod ? (
        <WithdrawalFeeProofModal
          open={proofOpen}
          onOpenChange={setProofOpen}
          withdrawalId={details.withdrawal.id}
          platformPaymentMethodId={bankMethod.id}
          currency={details.withdrawal.currency}
          defaultAmount={effectiveSuggestedAmount}
          maxAmount={details.remainingFeeAmount}
        />
      ) : proofOpen &&
        selectedFundingMethod === "CRYPTO_PROVIDER" &&
        bankMethod ? (
        <WithdrawalFeeProofModal
          open={proofOpen}
          onOpenChange={setProofOpen}
          withdrawalId={details.withdrawal.id}
          platformPaymentMethodId={bankMethod.id}
          currency={details.withdrawal.currency}
          defaultAmount={effectiveSuggestedAmount}
          maxAmount={details.remainingFeeAmount}
          mode="CRYPTO_PROVIDER"
        />
      ) : null}

      <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "flex w-full items-start justify-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm text-slate-500 sm:items-center sm:rounded-[1.5rem] dark:text-slate-300")}>
        <Shield className="h-4 w-4 text-sky-500" />
        <span className="max-w-[32rem] text-center sm:text-left">
          Secure and encrypted payment flow
        </span>
      </div>
    </div>
  );
}
