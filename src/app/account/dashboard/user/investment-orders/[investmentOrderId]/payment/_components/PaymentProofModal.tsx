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
};

export default function PaymentProofModal({
  open,
  onOpenChange,
  orderId,
  platformPaymentMethodId,
  currency,
  defaultAmount,
  maxAmount,
}: Props) {
  return (
    <SharedPaymentProofModal
      open={open}
      onOpenChange={onOpenChange}
      title="Submit payment proof"
      description="Attach proof for review"
      defaultAmount={defaultAmount}
      amountLabel={`Claimed amount (${currency})`}
      amountMin={1}
      amountMax={maxAmount}
      submitLabel="Submit proof"
      submit={async (input) => {
        if (!platformPaymentMethodId) {
          return {
            ok: false,
            message: "No bank payment method is currently available.",
          };
        }

        const { submitInvestmentBankPaymentProof } = await import(
          "@/actions/accounts/payments/submitInvestmentBankPaymentProof"
        );

        return submitInvestmentBankPaymentProof({
          orderId,
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
