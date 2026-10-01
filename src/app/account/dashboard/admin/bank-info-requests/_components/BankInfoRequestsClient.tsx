"use client";

import { Building2, Inbox } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InvestmentBankInfoRequestItem } from "@/lib/types/payments/investmentPaymentReview.types";
import InvestmentBankInfoRequestForm from "../../investment-payments/_components/InvestmentBankInfoRequestForm";

type BankInfoRequestsClientProps = {
  bankInfoRequests: InvestmentBankInfoRequestItem[];
};

export default function BankInfoRequestsClient({
  bankInfoRequests,
}: BankInfoRequestsClientProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Card className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
        <CardHeader className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-sky-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-200">
                <Building2 className="h-3.5 w-3.5" />
                Bank Information
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                Bank Info Requests
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Review bank information requests from clients and respond with
                the appropriate transfer details.
              </p>
            </div>

            {bankInfoRequests.length > 0 ? (
              <Badge
                variant="secondary"
                className="shrink-0 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100"
              >
                {bankInfoRequests.length}
              </Badge>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">
          {bankInfoRequests.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/70 bg-slate-50/60 px-6 py-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <Inbox className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              </div>

              <h2 className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">
                No bank info requests
              </h2>

              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                There are currently no client requests waiting for bank
                information.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Pending requests
                  </p>

                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Respond to the following client requests.
                  </p>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {bankInfoRequests.length}{" "}
                  {bankInfoRequests.length === 1 ? "request" : "requests"}
                </p>
              </div>

              <div className="space-y-4">
                {bankInfoRequests.map((request) => (
                  <InvestmentBankInfoRequestForm
                    key={request.requestNotificationId}
                    request={request}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
