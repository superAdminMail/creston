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
    reference: string | null;
    bankAddress: string | null;
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
  const rows = [
    { label: "Bank", value: bankMethod.bankName },
    { label: "Account name", value: bankMethod.accountName },
    { label: "Reference", value: bankMethod.reference },
    { label: "Bank address", value: bankMethod.bankAddress },
    { label: "Account number", value: bankMethod.accountNumber },
    { label: "Bank code", value: bankMethod.bankCode },
  ].filter((row) => Boolean(row.value));

  return (
    <Card className="border-border/60 shadow-sm  bg-white/88  ">
      <CardHeader>
        <CardTitle className="text-lg">Bank transfer instructions</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Method
            </p>
            <p className="mt-2 font-semibold text-slate-300">
              {bankMethod.label}
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Amount
            </p>
            <p className="mt-2 font-semibold text-slate-300">
              {selectedAmount.toLocaleString()} {currency}
            </p>
          </div>

          {rows.map((row) => (
            <div
              key={row.label}
              className="rounded-2xl border border-border/60 p-4"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {row.label}
              </p>
              <p className="mt-2 font-semibold text-slate-300">{row.value}</p>
            </div>
          ))}
        </div>

        {bankMethod.instructions ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-slate-600/10 p-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.04]">
            {bankMethod.instructions}
          </div>
        ) : null}

        {bankMethod.notes ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-slate-600/10 p-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.04]">
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
