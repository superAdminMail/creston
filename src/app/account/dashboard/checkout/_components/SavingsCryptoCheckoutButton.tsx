"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createSavingsFundingCryptoCheckout } from "@/actions/savings/createSavingsFundingCryptoCheckout";

type Props = {
  savingsAccountId: string;
  label?: string;
  className?: string;
};

export default function SavingsCryptoCheckoutButton({
  savingsAccountId,
  label = "Pay with crypto",
  className,
}: Props) {
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (pending) return;

    setPending(true);
    try {
      const result = await createSavingsFundingCryptoCheckout({
        savingsAccountId,
        paymentMode: "FULL",
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      window.location.assign(result.redirectUrl);
      } catch (error) {
        console.error("SavingsCryptoCheckoutButton error:", error);
        toast.error("Unable to open crypto checkout right now.");
      } finally {
        setPending(false);
      }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </span>
      ) : (
        label
      )}
    </Button>
  );
}
