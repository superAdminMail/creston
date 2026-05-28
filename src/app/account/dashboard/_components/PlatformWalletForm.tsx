"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { toast } from "sonner";

import { createPlatformPaymentMethod } from "@/actions/admin/platform-wallets/createPlatformWallet";
import { updatePlatformPaymentMethod } from "@/actions/admin/platform-wallets/updatePlatformWallet";
import {
  initialPlatformPaymentMethodFormState,
  type PlatformPaymentMethodFormActionState,
} from "@/actions/admin/platform-wallets/platformWalletForm.state";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FormFieldErrors } from "@/lib/forms/actionState";

export type PlatformPaymentMethodFormDefaults = {
  type?: "BANK_INFO" | "WALLET_ADDRESS";
  label?: string;
  providerName?: string | null;
  accountName?: string | null;
  reference?: string | null;
  bankAddress?: string | null;
  currency?: string | null;
  country?: string | null;
  instructions?: string | null;
  notes?: string | null;
  isPrivate?: boolean;
  isActive?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
  verificationStatus?: "UNVERIFIED" | "VERIFIED" | "SUSPENDED";
  bankName?: string | null;
  bankCode?: string | null;
  accountNumber?: string | null;
  iban?: string | null;
  swiftCode?: string | null;
  routingNumber?: string | null;
  branchName?: string | null;
  cryptoAsset?: "BTC" | null;
  cryptoNetwork?: "BITCOIN" | null;
  walletAddress?: string | null;
  walletTag?: string | null;
};

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="text-xs uppercase tracking-[0.24em] text-slate-500">
      {children}
    </label>
  );
}

function FieldError({
  fieldErrors,
  name,
}: {
  fieldErrors?: FormFieldErrors<string>;
  name: string;
}) {
  const message = fieldErrors?.[name]?.[0];

  if (!message) {
    return null;
  }

  return <p className="text-xs text-red-300">{message}</p>;
}

