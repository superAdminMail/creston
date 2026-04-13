"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Copy,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";

import { deletePlatformPaymentMethod } from "@/actions/admin/platform-wallets/deletePlatformWallet";
import { setDefaultPlatformPaymentMethod } from "@/actions/admin/platform-wallets/setDefaultPlatformPaymentMethod";
import {
  initialPlatformPaymentMethodFormState,
} from "@/actions/admin/platform-wallets/platformWalletForm.state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PlatformWalletForm, { type PlatformPaymentMethodFormDefaults } from "./PlatformWalletForm";

export type PlatformPaymentMethodItem = PlatformPaymentMethodFormDefaults & {
  id: string;
  type: "BANK_INFO" | "WALLET_ADDRESS";
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  sortOrder: number;
  verificationStatus: "UNVERIFIED" | "VERIFIED" | "SUSPENDED";
};

type PlatformWalletsClientProps = {
  roleLabel: string;
  wallets: PlatformPaymentMethodItem[];
};

function maskSensitiveValue(value?: string | null) {
  if (!value) {
    return "Not provided";
  }

  if (value.length <= 12) {
    return `${value.slice(0, 3)}***${value.slice(-3)}`;
  }

  return `${value.slice(0, 6)}***${value.slice(-4)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatType(type: PlatformPaymentMethodItem["type"]) {
  return type === "BANK_INFO" ? "Bank info" : "Crypto wallet";
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
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-5">
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 sm:text-xs">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:mt-3 sm:text-3xl">
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-400 sm:text-sm">
        {helper}
      </p>
    </div>
  );
}

function SetDefaultPaymentMethodForm({
  wallet,
}: {
  wallet: PlatformPaymentMethodItem;
}) {
  return (
    <form action={setDefaultPlatformPaymentMethod}>
      <input
        type="hidden"
        name="platformPaymentMethodId"
        value={wallet.id}
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.08]"
      >
        Set default
      </button>
    </form>
  );
}

function PaymentMethodCard({
  method,
  onEdit,
}: {
  method: PlatformPaymentMethodItem;
  onEdit: (method: PlatformPaymentMethodItem) => void;
}) {
  const [removeOpen, setRemoveOpen] = useState(false);
  const router = useRouter();
  const [deleteState, deleteAction, deletePending] = useActionState(
    deletePlatformPaymentMethod,
    initialPlatformPaymentMethodFormState,
  );

  useEffect(() => {
    if (deleteState.status === "success") {
      setRemoveOpen(false);
      router.refresh();
      toast.success("Platform payment method removed.");
    }
  }, [deleteState.status, router]);

  return (
    <div className="relative rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 transition hover:border-blue-400/20 hover:bg-white/[0.055]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
              <WalletCards className="h-5 w-5 text-blue-300" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-white">
                  {method.label}
                </h3>

                {method.isDefault && (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                    Default
                  </span>
                )}

                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    method.isActive
                      ? "border border-blue-400/20 bg-blue-500/10 text-blue-300"
                      : "border border-white/10 bg-white/[0.06] text-slate-400"
                  }`}
                >
                  {method.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-400">
                {formatType(method.type)} • {method.currency}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#0B132B]/80 p-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Details
              </p>
              {method.type === "BANK_INFO" ? (
                <div className="mt-2 space-y-1 text-sm text-slate-200">
                  <p>{method.bankName ?? "Bank not provided"}</p>
                  <p className="text-slate-400">
                    {method.accountName ?? "Account name not provided"}
                  </p>
                </div>
              ) : (
                <div className="mt-2 space-y-1 text-sm text-slate-200">
                  <p>{method.cryptoAsset ?? "Asset not provided"}</p>
                  <p className="text-slate-400">
                    {method.cryptoNetwork ?? "Network not provided"}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-[#0B132B]/80 p-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Added
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {formatDate(method.createdAt)}
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {method.type === "BANK_INFO" ? (
              <>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                    Account Number
                  </p>
                  <p className="mt-2 font-mono text-sm text-slate-200">
                    {maskSensitiveValue(method.accountNumber)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                    Branch
                  </p>
                  <p className="mt-2 text-sm text-slate-200">
                    {method.branchName ?? "Not provided"}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                    Wallet Address
                  </p>
                  <p className="mt-2 break-all font-mono text-sm text-slate-200">
                    {maskSensitiveValue(method.walletAddress)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                    Wallet Tag
                  </p>
                  <p className="mt-2 text-sm text-slate-200">
                    {method.walletTag ?? "Not provided"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 lg:w-[220px] lg:flex-col">
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  method.type === "BANK_INFO"
                    ? method.accountNumber ?? ""
                    : method.walletAddress ?? "",
                );
                toast.success("Copied.");
              } catch {
                toast.error("Unable to copy.");
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.08]"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>

          <SetDefaultPaymentMethodForm wallet={method} />

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.08]"
            onClick={() => onEdit(method)}
          >
            <Pencil className="h-4 w-4" />
            Edit method
          </button>

          <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
            <AlertDialogTrigger asChild>
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-200 transition hover:bg-red-500/15">
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-white/10 bg-[#050B1F] text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Remove this payment method?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  This action will permanently remove {method.label}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <form action={deleteAction}>
                <input
                  type="hidden"
                  name="platformPaymentMethodId"
                  value={method.id}
                />
                {deleteState.status === "error" && deleteState.message ? (
                  <p className="sr-only">{deleteState.message}</p>
                ) : null}
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    type="submit"
                    disabled={deletePending}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    {deletePending ? "Removing..." : "Remove wallet"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

export default function PlatformWalletsClient({
  roleLabel,
  wallets,
}: PlatformWalletsClientProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editWallet, setEditWallet] = useState<PlatformPaymentMethodItem | null>(
    null,
  );

  const stats = useMemo(() => {
    const total = wallets.length;
    const active = wallets.filter((wallet) => wallet.isActive).length;
    const defaults = wallets.filter((wallet) => wallet.isDefault).length;

    return { total, active, defaults };
  }, [wallets]);

  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] bg-[#050B1F]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-blue-500/12 blur-3xl" />
        <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_35%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-blue-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Treasury Configuration
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Platform Payment Methods
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Manage the platform-controlled bank details and crypto wallets
                used for funding flows, treasury routing, and operational
                settlement.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]">
                <ArrowUpRight className="h-4 w-4" />
                View Funding Activity
              </button>

              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] transition hover:opacity-95">
                    <Plus className="h-4 w-4" />
                    Add Payment Method
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl rounded-[1.75rem] border border-white/10 bg-[#050B1F] p-0 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                  <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-2xl font-semibold tracking-tight text-white">
                      Add platform payment method
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-400">
                      Configure a new treasury destination for bank or crypto
                      funding.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="px-6 pb-6 pt-4">
                    <PlatformWalletForm onSuccess={() => setAddOpen(false)} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Total Methods"
              value={String(stats.total)}
              helper="Configured bank details and crypto destinations."
            />
            <StatCard
              label="Active Methods"
              value={String(stats.active)}
              helper="Methods currently eligible for funding operations."
            />
            <StatCard
              label="Default Methods"
              value={String(stats.defaults)}
              helper="Primary methods selected for routing."
            />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Configured payment methods
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Each method should be treated as a platform treasury
                    destination.
                  </p>
                </div>

                <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300 sm:block">
                  {roleLabel}
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {wallets.map((wallet) => (
                  <PaymentMethodCard
                    key={wallet.id}
                    method={wallet}
                    onEdit={(method) => setEditWallet(method)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-5">
                <h2 className="text-lg font-semibold text-white">
                  Add payment method
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Configure a new treasury destination for supported bank or
                  crypto flows.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-base font-semibold text-white">
                  Operational guidance
                </h3>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                  <p>
                    Keep a single default method per route to avoid treasury
                    ambiguity.
                  </p>
                  <p>
                    Keep backup methods inactive until they are operationally
                    ready for settlement or failover.
                  </p>
                  <p>
                    Changes here should be audited because these destinations
                    control treasury-bound funding flows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={Boolean(editWallet)}
        onOpenChange={(open) => !open && setEditWallet(null)}
      >
        <DialogContent className="max-w-2xl rounded-[1.75rem] border border-white/10 bg-[#050B1F] p-0 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-2xl font-semibold tracking-tight text-white">
              Edit platform payment method
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Update the method details and default routing.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 pt-4">
            {editWallet ? (
              <PlatformWalletForm
                mode="edit"
                walletId={editWallet.id}
                defaultValues={editWallet}
                onSuccess={() => setEditWallet(null)}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
