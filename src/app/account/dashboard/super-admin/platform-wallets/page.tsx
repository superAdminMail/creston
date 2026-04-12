"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Pencil,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";

type PlatformWalletItem = {
  id: string;
  label: string;
  asset: "BTC" | "ETH";
  network: "BITCOIN" | "ETHEREUM";
  address: string;
  isActive: boolean;
  isDefault: boolean;
  notes?: string;
  createdAt: string;
};

const platformWallets: PlatformWalletItem[] = [
  {
    id: "pw_1",
    label: "Primary Bitcoin Treasury",
    asset: "BTC",
    network: "BITCOIN",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    isActive: true,
    isDefault: true,
    notes: "Default destination wallet for Bitcoin funding intents.",
    createdAt: "2026-04-02T10:15:00.000Z",
  },
  {
    id: "pw_2",
    label: "Ethereum Main Settlement",
    asset: "ETH",
    network: "ETHEREUM",
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    isActive: true,
    isDefault: true,
    notes: "Primary Ethereum settlement wallet for hosted checkout.",
    createdAt: "2026-04-04T14:05:00.000Z",
  },
  {
    id: "pw_3",
    label: "Bitcoin Backup Wallet",
    asset: "BTC",
    network: "BITCOIN",
    address: "bc1pr5u8n8x0examplebackupwallet9k2f3m1d7q4y",
    isActive: false,
    isDefault: false,
    notes: "Reserved for failover and operational migration.",
    createdAt: "2026-04-07T09:30:00.000Z",
  },
];

function maskAddress(address: string) {
  if (address.length <= 18) return address;
  return `${address.slice(0, 10)}••••${address.slice(-10)}`;
}

function formatNetwork(network: PlatformWalletItem["network"]) {
  return network === "BITCOIN" ? "Bitcoin" : "Ethereum";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
    </div>
  );
}

export default function PlatformWalletsAdminPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = platformWallets.length;
    const active = platformWallets.filter((wallet) => wallet.isActive).length;
    const defaults = platformWallets.filter(
      (wallet) => wallet.isDefault,
    ).length;

    return { total, active, defaults };
  }, []);

  async function handleCopy(id: string, address: string) {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#050B1F]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-blue-500/12 blur-3xl" />
        <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_35%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-blue-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Treasury Configuration
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Platform Wallets
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Manage the platform-controlled crypto destination wallets used
                for funding flows, treasury routing, and operational settlement.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]">
                <ArrowUpRight className="h-4 w-4" />
                View Funding Activity
              </button>

              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] transition hover:opacity-95">
                <Plus className="h-4 w-4" />
                Add Platform Wallet
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <StatCard
              label="Total Wallets"
              value={String(stats.total)}
              helper="Configured treasury destinations across supported assets."
            />
            <StatCard
              label="Active Wallets"
              value={String(stats.active)}
              helper="Wallets currently eligible for platform funding operations."
            />
            <StatCard
              label="Default Wallets"
              value={String(stats.defaults)}
              helper="Primary addresses selected per supported asset/network."
            />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Configured wallets
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Each wallet should be treated as a platform treasury
                    destination.
                  </p>
                </div>

                <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300 sm:block">
                  Admin / Super Admin
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {platformWallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 transition hover:border-blue-400/20 hover:bg-white/[0.055]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                            <Wallet className="h-5 w-5 text-blue-300" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold text-white">
                                {wallet.label}
                              </h3>

                              {wallet.isDefault && (
                                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                                  Default
                                </span>
                              )}

                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                  wallet.isActive
                                    ? "border border-blue-400/20 bg-blue-500/10 text-blue-300"
                                    : "border border-white/10 bg-white/[0.06] text-slate-400"
                                }`}
                              >
                                {wallet.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-400">
                              {wallet.asset} • {formatNetwork(wallet.network)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-[#0B132B]/80 p-3">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                              Wallet address
                            </p>
                            <p className="mt-2 break-all font-mono text-sm text-slate-200">
                              {maskAddress(wallet.address)}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-[#0B132B]/80 p-3">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                              Added
                            </p>
                            <p className="mt-2 text-sm text-slate-200">
                              {formatDate(wallet.createdAt)}
                            </p>
                          </div>
                        </div>

                        {wallet.notes ? (
                          <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                              Notes
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                              {wallet.notes}
                            </p>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2 lg:w-[210px] lg:flex-col">
                        <button
                          onClick={() => handleCopy(wallet.id, wallet.address)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.08]"
                        >
                          <Copy className="h-4 w-4" />
                          {copiedId === wallet.id ? "Copied" : "Copy"}
                        </button>

                        <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.08]">
                          <CheckCircle2 className="h-4 w-4" />
                          Set default
                        </button>

                        <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.08]">
                          <Pencil className="h-4 w-4" />
                          Edit wallet
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-5">
                <h2 className="text-lg font-semibold text-white">
                  Add platform wallet
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Configure a new treasury destination for supported crypto
                  funding.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Label
                    </label>
                    <input
                      value="Ethereum Reserve Wallet"
                      readOnly
                      className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Asset
                      </label>
                      <input
                        value="ETH"
                        readOnly
                        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Network
                      </label>
                      <input
                        value="ETHEREUM"
                        readOnly
                        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Wallet address
                    </label>
                    <textarea
                      value="0x8ba1f109551bD432803012645Ac136ddd64DBA72"
                      readOnly
                      rows={4}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Notes
                    </label>
                    <textarea
                      value="Reserved for Ethereum funding expansion and provider failover routing."
                      readOnly
                      rows={3}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Set as default
                      </p>
                      <p className="text-xs text-slate-400">
                        Make this the primary wallet for the selected
                        asset/network.
                      </p>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-blue-500/80 p-1">
                      <div className="ml-auto h-4 w-4 rounded-full bg-white" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Activate wallet
                      </p>
                      <p className="text-xs text-slate-400">
                        Enable this wallet for operational funding use.
                      </p>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-blue-500/80 p-1">
                      <div className="ml-auto h-4 w-4 rounded-full bg-white" />
                    </div>
                  </div>

                  <button className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.32)] transition hover:opacity-95">
                    Save platform wallet
                  </button>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-base font-semibold text-white">
                  Operational guidance
                </h3>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                  <p>
                    Use one default wallet per asset/network combination to
                    avoid provider routing ambiguity.
                  </p>
                  <p>
                    Keep backup wallets inactive until they are operationally
                    ready for settlement or failover.
                  </p>
                  <p>
                    Changes here should be audited because these addresses
                    control treasury-bound funding destinations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
