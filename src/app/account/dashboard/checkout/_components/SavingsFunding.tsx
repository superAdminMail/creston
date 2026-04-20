import SavingsFundingClient from "./SavingsFundingClient";
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
    />
  );
}
