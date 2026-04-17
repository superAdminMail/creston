import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Payment = {
  id: string;
  type: string;
  status: string;
  claimedAmount: number;
  approvedAmount: number | null;
  currency: string;
  depositorName: string | null;
  transferReference: string | null;
  note: string | null;
  reviewNote: string | null;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  receipt: {
    id: string;
    url: string | null;
    fileName: string;
  } | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function OrderPaymentHistory({
  payments,
}: {
  payments: Payment[];
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Payment history</CardTitle>
      </CardHeader>

      <CardContent>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No payment submission has been made yet.
          </p>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-2xl border border-border/60 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {payment.claimedAmount.toLocaleString()}{" "}
                      {payment.currency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {formatDate(payment.submittedAt)}
                    </p>
                  </div>

                  <Badge variant="secondary">{payment.status}</Badge>
                </div>

                <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Depositor:</span>{" "}
                    {payment.depositorName ?? "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reference:</span>{" "}
                    {payment.transferReference ?? "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Approved:</span>{" "}
                    {payment.approvedAmount !== null
                      ? `${payment.approvedAmount.toLocaleString()} ${payment.currency}`
                      : "Pending review"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reviewed:</span>{" "}
                    {formatDate(payment.reviewedAt)}
                  </div>
                </div>

                {payment.note ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Note:</span>{" "}
                    {payment.note}
                  </p>
                ) : null}

                {payment.reviewNote ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Review note:
                    </span>{" "}
                    {payment.reviewNote}
                  </p>
                ) : null}

                {payment.rejectionReason ? (
                  <p className="mt-2 text-sm text-destructive">
                    <span className="font-medium">Rejection reason:</span>{" "}
                    {payment.rejectionReason}
                  </p>
                ) : null}

                {payment.receipt?.url ? (
                  <a
                    href={payment.receipt.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
                  >
                    View receipt
                  </a>
                ) : payment.receipt ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Receipt attached: {payment.receipt.fileName}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
