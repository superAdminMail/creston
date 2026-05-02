"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bitcoin, Copy, Landmark, Shield, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { requestSavingsFundingBankInfo } from "@/actions/savings/requestSavingsFundingBankInfo";
import CryptoQRCode from "@/components/payments/CryptoQRCode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters/formatters";
import type { SavingsFundingDetails } from "@/lib/types/payments/savingsFunding.types";
import {
  getCheckoutFundingMethodLabel,
  getCheckoutPaymentModeLabel,
  type CheckoutFundingMethodType,
  type CheckoutPaymentMode,
} from "@/lib/types/payments/checkout.types";

import CheckoutFundingMethodSelector from "./CheckoutFundingMethodSelector";
import CheckoutPaymentModeSelector from "./CheckoutPaymentModeSelector";
import SavingsFundingProofModal from "./SavingsFundingProofModal";

function normalizeFundingMethodType(
  value: string | null | undefined,
): CheckoutFundingMethodType | null {
  if (value === "BANK_TRANSFER" || value === "CRYPTO_PROVIDER") {
    return value;
  }

  return null;
}

function normalizePaymentMode(
  value: string | null | undefined,
): CheckoutPaymentMode | null {
  if (value === "FULL" || value === "PARTIAL") {
    return value;
  }

  return null;
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 py-3 last:border-b-0 dark:border-white/10">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-right text-sm font-medium text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default function SavingsFundingClient({
  details,
  fundingMethodType,
  paymentMode,
  selectedAmount,
  cryptoCheckoutButton,
}: {
  details: SavingsFundingDetails;
  fundingMethodType: CheckoutFundingMethodType | null;
  paymentMode: CheckoutPaymentMode | null;
  selectedAmount: number;
  cryptoCheckoutButton?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialFundingMethod =
    normalizeFundingMethodType(details.latestIntent?.fundingMethodType) ??
    fundingMethodType ??
    null;

  const [selectedFundingMethod, setSelectedFundingMethod] =
    useState<CheckoutFundingMethodType | null>(initialFundingMethod);
  const [selectedPaymentMode, setSelectedPaymentMode] =
    useState<CheckoutPaymentMode | null>(normalizePaymentMode(paymentMode));
  const [proofOpen, setProofOpen] = useState(false);
  const [isRequestingBankInfo, setIsRequestingBankInfo] = useState(false);
  const [bankInfoRequestedLocal, setBankInfoRequestedLocal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  async function handleRequestBankInfo() {
    if (isRequestingBankInfo || bankInfoRequested) return;

    setIsRequestingBankInfo(true);

    try {
      const result = await requestSavingsFundingBankInfo(details.account.id);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setBankInfoRequestedLocal(true);
      toast.success(result.message);
    } finally {
      setIsRequestingBankInfo(false);
    }
  }

  const updateCheckoutParams = ({
    nextFundingMethod,
    nextPaymentMode,
  }: {
    nextFundingMethod?: CheckoutFundingMethodType | null;
    nextPaymentMode?: CheckoutPaymentMode | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextFundingMethod === null) {
      params.delete("fundingMethodType");
    } else if (nextFundingMethod) {
      params.set("fundingMethodType", nextFundingMethod);
    }

    if (nextPaymentMode === null) {
      params.delete("paymentMode");
    } else if (nextPaymentMode) {
      params.set("paymentMode", nextPaymentMode);
    }

    const nextUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  const bankMethod = details.bankMethod;
  const latestIntent = details.latestIntent;
  const latestBankPayment = latestIntent?.latestPayment ?? null;
  const latestPaymentShortfall =
    details.latestFundingPaymentShortfallAmount ?? 0;
  const hasExistingIntent = latestIntent !== null;
  const isCompletingPayment = latestIntent?.status === "PARTIALLY_PAID";
  const isSavingsFullySettled =
    (details.account.targetAmount !== null &&
      details.account.balance >= details.account.targetAmount) ||
    latestIntent?.status === "PAID" ||
    latestIntent?.status === "CREDITED";
  const hasPendingSubmission = details.hasPendingSubmission;

  const cryptoSelected = selectedFundingMethod === "CRYPTO_PROVIDER";
  const bankSelected = selectedFundingMethod === "BANK_TRANSFER";
  const effectivePaymentMode = hasExistingIntent
    ? isCompletingPayment
      ? "PARTIAL"
      : "FULL"
    : cryptoSelected
      ? "FULL"
      : selectedPaymentMode;
  const bankInfoRequested =
    details.hasExistingBankInfoRequest || bankInfoRequestedLocal;
  const canOpenProof = bankSelected && effectivePaymentMode !== null;
  const bankProofActionLabel = isSavingsFullySettled
    ? "Payment complete"
    : latestBankPayment?.status === "PENDING_REVIEW" || hasPendingSubmission
      ? "Payment under review"
      : isCompletingPayment
        ? "Complete Payment"
        : "I've made this payment";
  const bankProofActionDisabled =
    isSavingsFullySettled || latestBankPayment?.status === "PENDING_REVIEW";

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

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3 py-4 sm:space-y-8 sm:px-4 sm:py-6 md:px-6">
      <div className="w-full rounded-[1.35rem] border border-slate-200/80 bg-white/78 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[1.75rem] sm:p-6 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.92),rgba(5,11,31,0.96))]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Savings funding
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950 sm:text-xl dark:text-white">
              {details.account.product.name}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400">
              Choose a funding method, then continue with a full payment for
              crypto wallet or a full or partial payment for bank transfer.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryChip
            label="Funding method"
            value={getCheckoutFundingMethodLabel(selectedFundingMethod)}
          />
          <SummaryChip
            label="Payment mode"
            value={getCheckoutPaymentModeLabel(effectivePaymentMode)}
          />
          <SummaryChip
            label="Selected amount"
            value={formatCurrency(selectedAmount, details.account.currency)}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryChip label="Balance" value={details.balanceLabel} />
          <SummaryChip label="Target" value={details.targetAmountLabel} />
          <SummaryChip
            label="Remaining"
            value={details.remainingToTargetAmountLabel ?? "Not set"}
          />
        </div>
      </div>

      <CheckoutFundingMethodSelector
        value={selectedFundingMethod}
        onChange={(next) => {
          setSelectedFundingMethod(next);
          if (next === "CRYPTO_PROVIDER") {
            setSelectedPaymentMode("FULL");
            updateCheckoutParams({
              nextFundingMethod: next,
              nextPaymentMode: "FULL",
            });
            return;
          }

          updateCheckoutParams({ nextFundingMethod: next });
        }}
      />

      {!selectedFundingMethod ? (
        <Card className="w-full rounded-[1.35rem] border border-slate-200/80 bg-white/88 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[1.75rem] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
              Payment mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Select either bank transfer or crypto to continue.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {bankSelected && !hasExistingIntent && !isSavingsFullySettled ? (
        <CheckoutPaymentModeSelector
          value={selectedPaymentMode}
          onChange={(next) => {
            setSelectedPaymentMode(next);
            updateCheckoutParams({ nextPaymentMode: next });
          }}
        />
      ) : null}

      {!isSavingsFullySettled && selectedFundingMethod === "BANK_TRANSFER" && !bankMethod ? (
        <Card className="w-full rounded-[1.35rem] border border-slate-200/80 bg-white/88 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[1.75rem] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
              Bank details unavailable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Bank details are not available yet. Request them from the admin
              team so they can set up the transfer method for this checkout.
            </p>

            <div className="flex justify-start">
              <Button
                type="button"
                onClick={() => void handleRequestBankInfo()}
                disabled={isRequestingBankInfo || bankInfoRequested}
                className="rounded-full bg-slate-950 px-5 text-white shadow-[0_12px_28px_rgba(2,6,23,0.32)] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                {isRequestingBankInfo
                  ? "Sending..."
                  : bankInfoRequested
                    ? "Request Sent"
                    : "Request Bank Info"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {selectedFundingMethod &&
      !isSavingsFullySettled &&
      effectivePaymentMode &&
      (cryptoSelected || bankMethod) ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)]">
          <Card className="w-full rounded-[1.35rem] border border-slate-200/80 bg-white/88 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[1.75rem] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
            <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
              <div className="min-w-0">
                <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
                  {cryptoSelected
                    ? "Crypto wallet funding"
                    : "Bank transfer funding"}
                </CardTitle>
                <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400">
                  {cryptoSelected
                    ? "This checkout is set to Bitcoin wallet funding."
                    : "Use the bank details below to send your transfer, then submit your funding proof for review."}
                </p>
              </div>

              <div className="inline-flex max-w-full items-center gap-2 self-start rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
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
                  <div className="w-full rounded-[1.15rem] border border-amber-200/20 bg-amber-50/80 p-4 shadow-sm backdrop-blur sm:rounded-[1.25rem] dark:border-amber-300/20 dark:bg-white/[0.04]">
                    <p className="text-xs uppercase tracking-[0.18em] text-amber-700/80 dark:text-amber-200/80">
                      Funding method
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                      Crypto wallet
                    </p>
                  </div>
                  <div className="w-full rounded-[1.15rem] border border-amber-200/20 bg-amber-50/80 p-4 shadow-sm backdrop-blur sm:rounded-[1.25rem] dark:border-amber-300/20 dark:bg-white/[0.04]">
                    <p className="text-xs uppercase tracking-[0.18em] text-amber-700/80 dark:text-amber-200/80">
                      Payment mode
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                      {getCheckoutPaymentModeLabel(effectivePaymentMode)}
                    </p>
                  </div>
                </div>
              ) : bankMethod ? (
                <div className="grid gap-3">
                  <DetailRow
                    label="Bank name"
                    value={bankMethod.bankName}
                  />
                  <DetailRow
                    label="Account name"
                    value={bankMethod.accountName}
                  />
                  <DetailRow
                    label="Reference"
                    value={bankMethod.reference}
                  />
                  <DetailRow
                    label="Bank address"
                    value={bankMethod.bankAddress}
                  />
                  <DetailRow
                    label="Account number"
                    value={bankMethod.accountNumber}
                  />
                  <DetailRow
                    label="Bank code"
                    value={bankMethod.bankCode}
                  />
                  <DetailRow
                    label="Wire routing number"
                    value={bankMethod.routingNumber}
                  />

                  {bankMethod.instructions ? (
                    <div className="w-full rounded-[1.15rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:rounded-[1.25rem]">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Instructions
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {bankMethod.instructions}
                      </p>
                    </div>
                  ) : null}

                  {bankMethod.notes ? (
                    <div className="w-full rounded-[1.15rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:rounded-[1.25rem]">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Notes
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {bankMethod.notes}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="w-full rounded-[1.15rem] border border-dashed border-slate-300/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:rounded-[1.25rem]">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Bank details are not available yet.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    A platform bank method must be available before you can
                    submit a bank transfer proof.
                  </p>

                  <div className="mt-4 flex justify-start">
                    <Button
                      type="button"
                      onClick={() => void handleRequestBankInfo()}
                      disabled={isRequestingBankInfo || bankInfoRequested}
                      className="rounded-full bg-slate-950 px-5 text-white shadow-[0_12px_28px_rgba(2,6,23,0.32)] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                      {isRequestingBankInfo
                        ? "Sending..."
                        : bankInfoRequested
                          ? "Request Sent"
                          : "Request Bank Info"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="w-full rounded-[1.35rem] border border-slate-200/80 bg-white/88 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[1.75rem] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
                {cryptoSelected ? "Crypto wallet preview" : "Funding proof"}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
              {cryptoSelected ? (
                <div className="space-y-4">
                  <div className="w-full rounded-[1.15rem] border border-amber-200/20 bg-amber-50/80 p-4 shadow-sm backdrop-blur sm:rounded-[1.25rem] dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex items-start gap-3 sm:items-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/15 text-amber-500 dark:text-amber-200">
                        <Bitcoin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">
                          Crypto wallet selected
                        </p>
                        <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                          Pay from your crypto wallet
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <SummaryChip
                      label="Deposit amount"
                      value={formatCurrency(
                        selectedAmount,
                        details.account.currency,
                      )}
                    />
                    <SummaryChip
                      label="Payment mode"
                      value={getCheckoutPaymentModeLabel("FULL")}
                    />
                  </div>

                  {bankMethod?.walletAddress ? (
                    <div className="rounded-[1.15rem] border border-amber-200/20 bg-amber-50/80 p-4 shadow-sm backdrop-blur sm:rounded-[1.25rem] dark:border-amber-300/20 dark:bg-white/[0.04]">
                      <p className="text-xs uppercase tracking-[0.18em] text-amber-700/80 dark:text-amber-200/80">
                        Platform wallet address
                      </p>
                      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="break-all text-sm font-medium leading-6 text-slate-950 dark:text-white">
                          {bankMethod.walletAddress}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            void handleCopyWalletAddress(
                              bankMethod.walletAddress,
                            )
                          }
                          className="w-full rounded-full border-slate-200/80 bg-white/70 px-4 text-slate-700 shadow-sm hover:bg-white sm:w-auto dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
                        >
                          <Copy className="h-4 w-4" />
                          {isCopied ? "Copied" : "Copy"}
                        </Button>
                      </div>

                      <div className="mt-4 flex justify-center">
                        <CryptoQRCode
                          address={bankMethod.walletAddress}
                          amount={selectedAmount}
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="w-full rounded-[1.15rem] border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur sm:rounded-[1.25rem] dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                      Continue with the crypto checkout flow using the amount
                      selected above.
                    </p>
                  </div>

                  <div className="flex justify-start">
                    {cryptoCheckoutButton}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-full rounded-[1.15rem] border border-emerald-200/30 bg-emerald-50/90 p-4 shadow-sm backdrop-blur sm:rounded-[1.25rem] dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex items-start gap-3 sm:items-center">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                        <ShieldCheck className="h-5 w-5 shrink-0" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">
                          Ready for bank proof
                        </p>
                        <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                          {hasPendingSubmission
                            ? "A submission is already waiting for review."
                            : "Submit your transfer proof after sending the bank payment."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <SummaryChip
                      label="Selected amount"
                      value={formatCurrency(
                        selectedAmount,
                        details.account.currency,
                      )}
                    />
                    <SummaryChip
                      label="Bank method"
                      value={getCheckoutFundingMethodLabel(
                        selectedFundingMethod,
                      )}
                    />
                  </div>

                  <div className="rounded-[1.15rem] border border-sky-200/60 bg-sky-50/80 p-4 text-sm text-slate-700 shadow-sm backdrop-blur sm:rounded-[1.25rem] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-sky-700/80 dark:text-sky-200/80">
                      {selectedPaymentMode === "PARTIAL"
                        ? "Partial payment amount"
                        : "Payment amount"}
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">
                      {formatCurrency(selectedAmount, details.account.currency)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {selectedPaymentMode === "PARTIAL"
                        ? "Transfer this amount now and submit proof after payment."
                        : "Transfer this full amount and submit proof after payment."}
                    </p>
                    {bankSelected &&
                    latestIntent?.status === "PARTIALLY_PAID" &&
                    latestPaymentShortfall > 0 ? (
                      <p className="mt-2 text-xs leading-5 text-amber-700 dark:text-amber-300">
                        Includes previous bank shortfall of{" "}
                        {formatCurrency(
                          latestPaymentShortfall,
                          details.account.currency,
                        )}.
                      </p>
                    ) : null}
                  </div>

                  {bankMethod ? (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => setProofOpen(true)}
                        disabled={!canOpenProof || bankProofActionDisabled}
                        className="rounded-full bg-slate-950 px-5 text-white shadow-[0_12px_28px_rgba(2,6,23,0.32)] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                      >
                        {bankProofActionLabel}
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {isSavingsFullySettled ? (
        <Card className="w-full rounded-[1.35rem] border border-emerald-200/70 bg-emerald-50/90 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[1.75rem] dark:border-emerald-400/20 dark:bg-white/[0.04]">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
              Savings account fully funded
            </CardTitle>
            <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400">
              This savings goal has already been fully funded and no further
              bank transfer proof is required.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4 text-sm text-slate-600 sm:px-6 sm:pb-6 dark:text-slate-300">
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryChip label="Balance" value={details.balanceLabel} />
              <SummaryChip label="Target" value={details.targetAmountLabel} />
            </div>
            {latestIntent?.creditedAt ? (
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Credited on {latestIntent.creditedAt}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {proofOpen &&
      selectedFundingMethod === "BANK_TRANSFER" &&
      effectivePaymentMode &&
      bankMethod ? (
        <SavingsFundingProofModal
          open={proofOpen}
          onOpenChange={setProofOpen}
          savingsAccountId={details.account.id}
          platformPaymentMethodId={bankMethod.id}
          currency={details.account.currency}
          defaultAmount={selectedAmount}
          maxAmount={details.remainingToTargetAmount}
        />
      ) : null}

      <div className="flex w-full items-start justify-center gap-3 rounded-[1.25rem] bg-white/40 px-4 py-3 text-sm text-slate-400 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:items-center sm:rounded-[1.5rem] dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
        <Shield className="h-4 w-4 text-sky-500" />
        <span className="max-w-[32rem] text-center sm:text-left">
          Secure and encrypted payment flow
        </span>
      </div>
    </div>
  );
}
