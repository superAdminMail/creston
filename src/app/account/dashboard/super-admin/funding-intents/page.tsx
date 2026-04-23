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

import { SuperAdminStatCard } from "../_components/SuperAdminStatCard";

type FundingIntentStatus =
  | "PENDING"
  | "REQUIRES_ACTION"
  | "PROCESSING"
  | "AWAITING_PROVIDER_CONFIRMATION"
  | "FUNDED"
  | "FAILED"
  | "EXPIRED"
  | "CANCELED";

type FundingIntentItem = {
  id: string;
  userName: string;
  userEmail: string;
  provider: "TRANSAK";
  asset: "BTC" | "ETH";
  network: "BITCOIN" | "ETHEREUM";
  fiatCurrency: string;
  fiatAmount: string;
  expectedCryptoAmount: string;
  receivedCryptoAmount?: string;
  status: FundingIntentStatus;
  destinationWalletLabel: string;
  destinationWalletAddress: string;
  providerReference?: string;
  providerSessionId?: string;
  redirectUrl?: string;
  createdAt: string;
  fundedAt?: string;
};

const fundingIntents: FundingIntentItem[] = [
  {
    id: "fi_001",
    userName: "Michael N.",
    userEmail: "michael@example.com",
      provider: "TRANSAK",
    asset: "BTC",
    network: "BITCOIN",
    fiatCurrency: "USD",
    fiatAmount: "2,500.00",
    expectedCryptoAmount: "0.03852100 BTC",
    receivedCryptoAmount: "0.03852100 BTC",
    status: "FUNDED",
    destinationWalletLabel: "Primary Bitcoin Treasury",
    destinationWalletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    providerReference: "BP-INV-290184",
      providerSessionId: "transak_session_9dk21",
      redirectUrl: "https://checkout.example.com/transak/fi_001",
    createdAt: "2026-04-11T09:14:00.000Z",
    fundedAt: "2026-04-11T09:28:00.000Z",
  },
  {
    id: "fi_002",
    userName: "Sarah K.",
    userEmail: "sarah@example.com",
    provider: "TRANSAK",
    asset: "ETH",
    network: "ETHEREUM",
    fiatCurrency: "USD",
    fiatAmount: "1,200.00",
    expectedCryptoAmount: "0.64820000 ETH",
    status: "PROCESSING",
    destinationWalletLabel: "Ethereum Main Settlement",
    destinationWalletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    providerReference: "TSK-441802",
    providerSessionId: "transak_session_210f",
    redirectUrl: "https://checkout.example.com/transak/fi_002",
    createdAt: "2026-04-11T12:42:00.000Z",
  },
  {
    id: "fi_003",
    userName: "David A.",
    userEmail: "david@example.com",
      provider: "TRANSAK",
    asset: "BTC",
    network: "BITCOIN",
    fiatCurrency: "USD",
    fiatAmount: "800.00",
    expectedCryptoAmount: "0.01200420 BTC",
    status: "EXPIRED",
    destinationWalletLabel: "Primary Bitcoin Treasury",
    destinationWalletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    providerReference: "BP-INV-290322",
      providerSessionId: "transak_session_0af4",
      redirectUrl: "https://checkout.example.com/transak/fi_003",
    createdAt: "2026-04-10T16:04:00.000Z",
  },
  {
    id: "fi_004",
    userName: "Amara O.",
    userEmail: "amara@example.com",
    provider: "TRANSAK",
    asset: "ETH",
    network: "ETHEREUM",
    fiatCurrency: "USD",
    fiatAmount: "3,000.00",
    expectedCryptoAmount: "1.61500000 ETH",
    status: "REQUIRES_ACTION",
    destinationWalletLabel: "Ethereum Main Settlement",
    destinationWalletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    providerReference: "TSK-441990",
    providerSessionId: "transak_session_88da",
    redirectUrl: "https://checkout.example.com/transak/fi_004",
    createdAt: "2026-04-12T08:20:00.000Z",
  },
];

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function maskAddress(address: string) {
  if (address.length < 18) return address;
  return `${address.slice(0, 10)}••••${address.slice(-10)}`;
}

