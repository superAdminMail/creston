"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bitcoin, Landmark, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

import { requestInvestmentOrderBankInfo } from "@/actions/accounts/payments/requestInvestmentOrderBankInfo";
import { CancelPendingInvestmentOrderButton } from "@/components/account/CancelPendingInvestmentOrderButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters/formatters";
import {
  getCheckoutFundingMethodLabel,
  getCheckoutPaymentModeLabel,
  type CheckoutFundingMethodType,
  type CheckoutPaymentMode,
} from "@/lib/types/payments/checkout.types";
import type { InvestmentOrderPaymentDetails } from "@/lib/types/payments/investmentOrderPayment.types";

import BankTransferInstructionsCard from "./BankTransferInstructionsCard";
import OrderPaymentSelector from "./OrderPaymentSelector";
import PaymentProofModal from "./PaymentProofModal";

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

export default function InvestmentOrderPaymentClient({
  order,
  partialPaymentAmount,
  isSettled,
  fundingMethodType,
  paymentMode,
}: {
  order: InvestmentOrderPaymentDetails;
  partialPaymentAmount: number;
  isSettled: boolean;
  fundingMethodType: CheckoutFundingMethodType | null;
  paymentMode: CheckoutPaymentMode | null;
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
  const [partialAmount, setPartialAmount] =
    useState<number>(partialPaymentAmount);
  const [isRequestingBankInfo, setIsRequestingBankInfo] = useState(false);
  const [bankInfoRequestedLocal, setBankInfoRequestedLocal] = useState(false);
  const [isCreatingCryptoCheckout, setIsCreatingCryptoCheckout] =
    useState(false);
  const [showModal, setShowModal] = useState(false);
  const bankMethod = order.bankMethod;
  const latestBankPayment =
    order.recentPayments.find((payment) => payment.type === "BANK_DEPOSIT") ??
    null;
  const isOrderFullySettled =
    isSettled ||
    order.remainingAmount <= 0 ||
    order.status === "PAID" ||
    order.status === "CONFIRMED";
  const canPay =
    !isOrderFullySettled &&
    (order.status === "PENDING_PAYMENT" || order.status === "PARTIALLY_PAID");
  const isCryptoSelected = selectedFundingMethod === "CRYPTO_PROVIDER";
  const isBankSelected = selectedFundingMethod === "BANK_TRANSFER";
  const effectivePaymentMode = isCryptoSelected ? "FULL" : selectedPaymentMode;
  const bankProofActionLabel = isOrderFullySettled
    ? "Payment complete"
    : latestBankPayment?.status === "PENDING_REVIEW"
      ? "Payment under review"
      : isBankSelected &&
          latestBankPayment?.status === "APPROVED" &&
        order.status === "PARTIALLY_PAID"
        ? "I've made this payment"
        : "I've made this payment";
  const bankInfoRequested =
    order.hasExistingBankInfoRequest || bankInfoRequestedLocal;
  const bankProofActionDisabled =
    isOrderFullySettled || latestBankPayment?.status === "PENDING_REVIEW";

  const selectedAmount = useMemo(() => {
    if (isCryptoSelected || effectivePaymentMode === "FULL") {
      return order.remainingAmount;
    }

    if (effectivePaymentMode === "PARTIAL") {
      return Math.min(Math.max(partialAmount || 0, 0), order.remainingAmount);
    }

    return 0;
  }, [
    effectivePaymentMode,
    isCryptoSelected,
    order.remainingAmount,
    partialAmount,
  ]);

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

    if (nextFundingMethod === "CRYPTO_PROVIDER") {
      setSelectedPaymentMode("FULL");
      updateCheckoutParams({
        nextFundingMethod,
        nextPaymentMode: "FULL",
      });
      return;
    }

    updateCheckoutParams({ nextFundingMethod });
  };

  async function handleRequestBankInfo() {
    setIsRequestingBankInfo(true);
    const res = await requestInvestmentOrderBankInfo(order.id);
    setIsRequestingBankInfo(false);

    if (res.ok) {
      setBankInfoRequestedLocal(true);
      toast.success(res.message);
      return;
    }

    toast.error(res.message);
  }

  async function handleCryptoCheckout() {
    if (!selectedFundingMethod) {
      toast.error("Choose a funding method first.");
      return;
    }

    if (!selectedPaymentMode) {
      toast.error("Choose a payment mode first.");
      return;
    }

    if (isCryptoSelected && selectedPaymentMode !== "FULL") {
      setSelectedPaymentMode("FULL");
      updateCheckoutParams({ nextPaymentMode: "FULL" });
      return;
    }

    if (isCreatingCryptoCheckout) return;

    setIsCreatingCryptoCheckout(true);
    try {
      const response = await fetch("/api/payments/paymento/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          investmentOrderId: order.id,
          paymentMode: "FULL",
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        redirectUrl?: string;
        error?: string;
      } | null;

      if (!response.ok || !data?.redirectUrl) {
        toast.error(data?.error ?? "Unable to open crypto checkout.");
        return;
      }

      window.location.assign(data.redirectUrl);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to open crypto checkout.",
      );
    } finally {
      setIsCreatingCryptoCheckout(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3 py-4 sm:space-y-8 sm:px-4 sm:py-6 md:px-6">
      <div className="w-full rounded-[1.35rem] border border-slate-200/80 bg-white/78 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[1.75rem] sm:p-6 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.92),rgba(5,11,31,0.96))]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Investment checkout
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950 sm:text-xl dark:text-white">
              {order.plan.name}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400">
              Choose a funding method, then pay the full amount with crypto
              wallet or split it with bank transfer.
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
            value={
              isCryptoSelected || selectedPaymentMode
                ? formatCurrency(selectedAmount, order.currency)
                : order.remainingAmountLabel
            }
          />
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <div>Total: {order.amountLabel}</div>
          <div>Paid: {order.amountPaidLabel}</div>
          <div className="font-medium text-sky-700 dark:text-sky-300">
            Remaining: {order.remainingAmountLabel}
          </div>
        </div>
      </div>

      {isOrderFullySettled ? (
        <Card className="w-full rounded-[1.35rem] border border-emerald-200/70 bg-emerald-50/90 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[1.75rem] dark:border-emerald-400/20 dark:bg-white/[0.04]">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
              Investment order fully paid
            </CardTitle>
            <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400">
              This investment order has already been fully paid and no further
              bank transfer proof is required.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4 text-sm text-slate-600 sm:px-6 sm:pb-6 dark:text-slate-300">
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryChip
                label="Paid amount"
                value={order.amountPaidLabel}
              />
              <SummaryChip
                label="Order status"
                value={order.status.replaceAll("_", " ")}
              />
            </div>
            {order.confirmedAt ? (
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Confirmed on {order.confirmedAt}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {!isOrderFullySettled ? (
        <Card className="w-full rounded-[1.35rem] border border-slate-200/80 bg-white/88 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[1.75rem] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
        <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="min-w-0">
            <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
              {isCryptoSelected
                ? "Crypto wallet funding"
                : "Bank transfer funding"}
            </CardTitle>
            <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400">
              {isCryptoSelected
                ? "This checkout is set to Bitcoin wallet funding."
                : "Use the bank details below to send your transfer, then submit your funding proof for review."}
            </p>
          </div>

          <div className="inline-flex max-w-full items-center gap-2 self-start rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            {isCryptoSelected ? (
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
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              type="button"
              variant={
                selectedFundingMethod === "BANK_TRANSFER"
                  ? "default"
                  : "outline"
              }
              onClick={() => handleFundingMethodChange("BANK_TRANSFER")}
              className="rounded-2xl"
            >
              Bank transfer
            </Button>
            <Button
              type="button"
              variant={
                selectedFundingMethod === "CRYPTO_PROVIDER"
                  ? "default"
                  : "outline"
              }
              onClick={() => handleFundingMethodChange("CRYPTO_PROVIDER")}
              className="rounded-2xl"
            >
              Crypto wallet
            </Button>
          </div>

          {!selectedFundingMethod ? (
            <div className="mt-4 rounded-[1.15rem] border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-6 text-slate-600 shadow-sm backdrop-blur sm:rounded-[1.25rem] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
              Choose a funding method to continue. Bank transfer will show the
              transfer details and proof upload, while crypto wallet will take
              you to the secure checkout flow.
            </div>
          ) : null}
        </CardContent>
      </Card>
      ) : null}

      {!isOrderFullySettled && isBankSelected ? (
        <OrderPaymentSelector
          remainingAmount={order.remainingAmount}
          currency={order.currency}
          mode={selectedPaymentMode}
          partialAmount={partialAmount}
          onModeChange={(nextMode) => {
            setSelectedPaymentMode(nextMode);
            updateCheckoutParams({ nextPaymentMode: nextMode });
            if (nextMode === "FULL") {
              setPartialAmount(order.remainingAmount);
            }
            if (nextMode === "PARTIAL") {
              setPartialAmount(partialPaymentAmount);
            }
          }}
        />
      ) : null}

      {!isOrderFullySettled && selectedFundingMethod === "BANK_TRANSFER" && !bankMethod ? (
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
                {isRequestingBankInfo ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </span>
                ) : bankInfoRequested ? (
                  "Request Sent"
                ) : (
                  "Request Bank Info"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {canPay && selectedFundingMethod ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)]">
          {selectedFundingMethod === "BANK_TRANSFER" ? (
            selectedPaymentMode ? (
              order.hasBankMethod && order.bankMethod ? (
                <Card className="w-full rounded-[1.35rem] border border-slate-200/80 bg-white/88 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[1.75rem] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
                      Bank transfer funding
                    </CardTitle>
                    <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400">
                      Use the bank details below to send your transfer, then
                      submit your funding proof for review.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <SummaryChip
                        label="Selected amount"
                        value={formatCurrency(selectedAmount, order.currency)}
                      />
                      <SummaryChip
                        label="Payment mode"
                        value={getCheckoutPaymentModeLabel(selectedPaymentMode)}
                      />
                    </div>

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
          ) : selectedFundingMethod === "CRYPTO_PROVIDER" ? (
            isCryptoSelected ? (
              <Card className="w-full rounded-[1.35rem] border border-slate-200/80 bg-white/88 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[1.75rem] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
                    Crypto wallet funding
                  </CardTitle>
                  <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400">
                    This checkout is set to Bitcoin wallet funding.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
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

                  <div className="grid gap-3 sm:grid-cols-2">
                    <SummaryChip
                      label="Selected amount"
                      value={formatCurrency(selectedAmount, order.currency)}
                    />
                    <SummaryChip
                      label="Payment mode"
                      value={getCheckoutPaymentModeLabel("FULL")}
                    />
                  </div>

                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                    You will be redirected to a secure checkout to complete the
                    payment.
                  </p>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => void handleCryptoCheckout()}
                      disabled={isCreatingCryptoCheckout}
                      aria-busy={isCreatingCryptoCheckout}
                      className="rounded-full bg-slate-950 px-5 text-white shadow-[0_12px_28px_rgba(2,6,23,0.32)] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                      {isCreatingCryptoCheckout ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Opening secure checkout...
                        </span>
                      ) : (
                        "Continue"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null
          ) : null}
        </div>
      ) : null}

      {order.status === "PENDING_PAYMENT" ? (
        <div className="flex justify-end">
          <CancelPendingInvestmentOrderButton
            orderId={order.id}
            className="w-full sm:w-auto"
          />
        </div>
      ) : null}

      {showModal &&
      selectedFundingMethod === "BANK_TRANSFER" &&
      selectedPaymentMode &&
      order.hasBankMethod &&
      order.bankMethod ? (
        <PaymentProofModal
          open={showModal}
          onOpenChange={setShowModal}
          orderId={order.id}
          platformPaymentMethodId={order.bankMethod.id}
          currency={order.currency}
          defaultAmount={selectedAmount}
          maxAmount={order.remainingAmount}
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
