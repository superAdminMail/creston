"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CreditCard,
  CheckCircle2,
  Landmark,
  Loader2,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

import { createWithdrawalOrder } from "@/actions/accounts/withdrawal/createWithdrawalOrder";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateLabel } from "@/lib/formatters/formatters";
import { getFirstFormFieldError } from "@/lib/forms/actionState";
import type { AvailableWithdrawalBalanceSummary } from "@/lib/service/getAvailableWithdrawalBalance";
import type { WithdrawalSourceOption } from "@/lib/service/getAvailableWithdrawalSource";
import type { WithdrawalRequestItemDto } from "@/lib/types/withdrawalRequests";
import { calculateWithdrawalEarlyFeePreview } from "@/lib/services/investment/withdrawalPenalty";
import { MIN_WITHDRAWAL_AMOUNT } from "@/lib/zodValidations/account-operations";
import WithdrawalRequestsList from "../withdrawals/_components/WithdrawalRequestsList";

type PaymentMethod = {
  id: string;
  type: "BANK" | "CRYPTO";
  bankName?: string | null;
  accountNumber?: string | null;
  network?: string | null;
  address?: string | null;
};

type Props = {
  kycStatus: string;
  paymentMethods: PaymentMethod[];
  withdrawalSources: WithdrawalSourceOption[];
  withdrawalOrders: WithdrawalRequestItemDto[];
  availableBalance: AvailableWithdrawalBalanceSummary;
};

type WithdrawalPreviewDraft = {
  amount: string;
  methodId: string;
};

type WithdrawalSourceSelection = {
  allocationMode: "AUTO" | "SINGLE";
  sourceType: WithdrawalSourceOption["type"] | null;
  sourceId: string | null;
};

function mask(value?: string | null) {
  if (!value) return "";
  return `**** ${value.slice(-4)}`;
}

function maskWalletAddress(value?: string | null) {
  if (!value) return "Not provided";

  if (value.length <= 14) {
    return value;
  }

  return `${value.slice(0, 7)}...${value.slice(-7)}`;
}

function getPaymentMethodLabel(method: PaymentMethod) {
  if (method.type === "BANK") {
    return `${method.bankName ?? "Bank transfer"} ${mask(method.accountNumber)}`;
  }

  return `${method.network ?? "Crypto wallet"} ${mask(method.address)}`;
}

function getPaymentMethodDetail(method: PaymentMethod) {
  if (method.type === "BANK") {
    return method.bankName ?? "Bank transfer";
  }

  return method.network ?? "Crypto wallet";
}

function resolveWithdrawalPreviewAllocation(
  requestedAmount: number,
  selection: WithdrawalSourceSelection,
  savingsBalance: number,
  investmentOrders: AvailableWithdrawalBalanceSummary["investmentOrders"],
) {
  if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
    return {
      savingsPortion: 0,
      investmentPortion: 0,
    };
  }

  if (selection.allocationMode === "AUTO" || !selection.sourceType) {
    const preview = calculateWithdrawalEarlyFeePreview({
      requestedAmount,
      savingsBalance,
      investmentOrders,
    });

    return {
      savingsPortion: preview.savingsPortion,
      investmentPortion: preview.investmentPortion,
    };
  }

  if (selection.sourceType === "SAVINGS_POOL") {
    return {
      savingsPortion: requestedAmount,
      investmentPortion: 0,
    };
  }

  if (selection.sourceType === "INVESTMENT_POOL") {
    return {
      savingsPortion: 0,
      investmentPortion: requestedAmount,
    };
  }

  return {
    savingsPortion: 0,
    investmentPortion: 0,
  };
}

function getWithdrawalSourceSelectionLabel(
  selection: WithdrawalSourceSelection,
  withdrawalSources: WithdrawalSourceOption[],
) {
  if (selection.allocationMode === "AUTO" || !selection.sourceType) {
    return "Savings + Investment";
  }

  const matchedSource = withdrawalSources.find(
    (source) =>
      source.type === selection.sourceType && source.id === selection.sourceId,
  );

  return matchedSource?.label ?? "Selected source";
}

