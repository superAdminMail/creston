"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { CheckoutPaymentMode } from "@/lib/types/payments/checkout.types";
import { createSavingsFundingCryptoCheckout } from "@/actions/savings/createSavingsFundingCryptoCheckout";

type Props = {
  savingsAccountId: string;
  paymentMode: CheckoutPaymentMode | null;
  className?: string;
};

export default function SavingsCryptoCheckoutButton({
  savingsAccountId,
  paymentMode,
  className,
}: Props) {
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (!paymentMode) {
      toast.error("Choose a payment mode first.");
      return;
    }

    if (pending) return;

    setPending(true);
    try {
      const result = await createSavingsFundingCryptoCheckout({
        savingsAccountId,
        paymentMode,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      window.location.assign(result.redirectUrl);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to open crypto checkout.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={pending || !paymentMode}
      aria-busy={pending}
      className={className}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </span>
      ) : (
        "Pay with crypto"
      )}
    </Button>
  );
}
