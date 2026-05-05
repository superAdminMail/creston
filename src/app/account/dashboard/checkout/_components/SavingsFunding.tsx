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
  const selectedAmount = !effectivePaymentMode
    ? (details.remainingToTargetAmount ?? chargeBasis)
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
      : "Pay now";

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
          className="rounded-full border border-slate-200/80 bg-slate-50/80 px-5 text-slate-700 shadow-sm hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
        />
      }
    />
  );
}
