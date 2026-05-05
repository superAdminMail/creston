"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Props = {
  investmentOrderId: string;
  label?: string;
  className?: string;
};

export default function InvestmentOrderCryptoCheckoutButton({
  investmentOrderId,
  label = "Pay with Paymento",
  className,
}: Props) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;

    setPending(true);

    try {
      const response = await fetch("/api/payments/paymento/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          investmentOrderId,
          paymentMode: "FULL",
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | { success?: boolean; redirectUrl?: string; error?: string }
        | null;

      if (!response.ok || !result?.success || !result.redirectUrl) {
        toast.error(result?.error ?? "Unable to open Paymento checkout.");
        return;
      }

      window.location.assign(result.redirectUrl);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to open Paymento checkout.",
      );
    } finally {
      setPending(false);
    }
  }

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