function PlatformPaymentMethodFields({
  state,
  pending,
  defaultValues,
  type,
  fieldErrors,
}: {
  state: PlatformPaymentMethodFormActionState;
  pending: boolean;
  defaultValues?: PlatformPaymentMethodFormDefaults;
  type: "BANK_INFO" | "WALLET_ADDRESS";
  fieldErrors?: FormFieldErrors<string>;
}) {
  const [verificationStatus, setVerificationStatus] = useState(
    defaultValues?.verificationStatus ?? "UNVERIFIED",
  );

  return (
    <div className="space-y-5">
      {state.status === "error" && state.message ? (
        <Alert className="rounded-2xl border border-red-400/20 bg-red-400/10 text-red-100">
          <AlertTitle>{state.message}</AlertTitle>
        </Alert>
      ) : null}

      <input type="hidden" name="type" value={type} />
      <input
        type="hidden"
        name="verificationStatus"
        value={verificationStatus}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel>Label</FieldLabel>
          <Input
            name="label"
            defaultValue={defaultValues?.label ?? "Treasury method"}
            required
            aria-invalid={Boolean(fieldErrors?.label?.[0])}
            className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
            placeholder="Primary treasury label"
          />
          <FieldError fieldErrors={fieldErrors} name="label" />
        </div>

        <div className="space-y-2">
          <FieldLabel>Provider Name</FieldLabel>
          <Input
            name="providerName"
            defaultValue={defaultValues?.providerName ?? ""}
            aria-invalid={Boolean(fieldErrors?.providerName?.[0])}
            className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
            placeholder="Bank or wallet provider"
          />
          <FieldError fieldErrors={fieldErrors} name="providerName" />
        </div>

        <div className="space-y-2">
          <FieldLabel>Account Name</FieldLabel>
          <Input
            name="accountName"
            defaultValue={defaultValues?.accountName ?? ""}
            required
            aria-invalid={Boolean(fieldErrors?.accountName?.[0])}
            className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
            placeholder="Account holder / beneficiary"
          />
          <FieldError fieldErrors={fieldErrors} name="accountName" />
        </div>

        <div className="space-y-2">
          <FieldLabel>Currency</FieldLabel>
          <Input
            name="currency"
            defaultValue={defaultValues?.currency ?? "USD"}
            required
            aria-invalid={Boolean(fieldErrors?.currency?.[0])}
            className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
            placeholder="USD"
          />
          <FieldError fieldErrors={fieldErrors} name="currency" />
        </div>

        <div className="space-y-2">
          <FieldLabel>Country</FieldLabel>
          <Input
            name="country"
            defaultValue={defaultValues?.country ?? ""}
            aria-invalid={Boolean(fieldErrors?.country?.[0])}
            className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
            placeholder="Country"
          />
          <FieldError fieldErrors={fieldErrors} name="country" />
        </div>

        <div className="space-y-2">
          <FieldLabel>Sort Order</FieldLabel>
            <Input
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={defaultValues?.sortOrder ?? 0}
              aria-invalid={Boolean(fieldErrors?.sortOrder?.[0])}
              className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
            />
            <FieldError fieldErrors={fieldErrors} name="sortOrder" />
          </div>

        <div className="space-y-2">
          <FieldLabel>Verification Status</FieldLabel>
          <Select
            value={verificationStatus}
            onValueChange={(value) =>
              setVerificationStatus(
                value as "UNVERIFIED" | "VERIFIED" | "SUSPENDED",
              )
            }
          >
            <SelectTrigger className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UNVERIFIED">Unverified</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <FieldLabel>Instructions</FieldLabel>
          <Textarea
            name="instructions"
            rows={3}
            defaultValue={defaultValues?.instructions ?? ""}
            aria-invalid={Boolean(fieldErrors?.instructions?.[0])}
            className="rounded-2xl border-white/10 bg-white/[0.04] px-4 py-3 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
            placeholder="Funding or transfer instructions"
          />
        <FieldError fieldErrors={fieldErrors} name="instructions" />
      </div>

      <div className="space-y-3">
        <FieldLabel>Notes</FieldLabel>
          <Textarea
            name="notes"
            rows={3}
            defaultValue={defaultValues?.notes ?? ""}
            aria-invalid={Boolean(fieldErrors?.notes?.[0])}
            className="rounded-2xl border-white/10 bg-white/[0.04] px-4 py-3 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
            placeholder="Internal or operational notes"
          />
        <FieldError fieldErrors={fieldErrors} name="notes" />
      </div>

      {type === "BANK_INFO" ? (
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:space-y-5 sm:p-5 lg:p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Bank Details
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 min-w-0">
              <FieldLabel>Bank Name</FieldLabel>
              <Input
                name="bankName"
                defaultValue={defaultValues?.bankName ?? ""}
                required
                aria-invalid={Boolean(fieldErrors?.bankName?.[0])}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
              />
              <FieldError fieldErrors={fieldErrors} name="bankName" />
            </div>
            <div className="space-y-2 min-w-0">
              <FieldLabel>Bank Code</FieldLabel>
              <Input
                name="bankCode"
                defaultValue={defaultValues?.bankCode ?? ""}
                aria-invalid={Boolean(fieldErrors?.bankCode?.[0])}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
              />
              <FieldError fieldErrors={fieldErrors} name="bankCode" />
            </div>
            <div className="space-y-2 min-w-0">
              <FieldLabel>Account Number</FieldLabel>
              <Input
                name="accountNumber"
                defaultValue={defaultValues?.accountNumber ?? ""}
                required
                aria-invalid={Boolean(fieldErrors?.accountNumber?.[0])}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
              />
              <FieldError fieldErrors={fieldErrors} name="accountNumber" />
            </div>
            <div className="space-y-2 min-w-0">
              <FieldLabel>Reference</FieldLabel>
              <Input
                name="reference"
                defaultValue={defaultValues?.reference ?? ""}
                aria-invalid={Boolean(fieldErrors?.reference?.[0])}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
                placeholder="Optional payment reference"
              />
              <FieldError fieldErrors={fieldErrors} name="reference" />
            </div>
            <div className="space-y-2 min-w-0 sm:col-span-2 lg:col-span-2">
              <FieldLabel>Bank Address</FieldLabel>
              <Input
                name="bankAddress"
                defaultValue={defaultValues?.bankAddress ?? ""}
                aria-invalid={Boolean(fieldErrors?.bankAddress?.[0])}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
                placeholder="Optional bank address"
              />
              <FieldError fieldErrors={fieldErrors} name="bankAddress" />
            </div>
            <div className="space-y-2 min-w-0">
              <FieldLabel>IBAN</FieldLabel>
              <Input
                name="iban"
                defaultValue={defaultValues?.iban ?? ""}
                aria-invalid={Boolean(fieldErrors?.iban?.[0])}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
              />
              <FieldError fieldErrors={fieldErrors} name="iban" />
            </div>
            <div className="space-y-2 min-w-0">
              <FieldLabel>Swift Code</FieldLabel>
              <Input
                name="swiftCode"
                defaultValue={defaultValues?.swiftCode ?? ""}
                aria-invalid={Boolean(fieldErrors?.swiftCode?.[0])}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
              />
              <FieldError fieldErrors={fieldErrors} name="swiftCode" />
            </div>
            <div className="space-y-2 min-w-0">
              <FieldLabel>Routing Number</FieldLabel>
              <Input
                name="routingNumber"
                defaultValue={defaultValues?.routingNumber ?? ""}
                aria-invalid={Boolean(fieldErrors?.routingNumber?.[0])}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
              />
              <FieldError fieldErrors={fieldErrors} name="routingNumber" />
            </div>
            <div className="space-y-2 min-w-0 sm:col-span-2 lg:col-span-3">
              <FieldLabel>Branch Name</FieldLabel>
              <Input
                name="branchName"
                defaultValue={defaultValues?.branchName ?? ""}
                aria-invalid={Boolean(fieldErrors?.branchName?.[0])}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
              />
              <FieldError fieldErrors={fieldErrors} name="branchName" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:space-y-5 sm:p-5 lg:p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Wallet Details
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 min-w-0">
              <FieldLabel>Asset</FieldLabel>
              <input
                type="hidden"
                name="cryptoAsset"
                value={defaultValues?.cryptoAsset ?? "BTC"}
              />
              <div className="flex h-12 items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white">
                {defaultValues?.cryptoAsset ?? "BTC"}
              </div>
            </div>
            <div className="space-y-2 min-w-0">
              <FieldLabel>Network</FieldLabel>
              <input
                type="hidden"
                name="cryptoNetwork"
                value={defaultValues?.cryptoNetwork ?? "BITCOIN"}
              />
              <div className="flex h-12 items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white">
                {defaultValues?.cryptoNetwork === "BITCOIN" ||
                !defaultValues?.cryptoNetwork
                  ? "Bitcoin"
                  : defaultValues.cryptoNetwork}
              </div>
            </div>
            <div className="space-y-2 min-w-0 sm:col-span-2 lg:col-span-3">
              <FieldLabel>Wallet Address</FieldLabel>
              <Textarea
                name="walletAddress"
                rows={4}
                defaultValue={defaultValues?.walletAddress ?? ""}
                required
                aria-invalid={Boolean(fieldErrors?.walletAddress?.[0])}
                className="rounded-2xl border-white/10 bg-white/[0.04] px-4 py-3 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
                placeholder="0x..."
              />
              <FieldError fieldErrors={fieldErrors} name="walletAddress" />
            </div>
            <div className="space-y-2 min-w-0 sm:col-span-2 lg:col-span-3">
              <FieldLabel>Wallet Tag</FieldLabel>
              <Input
                name="walletTag"
                defaultValue={defaultValues?.walletTag ?? ""}
                aria-invalid={Boolean(fieldErrors?.walletTag?.[0])}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40"
                placeholder="Optional wallet tag or memo"
              />
              <FieldError fieldErrors={fieldErrors} name="walletTag" />
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <span>
            <span className="block text-sm font-medium text-white">
              Private method
            </span>
            <span className="block text-xs text-slate-400">
              Keep this method hidden from all users unless it is attached to a
              specific request.
            </span>
          </span>
          <input
            type="checkbox"
            name="isPrivate"
            value="true"
            defaultChecked={defaultValues?.isPrivate ?? false}
            className="h-5 w-5 rounded border-white/20 bg-transparent"
          />
        </label>

        <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <span>
            <span className="block text-sm font-medium text-white">
              Set as active
            </span>
            <span className="block text-xs text-slate-400">
              Enable this payment method for funding flows.
            </span>
          </span>
          <input
            type="checkbox"
            name="isActive"
            value="true"
            defaultChecked={defaultValues?.isActive ?? true}
            className="h-5 w-5 rounded border-white/20 bg-transparent"
          />
        </label>

        <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <span>
            <span className="block text-sm font-medium text-white">
              Set as default
            </span>
            <span className="block text-xs text-slate-400">
              Make this the primary platform payment method.
            </span>
          </span>
          <input
            type="checkbox"
            name="isDefault"
            value="true"
            defaultChecked={defaultValues?.isDefault ?? false}
            className="h-5 w-5 rounded border-white/20 bg-transparent"
          />
        </label>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.32)] transition hover:opacity-95"
      >
        {pending ? "Saving..." : "Save platform payment method"}
      </Button>
    </div>
  );
}

