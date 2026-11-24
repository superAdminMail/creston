"use client";

import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Landmark,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DrawerSurface } from "@/components/ui/drawer-surface";
import { Button } from "@/components/ui/button";
import { getFirstFormFieldError } from "@/lib/forms/actionState";
import { formatCurrency } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "../../../_components/dashboardSurfaces";
import type {
  PaymentMethod,
  WithdrawalPreviewDraft,
} from "../_lib/withdrawal-types";

type ServerState = {
  status: string;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewDraft: WithdrawalPreviewDraft | null;
  serverState: ServerState;
  selectedPaymentMethod: PaymentMethod | null;
  totalAvailableBalance: number;
  currency: string;
  previewAmount: number;
  previewHasValidAmount: boolean;
  savingsBalance: number;
  investmentBalance: number;
  previewSavingsAmount: number;
  previewInvestmentAmount: number;
  previewEarlyWithdrawalFee: number;
  previewNetPayoutAmount: number;
  previewGrossDeductionAmount: number;
  isPending: boolean;
  onChangeSource: () => void;
  onConfirm: () => void;
};

export default function WithdrawalReviewDrawer({
  open,
  onOpenChange,
  reviewDraft,
  serverState,
  selectedPaymentMethod,
  totalAvailableBalance,
  currency,
  previewAmount,
  previewHasValidAmount,
  savingsBalance,
  investmentBalance,
  previewSavingsAmount,
  previewInvestmentAmount,
  previewEarlyWithdrawalFee,
  previewNetPayoutAmount,
  previewGrossDeductionAmount,
  isPending,
  onChangeSource,
  onConfirm,
}: Props) {
  const firstFieldError = getFirstFormFieldError(serverState.fieldErrors);

  const isBank = selectedPaymentMethod?.type === "BANK";
  const isCrypto = selectedPaymentMethod?.type === "CRYPTO";

  const walletAddress = selectedPaymentMethod?.address;
  const maskedWalletAddress = walletAddress
    ? walletAddress.length <= 14
      ? walletAddress
      : `${walletAddress.slice(0, 7)}...${walletAddress.slice(-7)}`
    : "Not provided";

  const accountNumber = selectedPaymentMethod?.accountNumber ?? "Not provided";

  const hasEarlyFee = previewEarlyWithdrawalFee > 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerSurface
        tone="light"
        className={cn(
          "z-[90] flex min-h-0 flex-col overflow-hidden border-border/70 bg-white text-slate-950 shadow-[0_32px_90px_rgba(15,23,42,0.24)]",
          "data-[vaul-drawer-direction=bottom]:h-[92dvh]",
          "data-[vaul-drawer-direction=bottom]:max-h-[92dvh]",
          "data-[vaul-drawer-direction=bottom]:rounded-t-[1.75rem]",
          "dark:border-white/10 dark:bg-slate-950 dark:text-white dark:shadow-[0_32px_90px_rgba(15,23,42,0.44)]",
        )}
      >
        <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden">
          <DrawerHeader className="shrink-0 border-b border-border/60 px-4 pb-5 pt-5 text-left md:px-6">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <DrawerTitle className="text-left text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Review withdrawal
            </DrawerTitle>
            <DrawerDescription className="mt-1 max-w-xl text-left text-sm leading-6 text-slate-600 dark:text-slate-400">
              Check your withdrawal details before submitting your request.
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 [-webkit-overflow-scrolling:touch] md:px-6">
            {serverState.status === "error" && serverState.message ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-100">
                <p className="font-semibold">Unable to submit withdrawal</p>
                <p className="mt-1 leading-6">{serverState.message}</p>
                {firstFieldError ? (
                  <p className="mt-2 text-rose-800 dark:text-rose-100/80">
                    {firstFieldError}
                  </p>
                ) : null}
              </div>
            ) : null}

            <section className="rounded-3xl border border-sky-200/80 bg-sky-50/70 p-5 dark:border-sky-400/20 dark:bg-sky-400/[0.07] sm:p-6">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-sky-800 dark:text-sky-300">
                You are requesting
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl">
                {formatCurrency(
                  previewHasValidAmount ? previewAmount : 0,
                  currency,
                )}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Available balance:{" "}
                  {formatCurrency(totalAvailableBalance, currency)}
                </span>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                    Payment destination
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Where your withdrawal will be sent
                  </p>
                </div>
              </div>

              <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-4 sm:p-5")}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.07] dark:text-slate-200">
                    {isBank ? (
                      <Landmark className="h-5 w-5" />
                    ) : isCrypto ? (
                      <Wallet className="h-5 w-5" />
                    ) : (
                      <CreditCard className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                      {isBank
                        ? "Bank transfer"
                        : isCrypto
                          ? "Crypto wallet"
                          : "Payment method"}
                    </p>

                    {isBank ? (
                      <>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {selectedPaymentMethod?.bankName ?? "Not provided"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Account number: {accountNumber}
                        </p>
                      </>
                    ) : null}

                    {isCrypto ? (
                      <>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {selectedPaymentMethod?.network ?? "Not provided"}
                        </p>
                        <p className="break-all text-xs leading-5 text-slate-500 dark:text-slate-400">
                          {maskedWalletAddress}
                        </p>
                      </>
                    ) : null}

                    {!selectedPaymentMethod ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No payment method selected
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                    Withdrawal allocation
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Balances contributing to this withdrawal
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onChangeSource}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-sky-800 transition hover:border-sky-200 hover:bg-sky-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-sky-300 dark:hover:bg-sky-400/10"
                >
                  Change source
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-4 sm:p-5")}>
                <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 dark:border-white/10">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Available balance
                  </span>
                  <span className="text-sm font-semibold text-slate-950 dark:text-white">
                    {formatCurrency(totalAvailableBalance, currency)}
                  </span>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Savings
                      </span>
                      <span className="text-sm font-medium text-slate-950 dark:text-white">
                        {formatCurrency(previewSavingsAmount, currency)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{
                          width: `${
                            previewAmount > 0
                              ? Math.min(
                                  100,
                                  (previewSavingsAmount / previewAmount) * 100,
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Balance: {formatCurrency(savingsBalance, currency)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Investment
                      </span>
                      <span className="text-sm font-medium text-slate-950 dark:text-white">
                        {formatCurrency(previewInvestmentAmount, currency)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${
                            previewAmount > 0
                              ? Math.min(
                                  100,
                                  (previewInvestmentAmount / previewAmount) *
                                    100,
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Balance: {formatCurrency(investmentBalance, currency)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                Payout breakdown
              </h3>

              <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-4 sm:p-5")}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Requested amount
                    </span>
                    <span className="font-medium text-slate-950 dark:text-white">
                      {formatCurrency(
                        previewHasValidAmount ? previewAmount : 0,
                        currency,
                      )}
                    </span>
                  </div>

                  {hasEarlyFee ? (
                    <>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-amber-950 dark:text-amber-200">
                          Early withdrawal fee
                        </span>
                        <span className="font-medium text-amber-950 dark:text-amber-200">
                          {formatCurrency(previewEarlyWithdrawalFee, currency)}
                        </span>
                      </div>

                      <div className="border-t border-dashed border-border/70 pt-3 dark:border-white/10">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-slate-600 dark:text-slate-400">
                            Gross deduction
                          </span>
                          <span className="font-medium text-slate-950 dark:text-white">
                            {formatCurrency(
                              previewGrossDeductionAmount,
                              currency,
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-400/10">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                              Net payout
                            </p>
                            <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-200/80">
                              Amount after applicable fee
                            </p>
                          </div>
                          <p className="text-lg font-semibold tracking-tight text-emerald-700 dark:text-emerald-200">
                            {formatCurrency(previewNetPayoutAmount, currency)}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between gap-3 border-t border-dashed border-border/70 pt-3 text-sm dark:border-white/10">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Expected payout
                      </span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                        {formatCurrency(previewAmount, currency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
              <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                Please verify your payment destination and withdrawal details.
                Once submitted, your request will be processed according to the
                withdrawal review procedure.
              </p>
            </div>
          </div>

          <DrawerFooter className="shrink-0 border-t border-border/60 bg-white px-4 py-4 dark:border-white/10 dark:bg-slate-950 md:px-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl border-border/70 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08]"
                >
                  Edit details
                </Button>
              </DrawerClose>

              <Button
                type="button"
                onClick={onConfirm}
                disabled={isPending || !reviewDraft}
                className="h-11 gap-2 rounded-xl bg-[#3c9ee0] text-white hover:bg-[#3291d1]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Confirm withdrawal
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerSurface>
    </Drawer>
  );
}
