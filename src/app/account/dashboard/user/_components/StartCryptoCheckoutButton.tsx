"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { startInvestmentOrderCryptoCheckout } from "@/actions/checkout/investments/startInvestmentOrderCryptoCheckout";

type StartCryptoCheckoutButtonProps = {
  investmentOrderId: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export default function StartCryptoCheckoutButton({
  investmentOrderId,
  disabled = false,
  className,
  children,
}: StartCryptoCheckoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleStartCheckout = () => {
    if (!investmentOrderId) {
      toast.error("Missing investment order reference");
      return;
    }

    startTransition(async () => {
      try {
        const result = await startInvestmentOrderCryptoCheckout({
          investmentOrderId,
        });

        if (!result.success) {
          toast.error(result.error || "Unable to start crypto checkout");
          return;
        }

        const invoiceUrl = result.data.invoiceUrl;

        if (!invoiceUrl) {
          toast.error("No BitPay checkout URL was returned");
          return;
        }

        toast.success("Redirecting to crypto checkout...");

        window.location.href = invoiceUrl;
      } catch (error) {
        console.error("Start crypto checkout failed:", error);
        toast.error("Unable to start crypto checkout");
      }
    });
  };

  return (
    <Button
      type="button"
      onClick={handleStartCheckout}
      disabled={disabled || isPending}
      className={className}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Opening checkout...
        </>
      ) : (
        (children ?? "Pay with Crypto")
      )}
    </Button>
  );
}
