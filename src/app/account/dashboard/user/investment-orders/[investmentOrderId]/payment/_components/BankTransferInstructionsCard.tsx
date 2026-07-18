"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CopyableDetailRow } from "@/app/account/dashboard/checkout/_components/CopyableDetailRow";

type Props = {
  bankMethod: {
    id: string;
    label: string;
    providerName: string | null;
    bankName: string | null;
    bankCode: string | null;
    accountName: string | null;
    reference: string | null;
    bankAddress: string | null;
    accountNumber: string | null;
    iban: string | null;
    swiftCode: string | null;
    routingNumber: string | null;
    branchName: string | null;
    country: string | null;
    instructions: string | null;
    notes: string | null;
    cryptoAsset: string | null;
    cryptoNetwork: string | null;
    walletAddress: string | null;
    walletTag: string | null;
    currency: string;
  };
  selectedAmount: number;
  currency: string;
  actionLabel: string;
  actionDisabled?: boolean;
  onConfirmPaid: () => void;
};

export default function BankTransferInstructionsCard({
  bankMethod,
  selectedAmount,
  currency,
  actionLabel,
  actionDisabled = false,
  onConfirmPaid,
}: Props) {
  const rows = [
    { label: "Provider name", value: bankMethod.providerName },
    { label: "Bank", value: bankMethod.bankName },
    { label: "Account name", value: bankMethod.accountName },
    { label: "Reference", value: bankMethod.reference },
    { label: "Bank address", value: bankMethod.bankAddress },
    { label: "Account number", value: bankMethod.accountNumber },
    { label: "Bank code", value: bankMethod.bankCode },
    { label: "IBAN", value: bankMethod.iban },
    { label: "SWIFT code", value: bankMethod.swiftCode },
    { label: "Wire routing number", value: bankMethod.routingNumber },
    { label: "Branch name", value: bankMethod.branchName },
    { label: "Country", value: bankMethod.country },
    { label: "Crypto asset", value: bankMethod.cryptoAsset },
    { label: "Crypto network", value: bankMethod.cryptoNetwork },
    { label: "Wallet address", value: bankMethod.walletAddress },
    { label: "Wallet tag", value: bankMethod.walletTag },
  ].filter((row) => Boolean(row.value));

  return (
    <Card className="border-border/60 bg-white/90 shadow-sm dark:bg-white/[0.03]">
      <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
        <CardTitle className="text-lg">Bank transfer instructions</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Method
            </p>
            <p className="mt-2 font-semibold text-slate-950 dark:text-white">
              {bankMethod.label}
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Amount
            </p>
            <p className="mt-2 font-semibold text-slate-950 dark:text-white">
              {selectedAmount.toLocaleString()} {currency}
            </p>
          </div>

          {rows.map((row) => (
            <CopyableDetailRow
              key={row.label}
              label={row.label}
              value={row.value}
            />
          ))}
        </div>

        {bankMethod.instructions ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-slate-50/90 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            {bankMethod.instructions}
          </div>
        ) : null}

        {bankMethod.notes ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-slate-50/90 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            {bankMethod.notes}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button onClick={onConfirmPaid} disabled={actionDisabled}>
            {actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
