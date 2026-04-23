"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  RefreshCcw,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";

import { SuperAdminStatCard } from "../../_components/SuperAdminStatCard";
import type {
  SuperAdminFundingIntentsPageData,
  SuperAdminFundingIntentListItem,
} from "@/actions/super-admin/funding-intents/getSuperAdminFundingIntents";

type FundingIntentFilter = "ALL" | "FUNDED" | "PROCESSING" | "EXCEPTION";

type FundingIntentsClientProps = {
  initialData: SuperAdminFundingIntentsPageData;
};

function getStatusClasses(status: SuperAdminFundingIntentListItem["status"]) {
  switch (status) {
    case "FUNDED":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
    case "PROCESSING":
    case "AWAITING_PROVIDER_CONFIRMATION":
      return "border-blue-400/20 bg-blue-500/10 text-blue-300";
    case "REQUIRES_ACTION":
    case "PENDING":
      return "border-amber-400/20 bg-amber-500/10 text-amber-300";
    case "FAILED":
    case "EXPIRED":
    case "CANCELED":
      return "border-rose-400/20 bg-rose-500/10 text-rose-300";
    default:
      return "border-white/10 bg-white/[0.05] text-slate-300";
  }
}

function getFilterLabel(filter: FundingIntentFilter) {
  switch (filter) {
    case "FUNDED":
      return "Funded";
    case "PROCESSING":
      return "Processing";
    case "EXCEPTION":
      return "Exception";
    default:
      return "All";
  }
}

function matchesFilter(
  intent: SuperAdminFundingIntentListItem,
  filter: FundingIntentFilter,
) {
  if (filter === "ALL") return true;

  if (filter === "FUNDED") {
    return intent.status === "FUNDED";
  }

  if (filter === "PROCESSING") {
    return [
      "PENDING",
      "REQUIRES_ACTION",
      "PROCESSING",
      "AWAITING_PROVIDER_CONFIRMATION",
    ].includes(intent.status);
  }

  return ["FAILED", "EXPIRED", "CANCELED"].includes(intent.status);
}

function maskReference(reference: string | null | undefined) {
  if (!reference) return "—";
  if (reference.length <= 24) return reference;
  return `${reference.slice(0, 10)}...${reference.slice(-10)}`;
}