export default function PlatformWalletForm({
  defaultValues,
  onSuccess,
  mode = "create",
  walletId,
}: {
  defaultValues?: PlatformPaymentMethodFormDefaults;
  onSuccess?: () => void;
  mode?: "create" | "edit";
  walletId?: string;
}) {
  const [type, setType] = useState<"BANK_INFO" | "WALLET_ADDRESS">(
    defaultValues?.type ?? "BANK_INFO",
  );
  const [state, formAction, pending] = useActionState(
    mode === "edit" ? updatePlatformPaymentMethod : createPlatformPaymentMethod,
    initialPlatformPaymentMethodFormState,
  );
  const lastToastKey = useRef<string | null>(null);

  useEffect(() => {
    if (state.status === "success") {
      onSuccess?.();
    }
  }, [state.status, onSuccess]);

  useEffect(() => {
    if (mode !== "create" || state.status === "idle" || !state.message) {
      return;
    }

    const toastKey = `${state.status}:${state.message}`;

    if (lastToastKey.current === toastKey) {
      return;
    }

    lastToastKey.current = toastKey;

    if (state.status === "success") {
      toast.success(state.message);
      return;
    }

    toast.error(state.message);
  }, [mode, state.message, state.status]);

  return (
    <form action={formAction} className="space-y-5">
      {mode === "edit" && walletId ? (
        <input type="hidden" name="platformPaymentMethodId" value={walletId} />
      ) : null}

      <Tabs
        value={type}
        onValueChange={(value) => setType(value as typeof type)}
      >
        <TabsList className="grid w-full grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
          <TabsTrigger value="BANK_INFO">Bank Info</TabsTrigger>
          <TabsTrigger value="WALLET_ADDRESS">Crypto Wallet</TabsTrigger>
        </TabsList>
      </Tabs>

      <PlatformPaymentMethodFields
        state={state}
        pending={pending}
        defaultValues={defaultValues}
        type={type}
        fieldErrors={state.fieldErrors}
      />
    </form>
  );
}
