"use client";

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

import { createWithdrawalOrder } from "@/actions/accounts/withdrawal/createWithdrawalOrder";
import { formatCurrency } from "@/lib/formatters/formatters";
import { calculateWithdrawalEarlyFeePreview } from "@/lib/services/investment/withdrawalPenalty";
import { MIN_WITHDRAWAL_AMOUNT } from "@/lib/zodValidations/account-operations";
import type {
  WithdrawalsClientProps,
  WithdrawalPreviewDraft,
  WithdrawalSourceSelection,
} from "../_lib/withdrawal-types";
import {
  getDefaultWithdrawalSourceSelection,
  normalizeWithdrawalSourceSelection,
  resolveWithdrawalPreviewAllocation,
} from "../_lib/withdrawal-helpers";

export function useWithdrawalFlow({
  paymentMethods,
  withdrawalSources,
  availableBalance,
}: Pick<
  WithdrawalsClientProps,
  "paymentMethods" | "withdrawalSources" | "availableBalance"
>) {
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
  const totalAvailableBalance = availableBalance.totalBalance;
  const availableBalanceCurrency = availableBalance.currency ?? "USD";
  const savingsBalance = availableBalance.savingsBalance;
  const investmentBalance = availableBalance.accountBalance;

  const effectiveWithdrawalSourceSelection = normalizeWithdrawalSourceSelection(
    withdrawalSourceSelection,
    withdrawalSources,
  );

  const isAutoAllocation =
    effectiveWithdrawalSourceSelection.allocationMode === "AUTO";

  const selectedWithdrawalSource = effectiveWithdrawalSourceSelection.sourceType
    ? (withdrawalSources.find(
        (source) =>
          source.type === effectiveWithdrawalSourceSelection.sourceType &&
          source.id === effectiveWithdrawalSourceSelection.sourceId,
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
    effectiveWithdrawalSourceSelection,
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

  const earlyWithdrawalPreview = previewHasValidAmount
    ? isAutoAllocation
      ? calculateWithdrawalEarlyFeePreview({
          requestedAmount: previewAmount,
          savingsBalance,
          investmentOrders: availableBalance.investmentOrders,
        })
      : effectiveWithdrawalSourceSelection.sourceType === "INVESTMENT_POOL"
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
    effectiveWithdrawalSourceSelection.allocationMode === "AUTO" &&
    previewSavingsAmount > 0 &&
    previewInvestmentAmount > 0;

  const isConfirmPending = serverPending || transitionPending;

  const availableBalanceLabel =
    savingsBalance > 0 && investmentBalance > 0
      ? "Savings and investment balances available for withdrawal"
      : investmentBalance > 0
        ? "Investment balance available for withdrawal"
        : savingsBalance > 0
          ? "Savings balance available for withdrawal"
          : "No eligible balance available";

  function selectWithdrawalSource(selection: WithdrawalSourceSelection) {
    setWithdrawalSourceSelection(selection);
    setSourcePickerOpen(false);
  }

  function handleReviewOpenChange(nextOpen: boolean) {
    setReviewOpen(nextOpen);

    if (!nextOpen) {
      setSourcePickerOpen(false);
    }
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
      effectiveWithdrawalSourceSelection.allocationMode === "SINGLE" &&
      !selectedWithdrawalSource
    ) {
      toast.error("Select a valid withdrawal source.");
      return;
    }

    if (
      effectiveWithdrawalSourceSelection.allocationMode === "SINGLE" &&
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
    formData.set(
      "allocationMode",
      effectiveWithdrawalSourceSelection.allocationMode,
    );

    if (effectiveWithdrawalSourceSelection.allocationMode === "SINGLE") {
      formData.set(
        "sourceType",
        effectiveWithdrawalSourceSelection.sourceType ?? "",
      );
      formData.set(
        "sourceId",
        effectiveWithdrawalSourceSelection.sourceId ?? "",
      );
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

      const resetTimer = window.setTimeout(() => {
        setReviewOpen(false);
        setSourcePickerOpen(false);
        setReviewDraft(null);
        setAmount("");
        setSelectedMethod(null);
        setWithdrawalSourceSelection(
          getDefaultWithdrawalSourceSelection(withdrawalSources),
        );
        router.refresh();
      }, 0);

      return () => window.clearTimeout(resetTimer);
    }

    toast.error(toastMessage);
  }, [router, serverState, withdrawalSources]);

  return {
    amount,
    setAmount,
    selectedMethod,
    setSelectedMethod,
    reviewOpen,
    setReviewOpen,
    sourcePickerOpen,
    setSourcePickerOpen,
    reviewDraft,
    serverState,
    amountValidationMessage,
    isAmountValid,
    totalAvailableBalance,
    availableBalanceCurrency,
    availableBalanceLabel,
    savingsBalance,
    investmentBalance,
    previewAmount,
    previewHasValidAmount,
    previewSavingsAmount,
    previewInvestmentAmount,
    selectedPaymentMethod,
    savingsSource,
    investmentSource,
    previewEarlyWithdrawalFee,
    previewNetPayoutAmount,
    previewGrossDeductionAmount,
    isMixedSourceSelection,
    effectiveWithdrawalSourceSelection,
    isConfirmPending,
    handleSubmit,
    handleConfirmWithdrawal,
    handleReviewOpenChange,
    selectWithdrawalSource,
  };
}