function getWithdrawalSourceSelectionDescription(
  selection: WithdrawalSourceSelection,
) {
  if (selection.allocationMode === "AUTO" || !selection.sourceType) {
    return "Savings and investment balances will both be used if needed.";
  }

  if (selection.sourceType === "SAVINGS_POOL") {
    return "Savings only.";
  }

  if (selection.sourceType === "INVESTMENT_POOL") {
    return "Investment only.";
  }

  return "Select a source.";
}

function getDefaultWithdrawalSourceSelection(
  withdrawalSources: WithdrawalSourceOption[],
  requestedAmount?: number,
): WithdrawalSourceSelection {
  const savingsSource =
    withdrawalSources.find((source) => source.type === "SAVINGS_POOL") ?? null;
  const investmentSource =
    withdrawalSources.find((source) => source.type === "INVESTMENT_POOL") ??
    null;
  const normalizedRequestedAmount = requestedAmount ?? 0;
  const hasRequestedAmount =
    Number.isFinite(normalizedRequestedAmount) && normalizedRequestedAmount > 0;

  if (hasRequestedAmount) {
    if (
      savingsSource &&
      investmentSource &&
      normalizedRequestedAmount > savingsSource.amount
    ) {
      return {
        allocationMode: "AUTO",
        sourceType: null,
        sourceId: null,
      };
    }

    if (savingsSource && normalizedRequestedAmount <= savingsSource.amount) {
      return {
        allocationMode: "SINGLE",
        sourceType: "SAVINGS_POOL",
        sourceId: savingsSource.id,
      };
    }

    if (investmentSource) {
      return {
        allocationMode: "SINGLE",
        sourceType: "INVESTMENT_POOL",
        sourceId: investmentSource.id,
      };
    }
  }

  if (savingsSource) {
    return {
      allocationMode: "SINGLE",
      sourceType: "SAVINGS_POOL",
      sourceId: savingsSource.id,
    };
  }

  if (investmentSource) {
    return {
      allocationMode: "SINGLE",
      sourceType: "INVESTMENT_POOL",
      sourceId: investmentSource.id,
    };
  }

  return {
    allocationMode: "AUTO",
    sourceType: null,
    sourceId: null,
  };
}

