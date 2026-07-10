"use client";

import SharedPaymentProofModal from "@/components/payments/SharedPaymentProofModal";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  platformPaymentMethodId: string | null;
  currency: string;
  defaultAmount: number;
  maxAmount: number;
  proofMode?: "BANK_TRANSFER" | "CRYPTO_PROVIDER";
  isUpgradeFlow?: boolean;
};

export default function PaymentProofModal({
  open,
  onOpenChange,
  orderId,
  platformPaymentMethodId,
  currency,
  defaultAmount,
  maxAmount,
  proofMode = "BANK_TRANSFER",
  isUpgradeFlow = false,
}: Props) {
  const isCryptoMode = proofMode === "CRYPTO_PROVIDER";

  return (
    <SharedPaymentProofModal
      open={open}
      onOpenChange={onOpenChange}
      title={isCryptoMode ? "Confirm crypto payment" : "Submit payment proof"}
      description={
        isCryptoMode
          ? isUpgradeFlow
            ? "Enter the fixed upgrade amount shown above, then attach a clear receipt image."
            : "Enter the amount you sent and attach a clear receipt image. Partial crypto submissions are supported."
          : "Attach proof for admin review."
      }
      defaultAmount={defaultAmount}
      amountLabel={`${isUpgradeFlow ? "Upgrade amount" : "Claim amount"} (${currency})`}
      amountMin={isUpgradeFlow ? maxAmount : 1}
      amountMax={maxAmount}
      submitLabel="Submit proof"
      mode={proofMode}
      submit={async (input) => {
        if (!platformPaymentMethodId) {
          return {
            ok: false,
            message: "No payment method is currently available.",
          };
        }

        const { submitInvestmentBankPaymentProof } = await import(
          "@/actions/accounts/payments/submitInvestmentBankPaymentProof"
        );

        return submitInvestmentBankPaymentProof({
          orderId,
          platformPaymentMethodId,
          proofMode: isCryptoMode ? "CRYPTO_PROVIDER" : "BANK_TRANSFER",
          isUpgradeFlow,
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
