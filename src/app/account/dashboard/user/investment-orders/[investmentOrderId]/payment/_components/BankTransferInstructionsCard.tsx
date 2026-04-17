"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  bankMethod: {
    id: string;
    label: string;
    bankName: string | null;
    bankCode: string | null;
    accountName: string | null;
    accountNumber: string | null;
    instructions: string | null;
    notes: string | null;
    currency: string;
  };
  selectedAmount: number;
  currency: string;
  onConfirmPaid: () => void;
};

export default function BankTransferInstructionsCard({
  bankMethod,
  selectedAmount,
  currency,
  onConfirmPaid,
}: Props) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Bank transfer instructions</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Method
            </p>
            <p className="mt-2 font-semibold">{bankMethod.label}</p>
          </div>

          <div className="rounded-2xl border border-border/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Payment amount
            </p>
            <p className="mt-2 font-semibold">
              {selectedAmount.toLocaleString()} {currency}
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Bank
            </p>
            <p className="mt-2 font-semibold">{bankMethod.bankName ?? "—"}</p>
          </div>

          <div className="rounded-2xl border border-border/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Account name
            </p>
            <p className="mt-2 font-semibold">
              {bankMethod.accountName ?? "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Account number
            </p>
            <p className="mt-2 font-semibold">
              {bankMethod.accountNumber ?? "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Bank code
            </p>
            <p className="mt-2 font-semibold">{bankMethod.bankCode ?? "—"}</p>
          </div>
        </div>

        {bankMethod.instructions ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
            {bankMethod.instructions}
          </div>
        ) : null}

        {bankMethod.notes ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
            {bankMethod.notes}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button onClick={onConfirmPaid}>I’ve made this payment</Button>
        </div>
      </CardContent>
    </Card>
  );
}
