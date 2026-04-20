"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bitcoin, Landmark, Loader2 } from "lucide-react";
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

import BankTransferInstructionsCard from "./BankTransferInstructionsCard";
import MissingBankInfoCard from "./MissingBankInfoCard";
import OrderPaymentSelector from "./OrderPaymentSelector";
import PaymentProofModal from "./PaymentProofModal";

export type InvestmentOrderPaymentDetails = {
  id: string;
  amount: number;
  amountPaid: number;
  remainingAmount: number;
  currency: string;
  status: string;

  plan: {
    name: string;
    period: string;
  };

  tier: {
    level: string;
  };

  bankMethod: {
    id: string;
    label: string;
    bankName: string | null;
    bankCode: string | null;
    accountName: string | null;
    accountNumber: string | null;
    instructions: string | null;
    notes: string | null;
    currency: string;
  } | null;

  hasBankMethod: boolean;
  hasExistingBankInfoRequest: boolean;
  paymentMethodType: string | null;

  amountLabel: string;
  amountPaidLabel: string;
  remainingAmountLabel: string;
};

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
}: {
  label: string;
  value: string;
}) {
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
  fundingMethodType,
  paymentMode,
}: {
  order: InvestmentOrderPaymentDetails;
  partialPaymentAmount: number;
  fundingMethodType: CheckoutFundingMethodType | null;
  paymentMode: CheckoutPaymentMode | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedFundingMethod =
    normalizeFundingMethodType(order.paymentMethodType) ?? fundingMethodType;
  const mode = normalizePaymentMode(paymentMode);
  const [isRequestingBankInfo, setIsRequestingBankInfo] = useState(false);
  const [isCreatingCryptoCheckout, setIsCreatingCryptoCheckout] =
    useState(false);
  const [showModal, setShowModal] = useState(false);

  const canPay =
    order.status === "PENDING_PAYMENT" || order.status === "PARTIALLY_PAID";

  const selectedAmount = useMemo(() => {
    if (mode === "FULL") return order.remainingAmount;
    if (mode === "PARTIAL") {
      return Math.min(
        Math.max(partialPaymentAmount || 0, 0),
        order.remainingAmount,
      );
    }
    return 0;
  }, [mode, order.remainingAmount, partialPaymentAmount]);

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

  async function handleRequestBankInfo() {
    setIsRequestingBankInfo(true);
    const res = await requestInvestmentOrderBankInfo(order.id);
    setIsRequestingBankInfo(false);

    if (res.ok) toast.success(res.message);
    else toast.error(res.message);
  }

  async function handleCryptoCheckout() {
    if (!selectedFundingMethod) {
      toast.error("Choose a funding method first.");
      return;
    }

    if (!mode) {
      toast.error("Choose full or partial payment first.");
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
          paymentMode: mode,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { redirectUrl?: string; error?: string }
        | null;

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
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6 md:px-6">
      <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/78 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.92),rgba(5,11,31,0.96))]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Investment checkout
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
              {order.plan.name}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Choose a funding method, then decide whether to pay the full
              amount or split it.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryChip label="Funding method" value={getCheckoutFundingMethodLabel(selectedFundingMethod)} />
          <SummaryChip label="Payment mode" value={getCheckoutPaymentModeLabel(mode)} />
          <SummaryChip
            label="Selected amount"
            value={
              mode ? formatCurrency(selectedAmount, order.currency) : order.remainingAmountLabel
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

      <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white/78 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.92),rgba(5,11,31,0.96))]">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg text-slate-950 dark:text-white">
            Funding method
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {selectedFundingMethod === "BANK_TRANSFER" ? (
              <>
                <Landmark className="h-4 w-4" />
                Bank transfer
              </>
            ) : selectedFundingMethod === "CRYPTO_PROVIDER" ? (
              <>
                <Bitcoin className="h-4 w-4" />
                Crypto wallet
              </>
            ) : (
              "Choose one"
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              type="button"
              variant={selectedFundingMethod === "BANK_TRANSFER" ? "default" : "outline"}
              onClick={() => {
                setSelectedFundingMethod("BANK_TRANSFER");
                updateCheckoutParams({ nextFundingMethod: "BANK_TRANSFER" });
              }}
              className="rounded-2xl"
            >
              Bank Transfer
            </Button>
            <Button
              type="button"
              variant={selectedFundingMethod === "CRYPTO_PROVIDER" ? "default" : "outline"}
              onClick={() => {
                setSelectedFundingMethod("CRYPTO_PROVIDER");
                updateCheckoutParams({ nextFundingMethod: "CRYPTO_PROVIDER" });
              }}
              className="rounded-2xl"
            >
              Crypto wallet
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedFundingMethod ? (
        <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white/78 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.92),rgba(5,11,31,0.96))]">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-lg text-slate-950 dark:text-white">
              Payment mode
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {mode ? getCheckoutPaymentModeLabel(mode) : "Choose one"}
            </div>
          </CardHeader>
          <CardContent>
            <OrderPaymentSelector
              remainingAmount={order.remainingAmount}
              currency={order.currency}
              mode={mode}
              partialAmount={partialPaymentAmount}
              onModeChange={(nextMode) => {
                updateCheckoutParams({ nextPaymentMode: nextMode });
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      {canPay && selectedFundingMethod ? (
        <>
          {selectedFundingMethod === "BANK_TRANSFER" ? (
            mode ? (
              order.hasBankMethod && order.bankMethod ? (
                <BankTransferInstructionsCard
                  bankMethod={order.bankMethod}
                  selectedAmount={selectedAmount}
                  currency={order.currency}
                  onConfirmPaid={() => setShowModal(true)}
                />
              ) : (
                <MissingBankInfoCard
                  orderId={order.id}
                  hasExistingRequest={order.hasExistingBankInfoRequest}
                />
              )
            ) : null
          ) : selectedFundingMethod === "CRYPTO_PROVIDER" ? (
            mode ? (
              <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-950 dark:text-white">
                    Crypto wallet checkout
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SummaryChip
                      label="Selected amount"
                      value={formatCurrency(selectedAmount, order.currency)}
                    />
                    <SummaryChip
                      label="Payment mode"
                      value={getCheckoutPaymentModeLabel(mode)}
                    />
                  </div>

                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Continue to the crypto payment gateway using the amount
                    selected above.
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
                        "Continue to crypto wallet"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null
          ) : null}
        </>
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
      mode &&
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

      {selectedFundingMethod === "BANK_TRANSFER" &&
      !mode &&
      !order.hasBankMethod ? (
        <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/78 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.92),rgba(5,11,31,0.96))]">
          <div className="space-y-3 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bank details are not available yet.
            </p>

            <Button
              disabled={isRequestingBankInfo || order.hasExistingBankInfoRequest}
              onClick={() => void handleRequestBankInfo()}
            >
              {isRequestingBankInfo ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </span>
              ) : order.hasExistingBankInfoRequest ? (
                "Request Sent"
              ) : (
                "Request Bank Info"
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
