"use client";

import { useWithdrawalFlow } from "../_hooks/useWithdrawalFlow";
import type { WithdrawalsClientProps } from "../_lib/withdrawal-types";
import WithdrawalBalanceCard from "./WithdrawalBalanceCard";
import WithdrawalRequestForm from "./WithdrawalRequestForm";
import WithdrawalReviewDrawer from "./WithdrawalReviewDrawer";
import WithdrawalSourceDrawer from "./WithdrawalSourceDrawer";
import WithdrawalRequestsList from "./WithdrawalRequestsList";

export default function WithdrawalsClient({
  kycStatus,
  paymentMethods,
  withdrawalSources,
  withdrawalOrders,
  availableBalance,
}: WithdrawalsClientProps) {
  const flow = useWithdrawalFlow({
    paymentMethods,
    withdrawalSources,
    availableBalance,
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:gap-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-800 dark:text-sky-300">
          Account funds
        </p>

        <h1 className="text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-3xl dark:text-white">
          Withdraw funds
        </h1>

        <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          Manage your available balance, request a withdrawal, and keep track of
          previous withdrawal requests.
        </p>
      </header>

      <WithdrawalBalanceCard
        totalAvailableBalance={flow.totalAvailableBalance}
        savingsBalance={flow.savingsBalance}
        investmentBalance={flow.investmentBalance}
        currency={flow.availableBalanceCurrency}
        description={flow.availableBalanceLabel}
      />

      <WithdrawalRequestForm
        kycStatus={kycStatus}
        paymentMethods={paymentMethods}
        amount={flow.amount}
        selectedMethod={flow.selectedMethod}
        totalAvailableBalance={flow.totalAvailableBalance}
        currency={flow.availableBalanceCurrency}
        amountValidationMessage={flow.amountValidationMessage}
        isAmountValid={flow.isAmountValid}
        isPending={flow.isConfirmPending}
        onAmountChange={flow.setAmount}
        onMethodChange={flow.setSelectedMethod}
        onSubmit={flow.handleSubmit}
      />

      <section
        aria-labelledby="withdrawal-activity-heading"
        className="space-y-4"
      >
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Activity
          </p>

          <h2
            id="withdrawal-activity-heading"
            className="text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white"
          >
            Withdrawal history
          </h2>

          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
            Review the status and details of your previous withdrawal requests.
          </p>
        </div>

        <WithdrawalRequestsList withdrawalOrders={withdrawalOrders} />
      </section>

      <WithdrawalReviewDrawer
        open={flow.reviewOpen}
        onOpenChange={flow.handleReviewOpenChange}
        reviewDraft={flow.reviewDraft}
        serverState={flow.serverState}
        selectedPaymentMethod={flow.selectedPaymentMethod}
        totalAvailableBalance={flow.totalAvailableBalance}
        currency={flow.availableBalanceCurrency}
        previewAmount={flow.previewAmount}
        previewHasValidAmount={flow.previewHasValidAmount}
        savingsBalance={flow.savingsBalance}
        investmentBalance={flow.investmentBalance}
        previewSavingsAmount={flow.previewSavingsAmount}
        previewInvestmentAmount={flow.previewInvestmentAmount}
        previewEarlyWithdrawalFee={flow.previewEarlyWithdrawalFee}
        previewNetPayoutAmount={flow.previewNetPayoutAmount}
        previewGrossDeductionAmount={flow.previewGrossDeductionAmount}
        isPending={flow.isConfirmPending}
        onChangeSource={() => flow.setSourcePickerOpen(true)}
        onConfirm={flow.handleConfirmWithdrawal}
      />

      <WithdrawalSourceDrawer
        open={flow.sourcePickerOpen}
        onOpenChange={flow.setSourcePickerOpen}
        totalAvailableBalance={flow.totalAvailableBalance}
        currency={flow.availableBalanceCurrency}
        savingsSource={flow.savingsSource}
        investmentSource={flow.investmentSource}
        selection={flow.effectiveWithdrawalSourceSelection}
        isMixedSourceSelection={flow.isMixedSourceSelection}
        previewHasValidAmount={flow.previewHasValidAmount}
        previewSavingsAmount={flow.previewSavingsAmount}
        previewInvestmentAmount={flow.previewInvestmentAmount}
        onSelect={flow.selectWithdrawalSource}
      />
    </div>
  );
}
