"use client";

import { useTransition } from "react";
import { Loader2, Split } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { startInvestmentOrderCryptoCheckout } from "@/actions/checkout/investments/startInvestmentOrderCryptoCheckout";

type StartPartialCryptoCheckoutButtonProps = {
  investmentOrderId: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export default function StartPartialCryptoCheckoutButton({
  investmentOrderId,
  disabled = false,
  className,
  children,
}: StartPartialCryptoCheckoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleStartPartialCheckout = () => {
    if (!investmentOrderId?.trim()) {
      toast.error("Missing investment order reference");
      return;
    }

    startTransition(async () => {
      try {
        const result = await startInvestmentOrderCryptoCheckout({
          investmentOrderId,
          usePartialPayment: true,
        });

        if (!result.success) {
          toast.error(
            result.error || "Unable to start partial crypto checkout",
          );
          return;
        }

        const invoiceUrl = result.data.invoiceUrl;

        if (!invoiceUrl) {
          toast.error("No BitPay checkout URL was returned");
          return;
        }

        toast.success("Redirecting to partial crypto checkout...");
        window.location.href = invoiceUrl;
      } catch (error) {
        console.error("Start partial crypto checkout failed:", error);
        toast.error("Unable to start partial crypto checkout");
      }
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleStartPartialCheckout}
      disabled={disabled || isPending}
      className={className}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Opening partial checkout...
        </>
      ) : (
        <>
          <Split className="mr-2 h-4 w-4" />
          {children ?? "Pay 50% with Crypto"}
        </>
      )}
    </Button>
  );
}
