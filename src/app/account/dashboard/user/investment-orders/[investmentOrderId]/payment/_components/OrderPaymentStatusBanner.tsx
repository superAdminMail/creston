import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InvestmentOrderPaymentDetails } from "@/lib/types/payments/investmentOrderPayment.types";

function getStatusMeta(status: string) {
  switch (status) {
    case "PARTIALLY_PAID":
      return {
        label: "Partially paid",
        title: "Partial payment received",
        description:
          "Your submitted payment(s) are being reviewed and your remaining balance is still outstanding.",
      };
    case "PAID":
      return {
        label: "Paid",
        title: "Full payment received",
        description:
          "Your full payment has been received and approved. Final account confirmation may still be pending.",
      };
    case "CONFIRMED":
      return {
        label: "Confirmed",
        title: "Investment confirmed",
        description:
          "Your investment has been confirmed successfully and is now active.",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        title: "Payment or order rejected",
        description:
          "This order was rejected. Please review your payment history or contact support for clarification.",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        title: "Order cancelled",
        description:
          "This payment order has been cancelled and can no longer accept new payment submissions.",
      };
    case "PENDING_PAYMENT":
    default:
      return {
        label: "Pending payment",
        title: "Awaiting payment",
        description:
          "Choose how much you want to pay, complete the transfer, then submit your proof of payment for review.",
      };
  }
}

export default function OrderPaymentStatusBanner({
  order,
}: {
  order: InvestmentOrderPaymentDetails;
}) {
  const meta = getStatusMeta(order.status);

  return (
    <Card className="border-border/60 bg-background/80 shadow-sm">
      <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Investment payment
          </p>
          <h1 className="text-xl font-semibold tracking-tight">{meta.title}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {meta.description}
          </p>
        </div>

        <Badge variant="secondary" className="h-fit rounded-full px-3 py-1">
          {meta.label}
        </Badge>
      </CardContent>
    </Card>
  );
}
