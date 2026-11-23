"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bitcoin,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Landmark,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { requestInvestmentOrderBankInfo } from "@/actions/accounts/payments/requestInvestmentOrderBankInfo";
import { CancelPendingInvestmentOrderButton } from "@/components/account/CancelPendingInvestmentOrderButton";
import CryptoQRCode from "@/components/payments/CryptoQRCode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";
import {
  getCheckoutFundingMethodLabel,
  getCheckoutPaymentModeLabel,
  type CheckoutFundingMethodType,
  type CheckoutPaymentMode,
} from "@/lib/types/payments/checkout.types";
import type { InvestmentOrderPaymentDetails } from "@/lib/types/payments/investmentOrderPayment.types";

import BankTransferInstructionsCard from "./BankTransferInstructionsCard";
import InvestmentOrderCryptoCheckoutButton from "./InvestmentOrderCryptoCheckoutButton";
import OrderPaymentSelector from "./OrderPaymentSelector";
import PaymentProofModal from "./PaymentProofModal";
import { DASHBOARD_PAGE_PANEL_CLASS } from "../../../../../_components/dashboardSurfaces";

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
  icon: React.ReactNode;
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

export default function InvestmentOrderPaymentClient({
  order,
  selectedAmount,
  isSettled,
  fundingMethodType,
  paymentMode,
  isUpgradeFlow = false,
  paymentFlow = "UPGRADE",
}: {
  order: InvestmentOrderPaymentDetails;
  selectedAmount: number;
  isSettled: boolean;
  fundingMethodType: CheckoutFundingMethodType | null;
  paymentMode: CheckoutPaymentMode | null;
  isUpgradeFlow?: boolean;
  paymentFlow?: "UPGRADE" | "CAPITAL_UPDATE";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedFundingMethod, setSelectedFundingMethod] =
    useState<CheckoutFundingMethodType | null>(
      normalizeFundingMethodType(order.paymentMethodType) ??
        fundingMethodType ??
        null,
    );

  const [selectedPaymentMode, setSelectedPaymentMode] =
    useState<CheckoutPaymentMode | null>(normalizePaymentMode(paymentMode));

  const [isRequestingBankInfo, setIsRequestingBankInfo] = useState(false);
  const [bankInfoRequestedLocal, setBankInfoRequestedLocal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const bankMethod = order.bankMethod;

  const latestBankPayment =
    order.recentPayments.find((payment) => payment.type === "BANK_DEPOSIT") ??
    null;

  const latestCryptoPayment =
    order.recentPayments.find(
      (payment) => payment.type === "CRYPTO_PROVIDER",
    ) ?? null;

  const latestBankPaymentShortfallAmount =
    order.latestBankPaymentShortfallAmount ?? 0;

  const isOrderFullySettled =
    isSettled ||
    (!isUpgradeFlow &&
      (order.remainingAmount <= 0 ||
        order.status === "PAID" ||
        order.status === "CONFIRMED"));

  const canPay =
    !isOrderFullySettled &&
    (isUpgradeFlow ||
      order.status === "PENDING_PAYMENT" ||
      order.status === "PARTIALLY_PAID");

  const isCryptoSelected = selectedFundingMethod === "CRYPTO_PROVIDER";
  const isBankSelected = selectedFundingMethod === "BANK_TRANSFER";

  const effectivePaymentMode = isUpgradeFlow ? "FULL" : selectedPaymentMode;

  const flowLabel =
    paymentFlow === "CAPITAL_UPDATE" ? "Capital update" : "Investment upgrade";

  const flowDescription =
    paymentFlow === "CAPITAL_UPDATE"
      ? "Update your capital and reactivate your investment plan."
      : "Upgrade and reactivate your investment plan.";

  const bankProofActionLabel = isOrderFullySettled
    ? "Payment complete"
    : latestBankPayment?.status === "PENDING_REVIEW"
      ? "Payment under review"
      : "I've made this payment";

  const bankInfoRequested =
    order.hasExistingBankInfoRequest || bankInfoRequestedLocal;

  const bankProofActionDisabled =
    isOrderFullySettled ||
    latestBankPayment?.status === "PENDING_REVIEW" ||
    effectivePaymentMode === null;

  const cryptoProofActionLabel = isOrderFullySettled
    ? "Payment complete"
    : latestCryptoPayment?.status === "PENDING_REVIEW"
      ? "Payment under review"
      : "I've made this payment";

  const cryptoProofActionDisabled =
    isOrderFullySettled ||
    latestCryptoPayment?.status === "PENDING_REVIEW" ||
    effectivePaymentMode === null;

  const paymentProgress =
    order.amount > 0
      ? Math.min(100, Math.max(0, (order.amountPaid / order.amount) * 100))
      : 0;

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

  const handleFundingMethodChange = (
    nextFundingMethod: CheckoutFundingMethodType,
  ) => {
    setSelectedFundingMethod(nextFundingMethod);
    setShowModal(false);
    updateCheckoutParams({ nextFundingMethod });
  };

  async function handleRequestBankInfo() {
    setIsRequestingBankInfo(true);

    try {
      const res = await requestInvestmentOrderBankInfo(order.id);

      if (res.ok) {
        setBankInfoRequestedLocal(true);
        toast.success(res.message);
        return;
      }

      toast.error(res.message);
    } catch {
      toast.error("Unable to request bank details. Please try again.");
    } finally {
      setIsRequestingBankInfo(false);
    }
  }

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
    <div className="mx-auto w-full max-w-4xl space-y-5 sm:space-y-6">
      <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, "overflow-hidden")}>
        <div className="border-b border-slate-100 bg-gradient-to-br from-sky-50 via-white to-white p-5 dark:border-white/10 dark:from-sky-400/[0.08] dark:via-slate-950 dark:to-slate-950 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
                  <CreditCard className="h-4 w-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-sky-800 dark:text-sky-300">
                  {isUpgradeFlow ? flowLabel : "Investment checkout"}
                </p>
              </div>

              <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                {order.plan.name}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                {isUpgradeFlow
                  ? flowDescription
                  : "Choose your preferred funding method and complete your investment payment securely."}
              </p>
            </div>

            <div className="w-full rounded-2xl border border-sky-200 bg-white p-4 shadow-sm dark:border-sky-400/20 dark:bg-white/[0.04] sm:w-auto sm:min-w-[210px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                Amount due now
              </p>
              <p className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {formatCurrency(selectedAmount, order.currency)}
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {isUpgradeFlow
                  ? "Fixed offer amount"
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
              value={formatCurrency(selectedAmount, order.currency)}
              highlight
            />
          </div>

          {!isUpgradeFlow ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.025]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    Investment payment progress
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {order.amountPaidLabel} paid of {order.amountLabel}
                  </p>
                </div>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 dark:bg-sky-400/10 dark:text-sky-300">
                  {Math.round(paymentProgress)}%
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-sky-600 transition-all dark:bg-sky-400"
                  style={{ width: `${paymentProgress}%` }}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Total
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                    {order.amountLabel}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Paid
                  </p>
                  <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    {order.amountPaidLabel}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Remaining
                  </p>
                  <p className="mt-1 text-sm font-bold text-sky-700 dark:text-sky-300">
                    {order.remainingAmountLabel}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {isOrderFullySettled ? (
        <Card className="w-full overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/[0.06]">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-emerald-950 dark:text-emerald-200 sm:text-lg">
                  Investment order fully paid
                </CardTitle>
                <p className="mt-1 text-sm leading-6 text-emerald-900/80 dark:text-emerald-100/80">
                  This investment order has already been fully paid. No further
                  payment is required.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryChip
                label="Paid amount"
                value={order.amountPaidLabel}
                highlight
              />
              <SummaryChip
                label="Order status"
                value={order.status.replaceAll("_", " ")}
              />
            </div>

            {order.confirmedAt ? (
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                Confirmed on {order.confirmedAt}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {!isOrderFullySettled ? (
        <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, "w-full")}>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-950 dark:text-white sm:text-lg">
                  Choose a funding method
                </CardTitle>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Select how you want to fund this investment.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-3 px-4 pb-4 sm:grid-cols-2 sm:px-6 sm:pb-6">
            <FundingMethodCard
              selected={isBankSelected}
              title="Bank transfer"
              description="Transfer funds from your bank account and submit payment proof."
              onClick={() => handleFundingMethodChange("BANK_TRANSFER")}
              icon={<Landmark className="h-5 w-5" />}
              accent="blue"
            />

            <FundingMethodCard
              selected={isCryptoSelected}
              title="Crypto wallet"
              description="Pay using Bitcoin and submit your transaction proof."
              onClick={() => handleFundingMethodChange("CRYPTO_PROVIDER")}
              icon={<Bitcoin className="h-5 w-5" />}
              accent="amber"
            />
          </CardContent>
        </Card>
      ) : null}

      {!isOrderFullySettled && selectedFundingMethod && !isUpgradeFlow ? (
        <OrderPaymentSelector
          mode={selectedPaymentMode}
          onModeChange={(nextMode) => {
            setSelectedPaymentMode(nextMode);
            updateCheckoutParams({ nextPaymentMode: nextMode });
          }}
        />
      ) : null}

      {!isOrderFullySettled &&
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

      {canPay && selectedFundingMethod ? (
        <div className="space-y-4">
          {selectedFundingMethod === "BANK_TRANSFER" ? (
            selectedPaymentMode || isUpgradeFlow ? (
              order.hasBankMethod && order.bankMethod ? (
                <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, "w-full")}>
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
                        <Landmark className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-slate-950 dark:text-white sm:text-lg">
                          Complete bank transfer
                        </CardTitle>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          Use the receiving account details below.
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <SummaryChip
                        label="Selected amount"
                        value={formatCurrency(selectedAmount, order.currency)}
                        highlight
                      />
                      <SummaryChip
                        label="Payment mode"
                        value={getCheckoutPaymentModeLabel(
                          effectivePaymentMode,
                        )}
                      />
                    </div>

                    {latestBankPaymentShortfallAmount > 0 ? (
                      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/[0.07] dark:text-amber-100">
                        <p className="font-semibold">
                          Previous payment shortfall
                        </p>
                        <p className="mt-1">
                          {formatCurrency(
                            latestBankPaymentShortfallAmount,
                            order.currency,
                          )}{" "}
                          has been carried into your next bank transfer.
                        </p>
                      </div>
                    ) : null}

                    <BankTransferInstructionsCard
                      bankMethod={bankMethod!}
                      selectedAmount={selectedAmount}
                      currency={order.currency}
                      actionLabel={bankProofActionLabel}
                      actionDisabled={bankProofActionDisabled}
                      onConfirmPaid={() => setShowModal(true)}
                    />
                  </CardContent>
                </Card>
              ) : null
            ) : null
          ) : selectedFundingMethod === "CRYPTO_PROVIDER" &&
            isCryptoSelected ? (
            <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, "w-full")}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
                    <Bitcoin className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-950 dark:text-white sm:text-lg">
                      Crypto wallet payment
                    </CardTitle>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      Send Bitcoin to the platform wallet below.
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <SummaryChip label="Funding method" value="Crypto wallet" />
                  <SummaryChip
                    label="Payment mode"
                    value={getCheckoutPaymentModeLabel(effectivePaymentMode)}
                  />
                </div>

                <SummaryChip
                  label="Selected amount"
                  value={formatCurrency(selectedAmount, order.currency)}
                  highlight
                />

                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-400/20 dark:bg-sky-400/[0.06]">
                  <p className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                    Crypto payment instructions
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {isUpgradeFlow
                      ? `This ${paymentFlow === "CAPITAL_UPDATE" ? "capital update" : "upgrade"} uses the fixed amount set by the admin. Submit the full amount shown above.`
                      : "Partial payments are available when you submit crypto proof. The Pay now checkout button below stays full payment only."}
                  </p>
                </div>

                {bankMethod?.walletAddress ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.025]">
                    <div className="border-b border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035] sm:p-5">
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

                    <div className="space-y-4 p-4 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <p className="min-w-0 flex-1 break-all rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium leading-6 text-slate-900 dark:border-white/10 dark:bg-slate-900/70 dark:text-white">
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
                          className="h-11 w-full shrink-0 rounded-xl border-slate-300 bg-white px-4 text-slate-800 hover:bg-slate-100 sm:w-auto dark:border-white/15 dark:bg-white/[0.05] dark:text-white dark:hover:bg-white/[0.1]"
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
                ) : null}

                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Scan the QR code or paste the wallet address into your wallet
                  app. After sending the funds, submit your payment proof below.
                </p>

                {bankMethod?.walletAddress ? (
                  <div className="space-y-3 border-t border-slate-100 pt-5 dark:border-white/10">
                    <Button
                      type="button"
                      onClick={() => setShowModal(true)}
                      disabled={cryptoProofActionDisabled}
                      className="h-12 w-full rounded-xl bg-slate-950 font-semibold text-white hover:bg-slate-800 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400"
                    >
                      {effectivePaymentMode === null
                        ? "Choose payment mode first"
                        : cryptoProofActionLabel}
                    </Button>

                    {!isUpgradeFlow && effectivePaymentMode === "FULL" ? (
                      <InvestmentOrderCryptoCheckoutButton
                        investmentOrderId={order.id}
                        className="h-12 w-full rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
                      />
                    ) : (
                      <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs leading-5 text-sky-900 dark:border-sky-400/20 dark:bg-sky-400/[0.06] dark:text-sky-200">
                        {isUpgradeFlow
                          ? `Use the proof button above to submit the fixed ${paymentFlow === "CAPITAL_UPDATE" ? "capital update" : "upgrade"} amount.`
                          : "Use the proof button above for partial crypto submissions."}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/[0.06] dark:text-amber-100">
                    The platform crypto wallet address is currently unavailable.
                    Please contact support before sending funds.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      {order.status === "PENDING_PAYMENT" ? (
        <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-white/10">
          <CancelPendingInvestmentOrderButton
            orderId={order.id}
            className="w-full sm:w-auto"
          />
        </div>
      ) : null}

      {showModal &&
      selectedFundingMethod === "BANK_TRANSFER" &&
      (selectedPaymentMode || isUpgradeFlow) &&
      order.hasBankMethod &&
      order.bankMethod ? (
        <PaymentProofModal
          open={showModal}
          onOpenChange={setShowModal}
          orderId={order.id}
          platformPaymentMethodId={order.bankMethod.id}
          currency={order.currency}
          defaultAmount={selectedAmount}
          maxAmount={isUpgradeFlow ? selectedAmount : order.remainingAmount}
          paymentMode={isUpgradeFlow ? "FULL" : (selectedPaymentMode ?? "FULL")}
          isUpgradeFlow={isUpgradeFlow}
          paymentFlow={paymentFlow}
          amountReadOnly={
            !isUpgradeFlow &&
            selectedFundingMethod === "BANK_TRANSFER" &&
            selectedPaymentMode === "PARTIAL"
          }
        />
      ) : showModal &&
        selectedFundingMethod === "CRYPTO_PROVIDER" &&
        bankMethod ? (
        <PaymentProofModal
          open={showModal}
          onOpenChange={setShowModal}
          orderId={order.id}
          platformPaymentMethodId={bankMethod.id}
          currency={order.currency}
          defaultAmount={selectedAmount}
          maxAmount={isUpgradeFlow ? selectedAmount : order.remainingAmount}
          paymentMode={isUpgradeFlow ? "FULL" : (selectedPaymentMode ?? "FULL")}
          proofMode="CRYPTO_PROVIDER"
          isUpgradeFlow={isUpgradeFlow}
          paymentFlow={paymentFlow}
        />
      ) : null}

      <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.025] dark:text-slate-300">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>Secure and encrypted payment flow</span>
      </div>
    </div>
  );
}
