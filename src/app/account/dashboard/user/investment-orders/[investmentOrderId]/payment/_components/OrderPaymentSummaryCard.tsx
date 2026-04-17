import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import { InvestmentOrderPaymentDetails } from "@/lib/types/payments/investmentOrderPayment.types";

export default function OrderPaymentSummaryCard({
  order,
}: {
  order: InvestmentOrderPaymentDetails;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Order summary</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border/60 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Plan
          </p>
          <p className="mt-2 text-base font-semibold">{order.plan.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatEnumLabel(order.plan.period)}
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Tier
          </p>
          <p className="mt-2 text-base font-semibold">
            {formatEnumLabel(order.tier.level)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            ROI {order.tier.roiPercent}%
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Total order
          </p>
          <p className="mt-2 text-base font-semibold">{order.amountLabel}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Approved paid: {order.amountPaidLabel}
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Remaining
          </p>
          <p className="mt-2 text-base font-semibold">
            {order.remainingAmountLabel}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Currency: {order.currency}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