function getStatusClasses(status: FundingIntentStatus) {
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

export default function FundingIntentPage() {
  const total = fundingIntents.length;
  const funded = fundingIntents.filter(
    (item) => item.status === "FUNDED",
  ).length;
  const processing = fundingIntents.filter((item) =>
    [
      "PROCESSING",
      "AWAITING_PROVIDER_CONFIRMATION",
      "REQUIRES_ACTION",
      "PENDING",
    ].includes(item.status),
  ).length;
  const exceptions = fundingIntents.filter((item) =>
    ["FAILED", "EXPIRED", "CANCELED"].includes(item.status),
  ).length;

  return (
    <div className="min-h-screen bg-[#050B1F]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-blue-500/12 blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_35%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-blue-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Funding Operations
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Crypto Funding Intents
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Monitor crypto funding attempts across providers, destination
                wallets, user sessions, and treasury-bound deposit lifecycle
                events.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white hover:bg-white/[0.08]">
                <RefreshCcw className="h-4 w-4" />
                Refresh feed
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)]">
                <ArrowUpRight className="h-4 w-4" />
                View Webhooks
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SuperAdminStatCard
              label="Total intents"
              value={total}
              description="All tracked crypto funding sessions."
            />
            <SuperAdminStatCard
              label="Funded"
              value={funded}
              description="Successfully completed and confirmed funding attempts."
            />
            <SuperAdminStatCard
              label="In progress"
              value={processing}
              description="Requires user or provider completion."
            />
            <SuperAdminStatCard
              label="Exceptions"
              value={exceptions}
              description="Expired, failed, or canceled flows needing review."
            />
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-4 sm:p-5">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Live funding queue
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Provider-linked funding records mapped to platform treasury
                  wallets.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {["All", "Funded", "Processing", "Exception"].map((filter) => (
                  <button
                    key={filter}
                    className={`rounded-full px-3 py-1.5 text-xs ${
                      filter === "All"
                        ? "border border-blue-400/20 bg-blue-500/10 text-blue-300"
                        : "border border-white/10 bg-white/[0.04] text-slate-300"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {fundingIntents.map((intent) => (
                <div
                  key={intent.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 transition hover:border-blue-400/20 hover:bg-white/[0.055]"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                          <Wallet className="h-5 w-5 text-blue-300" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-white">
                              {intent.userName}
                            </h3>
                            <span className="text-sm text-slate-500">
                              {intent.userEmail}
                            </span>
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getStatusClasses(intent.status)}`}
                            >
                              {intent.status.replaceAll("_", " ")}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-400">
                            {intent.provider} • {intent.asset} •{" "}
                            {intent.network}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl bg-[#0B132B]/80 p-3">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                            Fiat amount
                          </p>
                          <p className="mt-2 text-sm text-slate-200">
                            {intent.fiatCurrency} {intent.fiatAmount}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#0B132B]/80 p-3">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                            Expected crypto
                          </p>
                          <p className="mt-2 text-sm text-slate-200">
                            {intent.expectedCryptoAmount}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#0B132B]/80 p-3">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                            Received crypto
                          </p>
                          <p className="mt-2 text-sm text-slate-200">
                            {intent.receivedCryptoAmount ?? "—"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#0B132B]/80 p-3">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                            Created
                          </p>
                          <p className="mt-2 text-sm text-slate-200">
                            {formatDate(intent.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                            Destination wallet
                          </p>
                          <p className="mt-2 text-sm text-white">
                            {intent.destinationWalletLabel}
                          </p>
                          <p className="mt-1 font-mono text-xs text-slate-400">
                            {maskAddress(intent.destinationWalletAddress)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                            Provider trace
                          </p>
                          <p className="mt-2 text-sm text-white">
                            Ref: {intent.providerReference ?? "—"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Session: {intent.providerSessionId ?? "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 xl:w-[220px] xl:flex-col">
                      <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white hover:bg-white/[0.08]">
                        <ExternalLink className="h-4 w-4" />
                        View details
                      </button>

                      <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white hover:bg-white/[0.08]">
                        <CheckCircle2 className="h-4 w-4" />
                        Mark reviewed
                      </button>

                      <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white hover:bg-white/[0.08]">
                        <Clock3 className="h-4 w-4" />
                        Check provider
                      </button>

                      <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/15 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300 hover:bg-rose-500/15">
                        <XCircle className="h-4 w-4" />
                        Flag issue
                      </button>
                    </div>
                  </div>

                  {intent.fundedAt ? (
                    <div className="mt-4 rounded-2xl border border-emerald-400/10 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
                      Funded at {formatDate(intent.fundedAt)}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
