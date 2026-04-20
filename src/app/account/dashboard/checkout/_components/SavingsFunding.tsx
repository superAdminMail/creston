import SavingsFundingClient from "./SavingsFundingClient";
import SavingsCryptoCheckoutButton from "./SavingsCryptoCheckoutButton";
import { getSavingsFundingDetails } from "../_lib/getSavingsFundingDetails";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";
import type { CheckoutPaymentMode } from "@/lib/types/payments/checkout.types";

export default async function SavingsFunding({
  savingsAccountId,
  fundingMethodType,
  paymentMode,
}: {
  savingsAccountId: string;
  fundingMethodType: CheckoutFundingMethodType | null;
  paymentMode: CheckoutPaymentMode | null;
}) {
  const details = await getSavingsFundingDetails(savingsAccountId);

  return (
    <SavingsFundingClient
      details={details}
      fundingMethodType={fundingMethodType}
      paymentMode={paymentMode}
      cryptoCheckoutButton={
        <SavingsCryptoCheckoutButton
          savingsAccountId={savingsAccountId}
          paymentMode={paymentMode}
          className="rounded-full bg-slate-950 px-5 text-white shadow-[0_12px_28px_rgba(2,6,23,0.32)] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        />
      }
    />
  );
}
