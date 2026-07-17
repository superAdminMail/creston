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
    <Card className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
      <CardHeader className="space-y-2 px-4 pt-5 sm:px-6 sm:pt-6">
        <CardTitle className="text-lg text-slate-950 dark:text-white">
          Final order confirmation
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-5 sm:px-6 sm:pb-6">
        <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Only fully paid orders should be confirmed. Confirmation activates the
          order and updates the investment account.
        </p>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-border/60 bg-white/80 p-4 shadow-sm dark:bg-white/[0.04]">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Status
            </p>
            <p className="mt-2 font-semibold text-slate-950 dark:text-white">
              {formatEnumLabel(order.status)}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-border/60 bg-white/80 p-4 shadow-sm dark:bg-white/[0.04]">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Paid
            </p>
            <p className="mt-2 font-semibold text-slate-950 dark:text-white">
              {order.amountPaid.toLocaleString()} {order.currency}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-border/60 bg-white/80 p-4 shadow-sm dark:bg-white/[0.04]">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Remaining
            </p>
            <p className="mt-2 font-semibold text-slate-950 dark:text-white">
              {order.remainingAmount.toLocaleString()} {order.currency}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || pending}
            className="rounded-2xl px-4 py-2.5 text-sm font-medium"
          >
            {pending ? "Confirming..." : "Confirm order payment"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
