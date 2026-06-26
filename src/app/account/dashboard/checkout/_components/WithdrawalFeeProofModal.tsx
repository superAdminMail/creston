"use client";

import SharedPaymentProofModal from "@/components/payments/SharedPaymentProofModal";
import { formatCurrency } from "@/lib/formatters/formatters";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawalId: string;
  platformPaymentMethodId: string;
  currency: string;
  defaultAmount: number;
  maxAmount: number | null;
  mode?: "BANK_TRANSFER" | "CRYPTO_PROVIDER";
};

export default function WithdrawalFeeProofModal({
  open,
  onOpenChange,
  withdrawalId,
  platformPaymentMethodId,
  currency,
  defaultAmount,
  maxAmount,
  mode = "BANK_TRANSFER",
}: Props) {
  const isCryptoMode = mode === "CRYPTO_PROVIDER";

  return (
    <SharedPaymentProofModal
      open={open}
      onOpenChange={onOpenChange}
      title={
        isCryptoMode ? "Confirm crypto fee payment" : "Submit withdrawal fee proof"
      }
      description={
        isCryptoMode
          ? "Enter the amount you sent and attach a receipt image. Partial crypto fee submissions are supported."
          : "Attach proof for review"
      }
      defaultAmount={defaultAmount}
      amountLabel={`${isCryptoMode ? "Claim" : "Fee"} amount (${currency})`}
      amountMin={0.01}
      amountMax={maxAmount}
      amountHint={
        maxAmount !== null ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Remaining fee due: {formatCurrency(maxAmount, currency)}
          </p>
        ) : null
      }
      submitLabel="Submit proof"
      mode={mode}
      submit={async (input) => {
        const { submitWithdrawalFeeProof } = await import(
          "@/actions/withdrawals/submitWithdrawalFeeProof"
        );

        return submitWithdrawalFeeProof({
          withdrawalId,
          platformPaymentMethodId,
          proofMode: isCryptoMode ? "CRYPTO_PROVIDER" : "BANK_TRANSFER",
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
