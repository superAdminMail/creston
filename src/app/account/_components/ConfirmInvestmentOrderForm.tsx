"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { confirmInvestmentOrder } from "@/actions/admin/investment-order/confirmInvestmentOrder";

export function ConfirmInvestmentOrderForm({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("orderId", orderId);

        const result = await confirmInvestmentOrder(
          { status: "idle" },
          formData,
        );

        if (result.status === "error") {
          toast.error(result.message);
          return;
        }

        toast.success("Payment confirmed.");
        window.location.reload();
      } catch (error) {
        toast.error("Something went wrong.");
      }
    });
  };

  return (
    <button
      onClick={handleConfirm}
      disabled={isPending}
      className="btn-primary rounded-xl px-4 py-2"
    >
      {isPending ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Confirming...
        </span>
      ) : (
        "Confirm Payment"
      )}
    </button>
  );
}