export function FundingIntentsClient({
  initialData,
}: FundingIntentsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<FundingIntentFilter>("ALL");

  const intents = useMemo(
    () => initialData.intents.filter((intent) => matchesFilter(intent, filter)),
    [filter, initialData.intents],
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050B1F]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-blue-500/12 blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_35%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-6">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-2xl">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-blue-200">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Funding Intents Operations</span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Crypto Funding Intents
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                View and manage your crypto funding intents.
              </p>
            </div>

            <div className="flex min-w-0 flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  startTransition(() => {
                    router.refresh();
                  });
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white hover:bg-white/[0.08] sm:w-auto"
              >
                <RefreshCcw
                  className={`h-4 w-4 shrink-0 ${isPending ? "animate-spin" : ""}`}
                />
                Refresh feed
              </button>
              <Link
                href="/account/dashboard/super-admin/system-health"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] sm:w-auto"
              >
                <ArrowUpRight className="h-4 w-4 shrink-0" />
                View Webhooks
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SuperAdminStatCard
              label="Total intents"
              value={initialData.totalIntentsCount}
              description="All tracked crypto funding sessions."
            />
            <SuperAdminStatCard
              label="Funded"
              value={initialData.fundedIntentsCount}
              description="Successfully completed and confirmed funding attempts."
            />
            <SuperAdminStatCard
              label="In progress"
              value={initialData.processingIntentsCount}
              description="Requires user or provider completion."
            />
            <SuperAdminStatCard
              label="Exceptions"
              value={initialData.exceptionIntentsCount}
              description="Expired, failed, or canceled flows needing review."
            />
          </div>

          <Card className="mt-8 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[rgba(15,23,42,0.72)] shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white">
                    Live funding queue
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-slate-400">
                    Paymento-linked funding records mapped to investment orders
                    and treasury payment traces.
                  </p>
                </div>

                <div className="flex min-w-0 flex-wrap gap-2">
                  {(["ALL", "FUNDED", "PROCESSING", "EXCEPTION"] as const).map(
                    (item) => {
                      const isActive = filter === item;

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setFilter(item)}
                          className={`rounded-full px-3 py-1.5 text-xs transition ${
                            isActive
                              ? "border border-blue-400/20 bg-blue-500/10 text-blue-300"
                              : "border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.06]"
                          }`}
                        >
                          {getFilterLabel(item)}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {intents.length ? (
                  intents.map((intent) => (
                    <Card
                      key={intent.id}
                      className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] transition hover:border-blue-400/20 hover:bg-white/[0.055]"
                    >
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                                <Wallet className="h-5 w-5 shrink-0 text-blue-300" />
                              </div>

                              <div className="min-w-0">
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                  <h3 className="text-base font-semibold text-white">
                                    {intent.userName}
                                  </h3>
                                  <span className="min-w-0 truncate text-sm text-slate-500">
                                    {intent.userEmail}
                                  </span>
                                  <span
                                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getStatusClasses(intent.status)}`}
                                  >
                                    {intent.statusLabel}
                                  </span>
                                </div>

                                <p className="mt-1 break-words text-sm text-slate-400">
                                  {intent.providerLabel} - {intent.assetLabel} -
                                  {intent.networkLabel}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                              <div className="rounded-2xl bg-[#0B132B]/80 p-3">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                  Fiat amount
                                </p>
                                <p className="mt-2 text-sm text-slate-200">
                                  {intent.fiatAmountLabel}
                                </p>
                              </div>

                              <div className="rounded-2xl bg-[#0B132B]/80 p-3">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                  Expected crypto
                                </p>
                                <p className="mt-2 text-sm text-slate-200">
                                  {intent.expectedCryptoAmountLabel}
                                </p>
                              </div>

                              <div className="rounded-2xl bg-[#0B132B]/80 p-3">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                  Received crypto
                                </p>
                                <p className="mt-2 text-sm text-slate-200">
                                  {intent.receivedCryptoAmountLabel ?? "—"}
                                </p>
                              </div>

                              <div className="rounded-2xl bg-[#0B132B]/80 p-3">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                  Created
                                </p>
                                <p className="mt-2 text-sm text-slate-200">
                                  {intent.createdAtLabel}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                  Destination reference
                                </p>
                                <p className="mt-2 break-words text-sm text-white">
                                  {intent.destinationLabel}
                                </p>
                                <p className="mt-1 break-all font-mono text-xs text-slate-400">
                                  {maskReference(intent.destinationReference)}
                                </p>
                                {intent.creditedFiatAmountLabel ? (
                                  <p className="mt-2 text-xs text-emerald-300">
                                    Credited fiat:{" "}
                                    {intent.creditedFiatAmountLabel}
                                  </p>
                                ) : null}
                              </div>

                              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                  Provider trace
                                </p>
                                <p className="mt-2 break-words text-sm text-white">
                                  Ref: {maskReference(intent.providerReference)}
                                </p>
                                <p className="mt-1 break-all text-xs text-slate-400">
                                  Session:{" "}
                                  {maskReference(intent.providerSessionId)}
                                </p>
                                <p className="mt-1 break-all text-xs text-slate-400">
                                  External ID:{" "}
                                  {maskReference(intent.providerExternalId)}
                                </p>
                                {intent.redirectUrl ? (
                                  <p className="mt-2 break-all text-xs text-slate-500">
                                    Redirect: {intent.redirectUrl}
                                  </p>
                                ) : null}
                              </div>
                            </div>

                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                  Investment order
                                </p>
                                <p className="mt-2 text-sm text-white">
                                  {intent.investmentOrderStatusLabel} -{" "}
                                  {intent.investmentOrderPaymentMethodTypeLabel}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  Order: {intent.investmentOrderId}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  Amount: {intent.investmentOrderAmountLabel}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  Paid: {intent.investmentOrderAmountPaidLabel}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                  Lifecycle
                                </p>
                                <p className="mt-2 text-sm text-white">
                                  Funded: {intent.fundedAtLabel}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  Failed: {intent.failedAtLabel}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  Canceled: {intent.canceledAtLabel}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex w-full shrink-0 flex-wrap gap-2 overflow-hidden xl:w-[220px] xl:flex-col">
                            <Link
                              href={`/account/dashboard/super-admin/investment-orders/${intent.investmentOrderId}`}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white hover:bg-white/[0.08]"
                            >
                              <ExternalLink className="h-4 w-4 shrink-0" />
                              View details
                            </Link>

                            <button
                              type="button"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white hover:bg-white/[0.08]"
                            >
                              <CheckCircle2 className="h-4 w-4 shrink-0" />
                              Mark reviewed
                            </button>

                            <button
                              type="button"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white hover:bg-white/[0.08]"
                            >
                              <Clock3 className="h-4 w-4 shrink-0" />
                              Check provider
                            </button>

                            <button
                              type="button"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/15 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300 hover:bg-rose-500/15"
                            >
                              <XCircle className="h-4 w-4 shrink-0" />
                              Flag issue
                            </button>
                          </div>
                        </div>

                        {intent.fundedAtLabel !== "—" ? (
                          <div className="mt-4 rounded-2xl border border-emerald-400/10 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
                            Funded at {intent.fundedAtLabel}
                          </div>
                        ) : intent.failedAtLabel !== "—" ? (
                          <div className="mt-4 rounded-2xl border border-rose-400/10 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
                            Failed at {intent.failedAtLabel}
                          </div>
                        ) : intent.canceledAtLabel !== "—" ? (
                          <div className="mt-4 rounded-2xl border border-amber-400/10 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
                            Canceled at {intent.canceledAtLabel}
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6 text-sm text-slate-400">
                    No funding intents match the selected filter.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
