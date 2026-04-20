"use client";

import { InvestmentOrderPaymentDetails } from "@/lib/types/payments/investmentOrderPayment.types";
import { useMemo, useState } from "react";
import BankTransferInstructionsCard from "./BankTransferInstructionsCard";
import MissingBankInfoCard from "./MissingBankInfoCard";
import OrderPaymentHistory from "./OrderPaymentHistory";
import OrderPaymentSelector from "./OrderPaymentSelector";
import OrderPaymentStatusBanner from "./OrderPaymentStatusBanner";
import OrderPaymentSummaryCard from "./OrderPaymentSummaryCard";
import PaymentProofModal from "./PaymentProofModal";

export default function InvestmentOrderPaymentWorkspace({
  order,
}: {
  order: InvestmentOrderPaymentDetails;
}) {
  const [mode, setMode] = useState<"FULL" | "PARTIAL" | null>(null);
  const [partialAmount] = useState<number>(order.remainingAmount);
  const [proofOpen, setProofOpen] = useState(false);

  const canSubmitPayment =
    order.status === "PENDING_PAYMENT" || order.status === "PARTIALLY_PAID";

  const selectedAmount = useMemo(() => {
    if (mode === "FULL") return order.remainingAmount;
    if (mode === "PARTIAL") {
      return Math.min(Math.max(partialAmount || 0, 0), order.remainingAmount);
    }
    return 0;
  }, [mode, partialAmount, order.remainingAmount]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
      <OrderPaymentStatusBanner order={order} />
      <OrderPaymentSummaryCard order={order} />

      {canSubmitPayment ? (
        <>
          <OrderPaymentSelector
            remainingAmount={order.remainingAmount}
            currency={order.currency}
            mode={mode}
            partialAmount={partialAmount}
            onModeChange={setMode}
          />

          {mode ? (
            order.hasBankMethod && order.bankMethod ? (
              <BankTransferInstructionsCard
                bankMethod={order.bankMethod}
                selectedAmount={selectedAmount}
                currency={order.currency}
                onConfirmPaid={() => setProofOpen(true)}
              />
            ) : (
              <MissingBankInfoCard
                orderId={order.id}
                hasExistingRequest={order.hasExistingBankInfoRequest}
              />
            )
          ) : null}
        </>
      ) : null}

      <OrderPaymentHistory payments={order.recentPayments} />

      <PaymentProofModal
        open={proofOpen}
        onOpenChange={setProofOpen}
        orderId={order.id}
        platformPaymentMethodId={order.bankMethod?.id ?? null}
        currency={order.currency}
        defaultAmount={selectedAmount}
        maxAmount={order.remainingAmount}
      />
    </div>
  );
}
