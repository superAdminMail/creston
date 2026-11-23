"use client";

import { ArrowDownToLine, Landmark, ShieldCheck } from "lucide-react";

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
    accountType: string | null;
    recipientType: string | null;
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
    { label: "Account type", value: bankMethod.accountType },
    { label: "Recipient type", value: bankMethod.recipientType },
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
    <Card className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-slate-950/60">
      <CardHeader className="border-b border-slate-100 p-4 dark:border-white/10 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
            <Landmark className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold text-slate-950 dark:text-white sm:text-lg">
              Bank transfer details
            </CardTitle>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Follow these details carefully to complete your transfer.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-4 sm:p-6">
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-400/20 dark:bg-sky-400/[0.07]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-800 dark:text-sky-300">
              Amount to transfer
            </p>
            <ArrowDownToLine className="h-4 w-4 text-sky-700 dark:text-sky-300" />
          </div>

          <p className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            {selectedAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-base font-semibold text-slate-600 dark:text-slate-300">
              {currency}
            </span>
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
            Transfer the exact amount shown above using the account details
            below.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Receiving account
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {bankMethod.label}
            </p>
          </div>

          <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
            Payment details
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <CopyableDetailRow
              key={row.label}
              label={row.label}
              value={row.value}
            />
          ))}
        </div>

        {bankMethod.instructions ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035]">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Transfer instructions
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-400">
              {bankMethod.instructions}
            </p>
          </div>
        ) : null}

        {bankMethod.notes ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-400/[0.06]">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Important notice
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-amber-900 dark:text-amber-100">
              {bankMethod.notes}
            </p>
          </div>
        ) : null}

        <div className="space-y-3 border-t border-slate-100 pt-5 dark:border-white/10">
          <Button
            type="button"
            onClick={onConfirmPaid}
            disabled={actionDisabled}
            className="h-12 w-full rounded-xl bg-slate-950 font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400"
          >
            {actionLabel}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Your payment will be reviewed before it is credited.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
