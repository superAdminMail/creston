"use client";

import SharedPaymentProofModal from "@/components/payments/SharedPaymentProofModal";
import { formatCurrency } from "@/lib/formatters/formatters";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savingsAccountId: string;
  platformPaymentMethodId: string;
  currency: string;
  defaultAmount: number;
  maxAmount: number | null;
};

export default function SavingsFundingProofModal({
  open,
  onOpenChange,
  savingsAccountId,
  platformPaymentMethodId,
  currency,
  defaultAmount,
  maxAmount,
}: Props) {
  return (
    <SharedPaymentProofModal
      open={open}
      onOpenChange={onOpenChange}
      title="Submit savings funding proof"
      description="Attach proof for review"
      defaultAmount={defaultAmount}
      amountLabel={`Deposit amount (${currency})`}
      amountMin={0.01}
      amountMax={maxAmount}
      amountHint={
        maxAmount !== null ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Suggested maximum for this goal: {formatCurrency(maxAmount, currency)}
          </p>
        ) : null
      }
      submitLabel="Submit proof"
      submit={async (input) => {
        const { submitSavingsFundingProof } = await import(
          "@/actions/savings/submitSavingsFundingProof"
        );

        return submitSavingsFundingProof({
          savingsAccountId,
          platformPaymentMethodId,
          claimedAmount: input.claimedAmount,
          depositorName: input.depositorName,
          depositorAccountName: input.depositorAccountName,
          depositorAccountNo: input.depositorAccountNo,
          transferReference: input.transferReference,
          note: input.note,
          receiptFileId: input.receiptFileId,
        });
      }}
    />
  );
}
