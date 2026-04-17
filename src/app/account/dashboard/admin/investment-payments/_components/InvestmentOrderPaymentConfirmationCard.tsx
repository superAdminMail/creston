"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import { confirmInvestmentOrderPayment } from "@/actions/admin/investment-payments/confirmInvestmentOrderPayment";

export default function InvestmentOrderConfirmationCard({
  order,
}: {
  order: {
    id: string;
    status: string;
    amount: number;
    amountPaid: number;
    remainingAmount: number;
    currency: string;
    paidAt: string | null;
    confirmedAt: string | null;
  };
}) {
  const [pending, startTransition] = useTransition();

  const canConfirm = order.status === "PAID";

  function handleConfirm() {
    startTransition(async () => {
      const result = await confirmInvestmentOrderPayment(order.id);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Final order confirmation</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Only fully paid orders should be confirmed. Confirmation activates the
          order and updates the investment account.
        </p>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Status
            </p>
            <p className="mt-2 font-semibold">
              {formatEnumLabel(order.status)}
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Paid
            </p>
            <p className="mt-2 font-semibold">
              {order.amountPaid.toLocaleString()} {order.currency}
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Remaining
            </p>
            <p className="mt-2 font-semibold">
              {order.remainingAmount.toLocaleString()} {order.currency}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleConfirm} disabled={!canConfirm || pending}>
            {pending ? "Confirming..." : "Confirm investment order"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
