"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ArrowUpRight,
  Check,
  CreditCard,
  Landmark,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  WalletCards,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deletePaymentMethod } from "@/actions/accounts/payments/deletePaymentMethod";
import { setDefaultPaymentMethod } from "@/actions/accounts/payments/setDefaultPaymentMethod";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "../../_components/dashboardSurfaces";
import PaymentMethodDrawer from "./PaymentMethodDrawer";

type PaymentMethod = {
  id: string;
  type: "BANK" | "CRYPTO";
  isDefault: boolean;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  bankCode?: string | null;
  iban?: string | null;
  swiftCode?: string | null;
  routingNumber?: string | null;
  branchName?: string | null;
  network?: string | null;
  address?: string | null;
};

type Props = {
  initialMethods: PaymentMethod[];
  kycStatus: "NOT_STARTED" | "VERIFIED" | "PENDING_REVIEW" | "REJECTED";
};

function maskSensitiveValue(value?: string | null) {
  if (!value) return "Not provided";

  if (value.length <= 7) {
    return `${value.slice(0, 1)}***${value.slice(-1)}`;
  }

  return `${value.slice(0, 4)}***${value.slice(-3)}`;
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  if (!value) return null;

  return (
    <div className="flex min-w-0 items-start justify-between gap-4 py-2.5">
      <span className="shrink-0 text-xs font-medium text-slate-600 dark:text-slate-400">
        {label}
      </span>
      <span
        className={cn(
          "min-w-0 break-words text-right text-sm font-semibold text-slate-900 dark:text-white",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function PaymentMethodCard({
  method,
  onSetDefault,
  onRemove,
}: {
  method: PaymentMethod;
  onSetDefault: (id: string) => void;
  onRemove: (id: string, wasDefault: boolean) => void;
}) {
  const router = useRouter();
  const [isRemoving, startRemoving] = useTransition();
  const [removeOpen, setRemoveOpen] = useState(false);
  const isBank = method.type === "BANK";

  const handleRemove = () => {
    startRemoving(async () => {
      try {
        const result = await deletePaymentMethod(method.id);

        if (result?.error) {
          toast.error(result.error);
          return;
        }

        onRemove(method.id, method.isDefault);
        setRemoveOpen(false);
        toast.success("Payment method removed.");
        router.refresh();
      } catch {
        toast.error("Unable to remove this payment method.");
      }
    });
  };

  const additionalBankDetails = [
    { label: "Bank code", value: method.bankCode },
    { label: "IBAN", value: method.iban },
    { label: "SWIFT / BIC", value: method.swiftCode },
    { label: "Routing number", value: method.routingNumber },
    { label: "Branch", value: method.branchName },
  ].filter((item) => item.value);

  return (
    <div
      className={cn(
        DASHBOARD_PAGE_SURFACE_CLASS,
        "group relative flex h-full flex-col overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/60 hover:shadow-md sm:p-6",
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-400/[0.07] blur-3xl transition-opacity group-hover:bg-sky-400/[0.12]" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
            {isBank ? (
              <Landmark className="h-5 w-5" />
            ) : (
              <CreditCard className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-950 dark:text-white">
              {isBank ? method.bankName || "Bank account" : "Crypto wallet"}
            </p>
            <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              {isBank
                ? "Bank withdrawal method"
                : method.network || "Crypto network"}
            </p>
          </div>
        </div>

        {method.isDefault ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-900 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
            <Check className="h-3 w-3" />
            Default
          </span>
        ) : null}
      </div>

      <div className="relative mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 dark:border-white/10 dark:bg-white/[0.04]">
        {isBank ? (
          <>
            <DetailRow label="Account name" value={method.accountName} />
            <div className="border-t border-slate-200 dark:border-white/10" />
            <DetailRow
              label="Account number"
              value={maskSensitiveValue(method.accountNumber)}
              mono
            />
          </>
        ) : (
          <>
            <DetailRow label="Network" value={method.network} />
            <div className="border-t border-slate-200 dark:border-white/10" />
            <DetailRow
              label="Wallet address"
              value={maskSensitiveValue(method.address)}
              mono
            />
          </>
        )}
      </div>

      {isBank && additionalBankDetails.length > 0 ? (
        <div className="relative mt-3 grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
          {additionalBankDetails.map((item) => (
            <div
              key={item.label}
              className={cn(
                "min-w-0 space-y-1",
                item.label === "Branch" && "col-span-2",
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {item.label}
              </p>
              <p className="break-words text-xs font-semibold text-slate-900 dark:text-slate-100">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="relative mt-auto mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-white/10">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          Protected details
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!method.isDefault ? (
            <form action={setDefaultPaymentMethod}>
              <input type="hidden" name="id" value={method.id} />
              <button
                type="submit"
                onClick={() => onSetDefault(method.id)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 text-xs font-semibold text-sky-900 transition-colors hover:border-sky-300 hover:bg-sky-100 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200 dark:hover:bg-sky-400/15"
              >
                <Star className="h-3.5 w-3.5" />
                Set default
              </button>
            </form>
          ) : null}

          <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-rose-400/20 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove payment method?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove this{" "}
                  {isBank ? "bank account" : "crypto wallet"} from your
                  withdrawal options. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isRemoving}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(event) => {
                    event.preventDefault();
                    handleRemove();
                  }}
                  disabled={isRemoving}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isRemoving ? "Removing..." : "Remove method"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

function KycNotice({
  status,
}: {
  status: "NOT_STARTED" | "PENDING_REVIEW" | "REJECTED";
}) {
  const content = {
    NOT_STARTED: {
      title: "Verification required",
      description:
        "Complete your identity verification to add payment methods and enable withdrawals.",
      action: "Start verification",
    },
    PENDING_REVIEW: {
      title: "Verification under review",
      description:
        "Your KYC submission is being reviewed. Payment method management will become available once verification is approved.",
      action: "View verification",
    },
    REJECTED: {
      title: "Verification needs attention",
      description:
        "Your previous verification was unsuccessful. Review your KYC details and submit an updated application.",
      action: "Update verification",
    },
  }[status];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-500/[0.06] sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-amber-950 dark:text-amber-200">
            {content.title}
          </p>
          <p className="max-w-2xl text-sm leading-6 text-amber-950 dark:text-amber-100">
            {content.description}
          </p>
        </div>
      </div>

      <Button
        asChild
        variant="outline"
        className="h-10 shrink-0 gap-2 rounded-xl border-amber-300 bg-white text-amber-950 hover:bg-amber-100 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100 dark:hover:bg-amber-400/15"
      >
        <Link href="/account/dashboard/user/kyc">
          {content.action}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

export default function PaymentInfoClient({
  initialMethods,
  kycStatus,
}: Props) {
  const [paymentMethods, setPaymentMethods] = useState(initialMethods);
  const [showModal, setShowModal] = useState(false);

  const canManageMethods = kycStatus === "VERIFIED";

  const handleLocalDefault = (id: string) => {
    setPaymentMethods((previous) =>
      previous.map((method) => ({
        ...method,
        isDefault: method.id === id,
      })),
    );
  };

  const handleLocalRemove = (id: string, wasDefault: boolean) => {
    setPaymentMethods((previous) => {
      const remaining = previous.filter((method) => method.id !== id);

      if (!wasDefault || remaining.length === 0) {
        return remaining;
      }

      return remaining.map((method, index) => ({
        ...method,
        isDefault: index === 0,
      }));
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-7">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-900 dark:text-sky-300">
            <WalletCards className="h-4 w-4" />
            Account settings
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Payment methods
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-700 dark:text-slate-300">
              Manage the bank accounts and crypto wallets you use to receive
              withdrawals.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          disabled={!canManageMethods}
          className="h-11 gap-2 rounded-xl bg-[#3c9ee0] px-5 font-semibold text-white shadow-sm hover:bg-[#2f8bd0]"
        >
          <Plus className="h-4 w-4" />
          Add payment method
        </Button>
      </section>

      {!canManageMethods ? <KycNotice status={kycStatus} /> : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">
              Saved methods
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              {paymentMethods.length === 1
                ? "1 payment method saved"
                : `${paymentMethods.length} payment methods saved`}
            </p>
          </div>

          {paymentMethods.length > 0 ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
              {paymentMethods.filter((method) => method.isDefault).length > 0
                ? "Default method selected"
                : "No default selected"}
            </span>
          ) : null}
        </div>

        {paymentMethods.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                onSetDefault={handleLocalDefault}
                onRemove={handleLocalRemove}
              />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              DASHBOARD_PAGE_SURFACE_CLASS,
              "flex flex-col items-center px-6 py-12 text-center sm:px-10",
            )}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
              <WalletCards className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
              No payment methods yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-700 dark:text-slate-300">
              Add a bank account or crypto wallet to receive your withdrawals.
              Your saved methods will appear here.
            </p>

            {canManageMethods ? (
              <Button
                onClick={() => setShowModal(true)}
                className="mt-6 h-11 gap-2 rounded-xl bg-[#3c9ee0] px-5 font-semibold text-white hover:bg-[#2f8bd0]"
              >
                <Plus className="h-4 w-4" />
                Add your first method
              </Button>
            ) : (
              <Button
                asChild
                className="mt-6 h-11 gap-2 rounded-xl bg-[#3c9ee0] px-5 font-semibold text-white hover:bg-[#2f8bd0]"
              >
                <Link href="/account/dashboard/user/kyc">
                  <ShieldCheck className="h-4 w-4" />
                  Complete verification
                </Link>
              </Button>
            )}
          </div>
        )}
      </section>

      {canManageMethods ? (
        <PaymentMethodDrawer open={showModal} onOpenChange={setShowModal} />
      ) : null}
    </div>
  );
}
