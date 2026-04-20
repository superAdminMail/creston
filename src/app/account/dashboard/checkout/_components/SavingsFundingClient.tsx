"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Banknote, Clock3, PiggyBank, ShieldCheck, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
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
import SavingsFundingProofModal from "./SavingsFundingProofModal";

function SmallLabel({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

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

export default function SavingsFundingClient({
  details,
  fundingMethodType,
  paymentMode,
}: {
  details: SavingsFundingDetails;
  fundingMethodType: CheckoutFundingMethodType | null;
  paymentMode: CheckoutPaymentMode | null;
}) {
  const [proofOpen, setProofOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedPaymentMode, setSelectedPaymentMode] =
    useState<CheckoutPaymentMode | null>(normalizePaymentMode(paymentMode));

  const bankMethod = details.bankMethod;
  const pendingSubmission = details.hasPendingSubmission;
  const latestIntent = details.latestIntent;
  const persistedFundingMethod = normalizeFundingMethodType(
    latestIntent?.fundingMethodType,
  );
  const selectedFundingMethod =
    fundingMethodType ?? persistedFundingMethod ?? null;

  useEffect(() => {
    setSelectedPaymentMode(normalizePaymentMode(paymentMode));
  }, [paymentMode]);

  const fundingMethodLabel = useMemo(() => {
    return getCheckoutFundingMethodLabel(selectedFundingMethod);
  }, [selectedFundingMethod]);

  const paymentModeLabel = useMemo(() => {
    return getCheckoutPaymentModeLabel(selectedPaymentMode);
  }, [selectedPaymentMode]);

  const selectedAmount = useMemo(() => {
    const baseAmount =
      details.remainingToTargetAmount && details.remainingToTargetAmount > 0
        ? details.remainingToTargetAmount
        : details.fundingAmountSuggestion;

    if (selectedPaymentMode === "PARTIAL") {
      return Math.max(Math.round((baseAmount / 2) * 100) / 100, 0.01);
    }

    return baseAmount;
  }, [
    details.fundingAmountSuggestion,
    details.remainingToTargetAmount,
    selectedPaymentMode,
  ]);

  const transferMethodLabel =
    selectedFundingMethod === null
      ? "Choose funding method"
      : selectedFundingMethod === "CRYPTO_PROVIDER"
      ? "Crypto wallet"
      : bankMethod
        ? bankMethod.label
        : "Bank transfer";

  const updateFundingMethod = (nextFundingMethod: CheckoutFundingMethodType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("fundingMethodType", nextFundingMethod);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    if (nextFundingMethod === "CRYPTO_PROVIDER") {
      setProofOpen(false);
    }
  };

  const updatePaymentMode = (nextPaymentMode: CheckoutPaymentMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("paymentMode", nextPaymentMode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setSelectedPaymentMode(nextPaymentMode);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
      <CheckoutFundingMethodSelector
        value={selectedFundingMethod}
        onChange={updateFundingMethod}
        description="Pick how this savings checkout should be handled. Your choice stays in the current URL, so it won't affect anyone else."
      />

      {selectedFundingMethod ? (
        <CheckoutPaymentModeSelector
          value={selectedPaymentMode}
          onChange={updatePaymentMode}
          title="Choose payment mode"
          description="Pick whether to fund the full amount now or make a partial payment for this savings checkout."
        />
      ) : null}

      <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Savings funding
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Fund {details.account.name}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Make a one-time or recurring payment to your savings account.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge
                variant="secondary"
                className="rounded-full bg-sky-500/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200"
              >
                {fundingMethodLabel}
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200"
              >
                {paymentModeLabel}
              </Badge>
              {selectedFundingMethod === "CRYPTO_PROVIDER" ? (
                <Badge
                  variant="secondary"
                  className="rounded-full bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200"
                >
                  Bank transfer remains available
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="rounded-full bg-sky-500/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200"
            >
              {formatEnumLabel(details.account.status)}
            </Badge>
            {details.account.isLocked ? (
              <Badge
                variant="secondary"
                className="rounded-full bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200"
              >
                Locked
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="rounded-full bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200"
              >
                Active
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Current balance
              </p>
              <PiggyBank className="h-4 w-4 text-sky-600 dark:text-sky-300" />
            </div>
            <p className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">
              {details.balanceLabel}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Goal target
              </p>
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            </div>
            <p className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">
              {details.targetAmountLabel}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Remaining to goal
              </p>
              <Clock3 className="h-4 w-4 text-amber-600 dark:text-amber-300" />
            </div>
            <p className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">
              {details.remainingToTargetAmountLabel ?? "Not set"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Funding method
                </p>
              <Wallet className="h-4 w-4 text-sky-600 dark:text-sky-300" />
            </div>
            <p className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">
              {transferMethodLabel}
            </p>
          </div>
        </div>
      </section>

      {selectedFundingMethod === "CRYPTO_PROVIDER" ? (
        <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                Crypto funding preview
              </p>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Crypto is available as a checkout choice, but this savings
                funding flow is still completed through bank transfer proof for
                now.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => updateFundingMethod("BANK_TRANSFER")}
              className="rounded-full border-slate-200/80 bg-white/70 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06]"
            >
              Switch to bank transfer
            </Button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Account details
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SmallLabel label="Account name" value={details.account.name} />
              <SmallLabel label="Currency" value={details.account.currency} />
              <SmallLabel
                label="Opened"
                value={formatDateLabel(details.account.createdAt)}
              />
              <SmallLabel
                label="Lock status"
                value={
                  details.account.isLocked
                    ? details.account.lockedUntil
                      ? `Locked until ${formatDateLabel(details.account.lockedUntil)}`
                      : "Locked"
                    : "Flexible"
                }
              />
            </div>

            {details.account.description ? (
              <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {details.account.description}
              </p>
            ) : null}

            <div className="mt-5 rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Product
              </p>
              <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                {details.account.product.name}
              </p>
              {details.account.product.description ? (
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {details.account.product.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Funding history
            </h2>

            {latestIntent ? (
              <div className="mt-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-full",
                      pendingSubmission
                        ? "bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200"
                        : "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200",
                    )}
                  >
                    {pendingSubmission
                      ? "Awaiting review"
                      : formatEnumLabel(latestIntent.status)}
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    {formatEnumLabel(latestIntent.fundingMethodType)}
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Requested
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                      {latestIntent.submittedAt
                        ? formatDateLabel(latestIntent.submittedAt)
                        : "Not submitted"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Target amount
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                      {formatCurrency(
                        latestIntent.targetAmount,
                        details.account.currency,
                      )}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Payment mode
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                      {paymentModeLabel}
                    </p>
                  </div>
                </div>

                {latestIntent.latestPayment ? (
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Latest payment submission
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <SmallLabel
                        label="Status"
                        value={formatEnumLabel(
                          latestIntent.latestPayment.status,
                        )}
                      />
                      <SmallLabel
                        label="Reference"
                        value={latestIntent.latestPayment.transferReference ?? "—"}
                      />
                      <SmallLabel
                        label="Amount"
                        value={formatCurrency(
                          latestIntent.latestPayment.claimedAmount,
                          latestIntent.latestPayment.currency,
                        )}
                      />
                      <SmallLabel
                        label="Submitted"
                        value={formatDateLabel(
                          latestIntent.latestPayment.submittedAt,
                        )}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/70 px-4 py-8 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                No funding submissions yet. Your first transfer will appear here
                once proof is submitted.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Transfer details
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Send the deposit using the shared bank details below.
                </p>
              </div>
              <Banknote className="h-5 w-5 text-sky-600 dark:text-sky-300" />
            </div>

            {selectedFundingMethod === "BANK_TRANSFER" ? (
              bankMethod ? (
                <div className="mt-5 space-y-4">
                  <div className="grid gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <SmallLabel
                      label="Bank"
                      value={bankMethod.bankName ?? bankMethod.label}
                    />
                    <SmallLabel
                      label="Account name"
                      value={bankMethod.accountName ?? "—"}
                    />
                    <SmallLabel
                      label="Account number"
                      value={bankMethod.accountNumber ?? "—"}
                    />
                    <SmallLabel
                      label="Bank code"
                      value={bankMethod.bankCode ?? "—"}
                    />
                  </div>

                  {bankMethod.instructions ? (
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                      {bankMethod.instructions}
                    </div>
                  ) : null}

                  {bankMethod.notes ? (
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4 text-sm leading-6 text-amber-800 dark:text-amber-200">
                      {bankMethod.notes}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/70 px-4 py-6 text-sm leading-6 text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                  Bank instructions are not available yet for this savings
                  account.
                </div>
              )
            ) : selectedFundingMethod === "CRYPTO_PROVIDER" ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/70 px-4 py-6 text-sm leading-6 text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                Crypto funding is selected for this checkout. Switch back to
                bank transfer to continue with the current savings funding
                proof flow.
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/70 px-4 py-6 text-sm leading-6 text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                Choose a funding method above to see the transfer details for
                this savings checkout.
              </div>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Submit proof
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Once your transfer is complete, attach the receipt and payment
              reference for review.
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Suggested amount
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {formatCurrency(selectedAmount, details.account.currency)}
                </p>
              </div>

              {selectedFundingMethod === "BANK_TRANSFER" ? (
                <>
                  <Button
                    type="button"
                    className="h-11 w-full rounded-full bg-slate-950 px-5 text-white shadow-[0_12px_28px_rgba(2,6,23,0.32)] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    disabled={!details.canSubmitFundingProof || !selectedPaymentMode}
                    onClick={() => setProofOpen(true)}
                  >
                    {pendingSubmission
                      ? "Proof already submitted"
                      : selectedPaymentMode === "PARTIAL"
                        ? "I've made this partial transfer"
                        : "I've made this transfer"}
                  </Button>

                  {!details.canSubmitFundingProof ? (
                    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {pendingSubmission
                        ? "A previous funding proof is already waiting for review."
                      : "Bank instructions are required before you can submit proof."}
                    </p>
                  ) : null}
                  {!selectedPaymentMode ? (
                    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Choose full or partial payment above before submitting
                      proof.
                    </p>
                  ) : null}
                </>
              ) : selectedFundingMethod === "CRYPTO_PROVIDER" ? (
                selectedPaymentMode ? (
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Crypto funding does not use receipt upload here. Switch to
                    bank transfer to submit proof for this savings checkout.
                  </p>
                ) : (
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Choose full or partial payment above to continue with this
                    savings checkout.
                  </p>
                )
              ) : (
                <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Choose bank transfer above to unlock receipt upload and
                  transfer proof submission.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <SavingsFundingProofModal
        open={proofOpen}
        onOpenChange={setProofOpen}
        savingsAccountId={details.account.id}
        platformPaymentMethodId={bankMethod?.id ?? ""}
        currency={details.account.currency}
        defaultAmount={selectedAmount}
        maxAmount={details.remainingToTargetAmount}
      />
    </div>
  );
}
