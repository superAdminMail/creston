import SavingsFundingClient from "./SavingsFundingClient";
import SavingsCryptoCheckoutButton from "./SavingsCryptoCheckoutButton";
import { getSavingsFundingDetails } from "../_lib/getSavingsFundingDetails";
import { calculateSavingsFundingChargeAmount } from "@/lib/payments/savings/calculateSavingsFundingChargeAmount";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";
import type { CheckoutPaymentMode } from "@/lib/types/payments/checkout.types";

function normalizeFundingMethodType(
  value: string | null | undefined,
): CheckoutFundingMethodType | null {
  if (value === "BANK_TRANSFER" || value === "CRYPTO_PROVIDER") {
    return value;
  }

  return null;
}

export default async function SavingsFunding({
  savingsAccountId,
  fundingMethodType,
  paymentMode,
}: {
  savingsAccountId: string;
  fundingMethodType: CheckoutFundingMethodType | null;
  paymentMode: CheckoutPaymentMode | null;
}) {
  const details = await getSavingsFundingDetails(
    savingsAccountId,
    fundingMethodType,
  );
  const selectedFundingMethod =
    fundingMethodType ??
    normalizeFundingMethodType(details.latestIntent?.fundingMethodType) ??
    "BANK_TRANSFER";
  const effectivePaymentMode =
    details.latestIntent?.status === "PARTIALLY_PAID"
      ? "PARTIAL"
      : selectedFundingMethod === "CRYPTO_PROVIDER"
        ? "FULL"
        : paymentMode;
  const chargeBasis =
    details.account.targetAmount ??
    details.fundingAmountSuggestion ??
    details.account.balance;
  const selectedAmount =
    !effectivePaymentMode
      ? details.remainingToTargetAmount ?? chargeBasis
      : (() => {
          try {
            const calculatedAmount = calculateSavingsFundingChargeAmount({
              totalAmount: chargeBasis,
              amountPaid: details.latestIntent?.creditedAmount ?? 0,
              usePartialPayment:
                selectedFundingMethod === "BANK_TRANSFER" &&
                effectivePaymentMode === "PARTIAL",
              fundingMethodType: selectedFundingMethod,
              hasPendingSubmission: details.hasPendingSubmission,
              hasActiveCryptoIntent: false,
            }).chargeAmount.toNumber();

            if (
              selectedFundingMethod === "BANK_TRANSFER" &&
              details.latestIntent?.status === "PARTIALLY_PAID" &&
              details.latestFundingPaymentShortfallAmount > 0
            ) {
              return (
                calculatedAmount + details.latestFundingPaymentShortfallAmount
              );
            }

            return calculatedAmount;
          } catch {
            return details.remainingToTargetAmount ?? chargeBasis;
          }
        })();
  const cryptoCheckoutLabel =
    details.latestIntent?.status === "PARTIALLY_PAID"
      ? "Complete Payment"
      : "Pay with crypto";

  return (
    <SavingsFundingClient
      details={details}
      fundingMethodType={fundingMethodType}
      paymentMode={paymentMode}
      selectedAmount={selectedAmount}
      cryptoCheckoutButton={
        <SavingsCryptoCheckoutButton
          savingsAccountId={savingsAccountId}
          label={cryptoCheckoutLabel}
          className="rounded-full bg-slate-950 px-5 text-white shadow-[0_12px_28px_rgba(2,6,23,0.32)] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        />
      }
    />
  );
}
