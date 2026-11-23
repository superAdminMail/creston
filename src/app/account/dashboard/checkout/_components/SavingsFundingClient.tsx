"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bitcoin,
  Check,
  CheckCircle2,
  Copy,
  Landmark,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { requestSavingsFundingBankInfo } from "@/actions/savings/requestSavingsFundingBankInfo";
import CryptoQRCode from "@/components/payments/CryptoQRCode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";
import type { SavingsFundingDetails } from "@/lib/types/payments/savingsFunding.types";
import {
  getCheckoutFundingMethodLabel,
  getCheckoutPaymentModeLabel,
  type CheckoutFundingMethodType,
  type CheckoutPaymentMode,
} from "@/lib/types/payments/checkout.types";

import CheckoutFundingMethodSelector from "./CheckoutFundingMethodSelector";
import CheckoutPaymentModeSelector from "./CheckoutPaymentModeSelector";
import { CopyableDetailRow } from "./CopyableDetailRow";
import SavingsFundingProofModal from "./SavingsFundingProofModal";
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

function normalizePaymentMode(
  value: string | null | undefined,
): CheckoutPaymentMode | null {
  if (value === "FULL" || value === "PARTIAL") {
    return value;
  }

  return null;
}

function SummaryChip({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl border p-4",
        highlight
          ? "border-sky-200 bg-sky-50 dark:border-sky-400/20 dark:bg-sky-400/[0.07]"
          : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.035]",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 break-words text-sm font-semibold",
          highlight
            ? "text-sky-800 dark:text-sky-200"
            : "text-slate-950 dark:text-white",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function FundingMethodCard({
  selected,
  title,
  description,
  onClick,
  icon,
  accent,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
  icon: ReactNode;
  accent: "blue" | "amber";
}) {
  const accentClasses =
    accent === "amber"
      ? {
          selected:
            "border-amber-400 bg-amber-50 shadow-[0_8px_24px_rgba(217,119,6,0.10)] dark:border-amber-400/70 dark:bg-amber-400/[0.08]",
          icon: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
          check:
            "border-amber-600 bg-amber-600 text-white dark:border-amber-400 dark:bg-amber-400 dark:text-slate-950",
          title: "text-amber-950 dark:text-amber-200",
        }
      : {
          selected:
            "border-sky-500 bg-sky-50 shadow-[0_8px_24px_rgba(14,116,208,0.10)] dark:border-sky-400/70 dark:bg-sky-400/[0.08]",
          icon: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300",
          check:
            "border-sky-600 bg-sky-600 text-white dark:border-sky-400 dark:bg-sky-400 dark:text-slate-950",
          title: "text-sky-950 dark:text-sky-200",
        };

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "relative flex min-h-[132px] w-full flex-col rounded-2xl border p-4 text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950",
        selected
          ? accentClasses.selected
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-white/20 dark:hover:bg-white/[0.05]",
      )}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            selected
              ? accentClasses.icon
              : "bg-slate-100 text-slate-600 dark:bg-white/[0.07] dark:text-slate-300",
          )}
        >
          {icon}
        </div>

        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full border",
            selected
              ? accentClasses.check
              : "border-slate-300 text-transparent dark:border-slate-600",
          )}
        >
          <Check className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="mt-4">
        <p
          className={cn(
            "text-sm font-semibold",
            selected ? accentClasses.title : "text-slate-900 dark:text-white",
          )}
        >
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>

      {selected ? (
        <span className="absolute bottom-3 right-4 text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
          Selected
        </span>
      ) : null}
    </button>
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

  const bankMethod = details.bankMethod;
  const latestIntent = details.latestIntent;
  const latestBankPayment = latestIntent?.latestPayment ?? null;
  const latestPaymentShortfall =
    details.latestFundingPaymentShortfallAmount ?? 0;

  const isCompletingPayment = latestIntent?.status === "PARTIALLY_PAID";

  const isSavingsFullySettled =
    (details.account.targetAmount !== null &&
      details.account.balance >= details.account.targetAmount) ||
    latestIntent?.status === "PAID" ||
    latestIntent?.status === "CREDITED";

  const hasPendingSubmission = details.hasPendingSubmission;

  const cryptoSelected = selectedFundingMethod === "CRYPTO_PROVIDER";
  const bankSelected = selectedFundingMethod === "BANK_TRANSFER";

  const effectivePaymentMode = isCompletingPayment
    ? "PARTIAL"
    : selectedPaymentMode;

  const bankInfoRequested =
    details.hasExistingBankInfoRequest || bankInfoRequestedLocal;

  const canOpenProof = effectivePaymentMode !== null;

  const proofActionLabel = isSavingsFullySettled
    ? "Payment complete"
    : latestBankPayment?.status === "PENDING_REVIEW" || hasPendingSubmission
      ? "Payment under review"
      : isCompletingPayment
        ? "Complete payment"
        : "I've made this payment";

  const proofActionDisabled =
    isSavingsFullySettled ||
    hasPendingSubmission ||
    effectivePaymentMode === null;

  const targetAmount = details.account.targetAmount;
  const savingsProgress =
    targetAmount !== null && targetAmount > 0
      ? Math.min(
          100,
          Math.max(0, (details.account.balance / targetAmount) * 100),
        )
      : null;

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
    } catch {
      toast.error("Unable to request bank details. Please try again.");
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

  async function handleCopyWalletAddress(address: string | null | undefined) {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
      toast.success("Wallet address copied.");
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Unable to copy wallet address.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6 md:px-6">
      <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, "overflow-hidden")}>
        <div className="border-b border-slate-100 bg-gradient-to-br from-sky-50 via-white to-white p-5 dark:border-white/10 dark:from-sky-400/[0.08] dark:via-slate-950 dark:to-slate-950 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
                  <Wallet className="h-4 w-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-sky-800 dark:text-sky-300">
                  Savings funding
                </p>
              </div>

              <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                {details.account.product.name}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Add funds to your savings account using bank transfer or crypto.
                Choose your preferred funding method and payment amount to
                continue.
              </p>
            </div>

            <div className="w-full rounded-2xl border border-sky-200 bg-white p-4 shadow-sm dark:border-sky-400/20 dark:bg-white/[0.04] sm:w-auto sm:min-w-[210px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                Amount to fund
              </p>
              <p className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {formatCurrency(selectedAmount, details.account.currency)}
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {isCompletingPayment
                  ? "Outstanding savings payment"
                  : "Based on your selected payment"}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="space-y-5 p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
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
              highlight
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryChip label="Current balance" value={details.balanceLabel} />
            <SummaryChip
              label="Savings target"
              value={details.targetAmountLabel}
            />
            <SummaryChip
              label="Remaining to target"
              value={details.remainingToTargetAmountLabel ?? "Not set"}
              highlight
            />
          </div>

          {savingsProgress !== null ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.025]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    Savings goal progress
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {details.balanceLabel} saved towards your target
                  </p>
                </div>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 dark:bg-sky-400/10 dark:text-sky-300">
                  {Math.round(savingsProgress)}%
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-sky-600 transition-all dark:bg-sky-400"
                  style={{ width: `${savingsProgress}%` }}
                />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {!isSavingsFullySettled ? (
        <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, "w-full")}>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-950 dark:text-white sm:text-lg">
                  Choose a funding method
                </CardTitle>
                <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-400">
                  Select how you want to add money to your savings account.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <CheckoutFundingMethodSelector
              value={selectedFundingMethod}
              onChange={(next) => {
                setSelectedFundingMethod(next);
                setProofOpen(false);
                updateCheckoutParams({ nextFundingMethod: next });
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      {!selectedFundingMethod && !isSavingsFullySettled ? (
        <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, "w-full")}>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base font-semibold text-slate-950 dark:text-white sm:text-lg">
              Payment mode
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Select either bank transfer or crypto to continue.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {selectedFundingMethod &&
      !isSavingsFullySettled &&
      !isCompletingPayment ? (
        <CheckoutPaymentModeSelector
          value={selectedPaymentMode}
          onChange={(next) => {
            setSelectedPaymentMode(next);
            updateCheckoutParams({ nextPaymentMode: next });
          }}
        />
      ) : null}

      {!isSavingsFullySettled &&
      selectedFundingMethod === "BANK_TRANSFER" &&
      !bankMethod ? (
        <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, "w-full")}>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-950 dark:text-white sm:text-lg">
                  Bank details unavailable
                </CardTitle>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Additional setup is required.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Bank details are not available yet. Request them from the admin
              team so they can set up the transfer method for this checkout.
            </p>

            <Button
              type="button"
              onClick={() => void handleRequestBankInfo()}
              disabled={isRequestingBankInfo || bankInfoRequested}
              className="h-11 w-full rounded-xl bg-slate-950 px-5 font-semibold text-white hover:bg-slate-800 sm:w-auto dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              {isRequestingBankInfo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending request...
                </>
              ) : bankInfoRequested ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Request sent
                </>
              ) : (
                "Request bank details"
              )}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {selectedFundingMethod &&
      !isSavingsFullySettled &&
      effectivePaymentMode &&
      (cryptoSelected || bankMethod) ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
          <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, "w-full")}>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    cryptoSelected
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300"
                      : "bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300",
                  )}
                >
                  {cryptoSelected ? (
                    <Bitcoin className="h-5 w-5" />
                  ) : (
                    <Landmark className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base font-semibold text-slate-950 dark:text-white sm:text-lg">
                    {cryptoSelected
                      ? "Crypto wallet funding"
                      : "Bank transfer funding"}
                  </CardTitle>
                  <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-400">
                    {cryptoSelected
                      ? "Send funds to the platform wallet and submit your payment proof."
                      : "Use the receiving account details to complete your transfer."}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
              {cryptoSelected ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <SummaryChip label="Funding method" value="Crypto wallet" />
                  <SummaryChip
                    label="Payment mode"
                    value={getCheckoutPaymentModeLabel(effectivePaymentMode)}
                  />
                </div>
              ) : bankMethod ? (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SummaryChip
                      label="Payment amount"
                      value={formatCurrency(
                        selectedAmount,
                        details.account.currency,
                      )}
                      highlight
                    />
                    <SummaryChip
                      label="Payment mode"
                      value={getCheckoutPaymentModeLabel(effectivePaymentMode)}
                    />
                  </div>

                  <div className="space-y-3">
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
                  </div>

                  {bankMethod.instructions ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        Transfer instructions
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {bankMethod.instructions}
                      </p>
                    </div>
                  ) : null}

                  {bankMethod.notes ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-400/[0.06]">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                        Important notice
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-amber-900 dark:text-amber-100">
                        {bankMethod.notes}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, "w-full")}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base font-semibold text-slate-950 dark:text-white sm:text-lg">
                {cryptoSelected ? "Crypto payment" : "Funding confirmation"}
              </CardTitle>
              <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-400">
                {cryptoSelected
                  ? "Review the wallet details before sending your funds."
                  : "Submit your payment proof after completing the bank transfer."}
              </p>
            </CardHeader>

            <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
              {cryptoSelected ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-400/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                        <Bitcoin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">
                          Crypto wallet selected
                        </p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          Pay from your supported crypto wallet.
                        </p>
                      </div>
                    </div>
                  </div>

                  <SummaryChip
                    label="Deposit amount"
                    value={formatCurrency(
                      selectedAmount,
                      details.account.currency,
                    )}
                    highlight
                  />

                  {bankMethod?.walletAddress ? (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.025]">
                      <div className="border-b border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">
                            Platform wallet address
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Verify the address before sending your funds.
                        </p>
                      </div>

                      <div className="space-y-4 p-4">
                        <div className="flex flex-col gap-3">
                          <p className="break-all rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium leading-6 text-slate-900 dark:border-white/10 dark:bg-slate-900/70 dark:text-white">
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
                            className="h-11 w-full rounded-xl border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-white/[0.05] dark:text-white dark:hover:bg-white/[0.1]"
                          >
                            {isCopied ? (
                              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                            ) : (
                              <Copy className="mr-2 h-4 w-4" />
                            )}
                            {isCopied ? "Copied" : "Copy address"}
                          </Button>
                        </div>

                        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/50">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Scan wallet address
                          </p>
                          <CryptoQRCode
                            address={bankMethod.walletAddress}
                            amount={selectedAmount}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/[0.06] dark:text-amber-100">
                      The platform crypto wallet address is currently
                      unavailable. Please contact support before sending funds.
                    </div>
                  )}

                  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-400/20 dark:bg-sky-400/[0.06]">
                    <p className="text-sm font-semibold text-sky-900 dark:text-sky-200">
                      Payment instructions
                    </p>
                    <p className="mt-2 text-xs leading-5 text-sky-900/80 dark:text-sky-200/80">
                      Partial payments can be submitted using crypto proof.
                      Paymento checkout is available for full payments only.
                    </p>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-white/10">
                    <Button
                      type="button"
                      onClick={() => setProofOpen(true)}
                      disabled={!canOpenProof || proofActionDisabled}
                      className="h-12 w-full rounded-xl bg-slate-950 font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400"
                    >
                      {proofActionLabel}
                    </Button>

                    {effectivePaymentMode === "FULL" ? (
                      cryptoCheckoutButton
                    ) : (
                      <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs leading-5 text-sky-900 dark:border-sky-400/20 dark:bg-sky-400/[0.06] dark:text-sky-200">
                        Pay Now checkout is available for full payment only. Use
                        the proof button above for partial crypto submissions.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    className={cn(
                      "rounded-2xl border p-4",
                      hasPendingSubmission
                        ? "border-amber-200 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/[0.06]"
                        : "border-emerald-200 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/[0.06]",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          hasPendingSubmission
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
                        )}
                      >
                        {hasPendingSubmission ? (
                          <Loader2 className="h-5 w-5" />
                        ) : (
                          <ShieldCheck className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">
                          {hasPendingSubmission
                            ? "Payment under review"
                            : "Ready for bank proof"}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                          {hasPendingSubmission
                            ? "A funding submission is already waiting for review."
                            : "Submit your transfer proof after sending the bank payment."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <SummaryChip
                    label="Selected amount"
                    value={formatCurrency(
                      selectedAmount,
                      details.account.currency,
                    )}
                    highlight
                  />

                  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-400/20 dark:bg-sky-400/[0.06]">
                    <p className="text-xs font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                      {effectivePaymentMode === "PARTIAL"
                        ? "Partial payment"
                        : "Full payment"}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                      {formatCurrency(selectedAmount, details.account.currency)}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                      {effectivePaymentMode === "PARTIAL"
                        ? "Transfer this amount now and submit your proof after payment."
                        : "Transfer the full selected amount and submit your proof after payment."}
                    </p>

                    {bankSelected &&
                    latestIntent?.status === "PARTIALLY_PAID" &&
                    latestPaymentShortfall > 0 ? (
                      <p className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-xs leading-5 text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
                        Includes previous bank shortfall of{" "}
                        {formatCurrency(
                          latestPaymentShortfall,
                          details.account.currency,
                        )}
                        .
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="button"
                    onClick={() => setProofOpen(true)}
                    disabled={!canOpenProof || proofActionDisabled}
                    className="h-12 w-full rounded-xl bg-slate-950 font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400"
                  >
                    {proofActionLabel}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {isSavingsFullySettled ? (
        <Card className="w-full overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/[0.06]">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-emerald-950 dark:text-emerald-200 sm:text-lg">
                  Savings account fully funded
                </CardTitle>
                <p className="mt-1 text-sm leading-6 text-emerald-900/80 dark:text-emerald-100/80">
                  This savings goal has already been fully funded. No further
                  payment is required.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryChip
                label="Current balance"
                value={details.balanceLabel}
                highlight
              />
              <SummaryChip
                label="Savings target"
                value={details.targetAmountLabel}
              />
            </div>

            {latestIntent?.creditedAt ? (
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
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
      ) : proofOpen &&
        selectedFundingMethod === "CRYPTO_PROVIDER" &&
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
          mode="CRYPTO_PROVIDER"
        />
      ) : null}

      <div
        className={cn(
          DASHBOARD_PAGE_SURFACE_CLASS,
          "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-xs font-medium text-slate-600 dark:text-slate-300",
        )}
      >
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>Secure and encrypted savings funding</span>
      </div>
    </div>
  );
}