export default function WithdrawalsClient({
  kycStatus,
  paymentMethods,
  withdrawalSources,
  withdrawalOrders,
  availableBalance,
}: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [withdrawalSourceSelection, setWithdrawalSourceSelection] =
    useState<WithdrawalSourceSelection>(() =>
      getDefaultWithdrawalSourceSelection(withdrawalSources),
    );
  const [reviewDraft, setReviewDraft] = useState<WithdrawalPreviewDraft | null>(
    null,
  );
  const [serverState, submitWithdrawalAction, serverPending] = useActionState(
    createWithdrawalOrder,
    { status: "idle" },
  );
  const [transitionPending, startTransition] = useTransition();
  const lastToast = useRef<string | null>(null);

  const amountNumber = Number(amount);
  const hasValidAmount = Number.isFinite(amountNumber) && amountNumber > 0;
  const totalAvailableBalance = availableBalance.totalBalance;
  const availableBalanceCurrency = availableBalance.currency ?? "USD";
  const savingsBalance = availableBalance.savingsBalance;
  const investmentBalance = availableBalance.accountBalance;
  const isAutoAllocation = withdrawalSourceSelection.allocationMode === "AUTO";
  const selectedWithdrawalSource = withdrawalSourceSelection.sourceType
    ? (withdrawalSources.find(
        (source) =>
          source.type === withdrawalSourceSelection.sourceType &&
          source.id === withdrawalSourceSelection.sourceId,
      ) ?? null)
    : null;
  const selectedWithdrawalSourceAmount = selectedWithdrawalSource?.amount ?? 0;
  const minimumWithdrawalAmountLabel = formatCurrency(
    MIN_WITHDRAWAL_AMOUNT,
    availableBalanceCurrency,
  );
  const maximumWithdrawalAmountLabel = formatCurrency(
    totalAvailableBalance,
    availableBalanceCurrency,
  );
  const amountValidationMessage =
    amount.trim().length === 0
      ? null
      : !Number.isFinite(amountNumber) || amountNumber <= 0
        ? "Enter a valid amount."
        : amountNumber < MIN_WITHDRAWAL_AMOUNT
          ? `Minimum withdrawal amount is ${minimumWithdrawalAmountLabel}.`
          : amountNumber > totalAvailableBalance
            ? `Withdrawal amount cannot exceed ${maximumWithdrawalAmountLabel}.`
            : null;
  const isAmountValid =
    amountValidationMessage === null && amount.trim().length > 0;
  const previewAmount = Number(reviewDraft?.amount ?? amount);
  const previewHasValidAmount =
    Number.isFinite(previewAmount) && previewAmount > 0;
  const previewAllocation = resolveWithdrawalPreviewAllocation(
    previewHasValidAmount ? previewAmount : 0,
    withdrawalSourceSelection,
    savingsBalance,
    availableBalance.investmentOrders,
  );
  const previewSavingsAmount = previewAllocation.savingsPortion;
  const previewInvestmentAmount = previewAllocation.investmentPortion;
  const selectedPaymentMethod =
    paymentMethods.find(
      (method) => method.id === (reviewDraft?.methodId ?? selectedMethod),
    ) ?? null;
  const savingsSource =
    withdrawalSources.find((source) => source.type === "SAVINGS_POOL") ?? null;
  const investmentSource =
    withdrawalSources.find((source) => source.type === "INVESTMENT_POOL") ??
    null;
  const selectedWithdrawalSourceLabel = getWithdrawalSourceSelectionLabel(
    withdrawalSourceSelection,
    withdrawalSources,
  );
  const selectedWithdrawalSourceDescription =
    getWithdrawalSourceSelectionDescription(withdrawalSourceSelection);
  const earlyWithdrawalPreview = previewHasValidAmount
    ? isAutoAllocation
      ? calculateWithdrawalEarlyFeePreview({
          requestedAmount: previewAmount,
          savingsBalance,
          investmentOrders: availableBalance.investmentOrders,
        })
      : withdrawalSourceSelection.sourceType === "INVESTMENT_POOL"
        ? calculateWithdrawalEarlyFeePreview({
            requestedAmount: previewAmount,
            savingsBalance: 0,
            investmentOrders: availableBalance.investmentOrders,
          })
        : {
            savingsPortion: previewAmount,
            investmentPortion: 0,
            earlyWithdrawalFee: 0,
            estimatedNetPayout: previewAmount,
            estimatedGrossDeduction: previewAmount,
            hasEarlyWithdrawal: false,
          }
    : null;
  const previewEarlyWithdrawalFee =
    earlyWithdrawalPreview?.earlyWithdrawalFee ?? 0;
  const previewNetPayoutAmount =
    earlyWithdrawalPreview?.estimatedNetPayout ?? previewAmount;
  const previewGrossDeductionAmount =
    earlyWithdrawalPreview?.estimatedGrossDeduction ?? previewAmount;
  const isMixedSourceSelection =
    withdrawalSourceSelection.allocationMode === "AUTO" &&
    previewSavingsAmount > 0 &&
    previewInvestmentAmount > 0;

  const isConfirmPending = serverPending || transitionPending;

  function selectWithdrawalSource(selection: WithdrawalSourceSelection) {
    setWithdrawalSourceSelection(selection);
    setSourcePickerOpen(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (amountValidationMessage) {
      toast.error(amountValidationMessage);
      return;
    }

    if (!selectedMethod) {
      toast.error("Select a payment method.");
      return;
    }

    const nextSelection = getDefaultWithdrawalSourceSelection(
      withdrawalSources,
      amountNumber,
    );

    setWithdrawalSourceSelection(nextSelection);
    setReviewDraft({
      amount,
      methodId: selectedMethod,
    });
    setReviewOpen(true);
  }

  function handleConfirmWithdrawal() {
    if (!reviewDraft) {
      return;
    }

    const confirmAmount = Number(reviewDraft.amount);

    if (
      withdrawalSourceSelection.allocationMode === "SINGLE" &&
      !selectedWithdrawalSource
    ) {
      toast.error("Select a valid withdrawal source.");
      return;
    }

    if (
      withdrawalSourceSelection.allocationMode === "SINGLE" &&
      selectedWithdrawalSourceAmount > 0 &&
      Number.isFinite(confirmAmount) &&
      confirmAmount > selectedWithdrawalSourceAmount
    ) {
      toast.error(
        "This source cannot cover the requested amount. Use Savings + Investment or lower the amount.",
      );
      return;
    }

    const formData = new FormData();
    formData.set("amount", reviewDraft.amount);
    formData.set("methodId", reviewDraft.methodId);
    formData.set("allocationMode", withdrawalSourceSelection.allocationMode);

    if (withdrawalSourceSelection.allocationMode === "SINGLE") {
      formData.set("sourceType", withdrawalSourceSelection.sourceType ?? "");
      formData.set("sourceId", withdrawalSourceSelection.sourceId ?? "");
    }

    startTransition(() => {
      void submitWithdrawalAction(formData);
    });
  }

  useEffect(() => {
    if (serverState.status === "idle" || !serverState.message) {
      return;
    }

    const toastMessage = serverState.message ?? "Withdrawal request submitted.";
    const toastKey = `${serverState.status}:${toastMessage}`;

    if (lastToast.current === toastKey) {
      return;
    }

    lastToast.current = toastKey;

    if (serverState.status === "success") {
      toast.success(toastMessage);
      setReviewOpen(false);
      setSourcePickerOpen(false);
      setReviewDraft(null);
      setAmount("");
      setSelectedMethod(null);
      setWithdrawalSourceSelection(
        getDefaultWithdrawalSourceSelection(withdrawalSources),
      );
      router.refresh();
      return;
    }

    toast.error(toastMessage);
  }, [router, serverState]);

  useEffect(() => {
    if (!reviewOpen) {
      setSourcePickerOpen(false);
    }
  }, [reviewOpen]);

  useEffect(() => {
    setWithdrawalSourceSelection((current) => {
      if (!current.sourceType || !current.sourceId) {
        return getDefaultWithdrawalSourceSelection(withdrawalSources);
      }

      const stillAvailable = withdrawalSources.some(
        (source) =>
          source.type === current.sourceType && source.id === current.sourceId,
      );

      return stillAvailable
        ? current
        : getDefaultWithdrawalSourceSelection(withdrawalSources);
    });
  }, [withdrawalSources]);

  const availableBalanceLabel =
    savingsBalance > 0 && investmentBalance > 0
      ? "Savings and investment balances available for withdrawal"
      : investmentBalance > 0
        ? "Investment balance available for withdrawal"
        : savingsBalance > 0
          ? "Savings balance available for withdrawal"
          : "No eligible balance available";

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">Withdraw Funds</h1>
        <p className="mt-1 text-sm text-slate-400">
          Transfer funds securely to your preferred method
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
        <p className="text-sm text-slate-400">Available Balance</p>
        <h2 className="mt-2 text-3xl font-bold text-white">
          {formatCurrency(totalAvailableBalance, availableBalanceCurrency)}
        </h2>
        <p className="mt-2 text-sm text-slate-400">{availableBalanceLabel}</p>
      </div>

      {kycStatus !== "VERIFIED" ? (
        <div className="flex gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-500/5 p-4 text-sm text-yellow-400">
          <ShieldAlert className="mt-0.5 h-4 w-4" />
          Complete identity verification to enable withdrawals.
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
      >
        <h3 className="font-medium text-white">Withdrawal Request Form</h3>

        <div className="space-y-2">
          <label className="text-xs uppercase text-slate-400">Amount</label>
          <Input
            name="amount"
            placeholder="$0.00"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
            }}
            className="border-white/10 bg-white/5 text-white/50 focus:border-[#3c9ee0]"
          />
          {/* <p className="text-xs text-slate-500">
            Minimum withdrawal amount is {minimumWithdrawalAmountLabel}. Maximum
            withdrawal amount is {maximumWithdrawalAmountLabel}.
          </p> */}
          <FieldError>{amountValidationMessage}</FieldError>
        </div>

        <div className="space-y-3">
          <label className="text-xs uppercase text-slate-400">
            Payment Method
          </label>

          {paymentMethods.length > 0 ? (
            <p className="text-xs tracking-[0.2em] text-slate-400">
              Tap to select payment method
            </p>
          ) : null}

          {paymentMethods.map((method) => {
            const active = selectedMethod === method.id;
            const label = getPaymentMethodLabel(method);

            return (
              <button
                type="button"
                key={method.id}
                onClick={() => {
                  setSelectedMethod(method.id);
                }}
                className={`flex w-full items-center justify-between rounded-xl border p-4 transition ${
                  active
                    ? "border-[#3c9ee0] bg-[#3c9ee0]/10"
                    : "border-white/10 bg-white/5"
                }`}
                aria-pressed={active}
              >
                <div className="flex items-center gap-3">
                  {method.type === "BANK" ? (
                    <Landmark className="h-4 w-4 text-slate-300" />
                  ) : (
                    <CreditCard className="h-4 w-4 text-slate-300" />
                  )}
                  <span className="text-sm text-white">{label}</span>
                </div>

                {active ? (
                  <span className="text-xs text-[#3c9ee0]">Selected</span>
                ) : null}
              </button>
            );
          })}

          {paymentMethods.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-slate-300">
                No payment method has been added yet.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Add a verified bank account or crypto wallet before requesting a
                withdrawal.
              </p>
              <Link
                href="/account/dashboard/user/payment-info"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-[#3c9ee0]/30 bg-[#3c9ee0]/10 px-4 text-sm font-medium text-[#8fd0ff] transition hover:bg-[#3c9ee0]/15 hover:text-white"
              >
                Add payment method
              </Link>
            </div>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={isConfirmPending || !selectedMethod || !isAmountValid}
          className="w-full gap-2 rounded-xl bg-[#3c9ee0]"
        >
          Submit
        </Button>
      </form>

      <Drawer open={reviewOpen} onOpenChange={setReviewOpen}>
        <DrawerContent className="text-white">
          <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
            <DrawerHeader className="border-b border-white/10 px-4 pb-4 pt-4 text-left md:px-6">
              <DrawerTitle className="text-left text-xl">
                Review withdrawal
              </DrawerTitle>
              <DrawerDescription className="text-left text-slate-400">
                Confirm the amount and payment method before we submit the
                request.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-6">
              {serverState.status === "error" && serverState.message ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                  <p className="font-medium">Unable to submit withdrawal</p>
                  <p className="mt-1 leading-6">{serverState.message}</p>
                  {getFirstFormFieldError(serverState.fieldErrors) ? (
                    <p className="mt-2 text-rose-100/80">
                      {getFirstFormFieldError(serverState.fieldErrors)}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Withdrawal preview
                </p>

                <Table className="mt-3">
                  <TableBody>
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableCell className="px-0 py-2 text-slate-400">
                        Requested amount
                      </TableCell>
                      <TableCell className="px-0 py-2 text-right font-medium text-white">
                        {formatCurrency(
                          previewHasValidAmount ? previewAmount : 0,
                          availableBalanceCurrency,
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow className="border-0 hover:bg-transparent">
                      <TableCell className="px-0 py-2 text-slate-400">
                        Payment method
                      </TableCell>
                      <TableCell className="px-0 py-2 text-right font-medium text-white">
                        {selectedPaymentMethod
                          ? selectedPaymentMethod.type === "BANK"
                            ? "Bank transfer"
                            : "Crypto wallet"
                          : "Not selected"}
                      </TableCell>
                    </TableRow>

                    {selectedPaymentMethod?.type === "BANK" ? (
                      <>
                        <TableRow className="border-0 hover:bg-transparent">
                          <TableCell className="px-0 py-2 text-slate-400">
                            Bank name
                          </TableCell>
                          <TableCell className="px-0 py-2 text-right font-medium text-white">
                            {selectedPaymentMethod.bankName ?? "Not provided"}
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-0 hover:bg-transparent">
                          <TableCell className="px-0 py-2 text-slate-400">
                            Account number
                          </TableCell>
                          <TableCell className="px-0 py-2 text-right font-medium text-white">
                            {selectedPaymentMethod.accountNumber ??
                              "Not provided"}
                          </TableCell>
                        </TableRow>
                      </>
                    ) : null}

                    {selectedPaymentMethod?.type === "CRYPTO" ? (
                      <>
                        <TableRow className="border-0 hover:bg-transparent">
                          <TableCell className="px-0 py-2 text-slate-400">
                            Network
                          </TableCell>
                          <TableCell className="px-0 py-2 text-right font-medium text-white">
                            {selectedPaymentMethod.network ?? "Not provided"}
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-0 hover:bg-transparent">
                          <TableCell className="px-0 py-2 text-slate-400">
                            Wallet address
                          </TableCell>
                          <TableCell className="px-0 py-2 text-right font-medium text-white break-all">
                            {maskWalletAddress(selectedPaymentMethod.address)}
                          </TableCell>
                        </TableRow>
                      </>
                    ) : null}

                    {previewEarlyWithdrawalFee > 0 ? (
                      <>
                        <TableRow className="border-0 hover:bg-transparent">
                          <TableCell className="px-0 py-2 text-slate-400">
                            Early withdrawal fee
                          </TableCell>
                          <TableCell className="px-0 py-2 text-right font-medium text-amber-100">
                            {formatCurrency(
                              previewEarlyWithdrawalFee,
                              availableBalanceCurrency,
                            )}{" "}
                            <span className="ml-2 rounded-full border border-amber-200/20 bg-amber-500/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-amber-50">
                              Applies now
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-0 hover:bg-transparent">
                          <TableCell className="px-0 py-2 text-slate-400">
                            Net payout
                          </TableCell>
                          <TableCell className="px-0 py-2 text-right font-medium text-emerald-100">
                            {formatCurrency(
                              previewNetPayoutAmount,
                              availableBalanceCurrency,
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-0 hover:bg-transparent">
                          <TableCell className="px-0 py-2 text-slate-400">
                            Gross deduction
                          </TableCell>
                          <TableCell className="px-0 py-2 text-right font-medium text-white">
                            {formatCurrency(
                              previewGrossDeductionAmount,
                              availableBalanceCurrency,
                            )}
                          </TableCell>
                        </TableRow>
                      </>
                    ) : null}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-start justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Withdrawal source
                </p>

                <button
                  type="button"
                  onClick={() => setSourcePickerOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-[#3c9ee0]/30 hover:bg-[#3c9ee0]/10 hover:text-white"
                >
                  Change
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                    Available balance (
                    {formatCurrency(
                      totalAvailableBalance,
                      availableBalanceCurrency,
                    )}
                    )
                  </p>

                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-emerald-400"
                    aria-hidden="true"
                  />
                </div>

                <div className="my-4 border-t border-dashed border-white/10" />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">
                      Savings (
                      {formatCurrency(savingsBalance, availableBalanceCurrency)}
                      )
                    </span>
                    <span className="font-medium text-white">
                      -
                      {formatCurrency(
                        previewSavingsAmount,
                        availableBalanceCurrency,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">
                      Investment (
                      {formatCurrency(
                        investmentBalance,
                        availableBalanceCurrency,
                      )}
                      )
                    </span>
                    <span className="font-medium text-white">
                      -
                      {formatCurrency(
                        previewInvestmentAmount,
                        availableBalanceCurrency,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DrawerFooter className="border-t border-white/10 bg-white/[0.02] px-4 py-4 md:px-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <DrawerClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                  >
                    Edit details
                  </Button>
                </DrawerClose>

                <Button
                  type="button"
                  onClick={handleConfirmWithdrawal}
                  disabled={isConfirmPending || !reviewDraft}
                  className="gap-2 rounded-xl bg-[#3c9ee0]"
                >
                  {isConfirmPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Withdraw funds"
                  )}
                </Button>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={sourcePickerOpen} onOpenChange={setSourcePickerOpen}>
        <DrawerContent className="z-[60] text-white data-[vaul-drawer-direction=bottom]:max-h-[42vh]">
          <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
            <DrawerHeader className="border-b border-white/10 px-4 pb-4 pt-4 text-left md:px-6">
              <DrawerTitle className="text-left text-lg">
                Choose withdrawal source
              </DrawerTitle>
              <DrawerDescription className="text-left text-slate-400">
                Choose the balance source you want this withdrawal to use.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                    Available balance (
                    {formatCurrency(
                      totalAvailableBalance,
                      availableBalanceCurrency,
                    )}
                    )
                  </p>

                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-emerald-400"
                    aria-hidden="true"
                  />
                </div>

                <div className="my-4 border-t border-dashed border-white/10" />

                <div className="space-y-2 text-sm">
                  {[
                    {
                      key: "SAVINGS_POOL",
                      source: savingsSource,
                      label: "Savings",
                    },
                    {
                      key: "INVESTMENT_POOL",
                      source: investmentSource,
                      label: "Investment",
                    },
                  ].map(({ key, source, label }) => {
                    const isSelected =
                      withdrawalSourceSelection.allocationMode === "SINGLE"
                        ? withdrawalSourceSelection.sourceType === key
                        : isMixedSourceSelection
                          ? (key === "SAVINGS_POOL" &&
                              previewSavingsAmount > 0) ||
                            (key === "INVESTMENT_POOL" &&
                              previewInvestmentAmount > 0)
                          : false;
                    const isDisabled =
                      !source ||
                      source.amount <= 0 ||
                      (previewHasValidAmount && isMixedSourceSelection);

                    return (
                      <button
                        type="button"
                        key={key}
                        disabled={isDisabled}
                        onClick={() => {
                          if (!source || source.amount <= 0) {
                            return;
                          }

                          if (isMixedSourceSelection) {
                            return;
                          }

                          selectWithdrawalSource({
                            allocationMode: "SINGLE",
                            sourceType: source.type,
                            sourceId: source.id,
                          });
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/5 ${
                          isSelected ? "bg-emerald-500/10" : ""
                        } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        <span className="text-slate-400">
                          {label} (
                          {source
                            ? formatCurrency(source.amount, source.currency)
                            : "$0.00"}
                          )
                        </span>
                        <span className="flex items-center gap-2 font-medium text-white">
                          {isSelected ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <DrawerFooter className="border-t border-white/10 bg-white/[0.02] px-4 py-4 md:px-6">
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                >
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <WithdrawalRequestsList withdrawalOrders={withdrawalOrders} />
    </div>
  );
}
