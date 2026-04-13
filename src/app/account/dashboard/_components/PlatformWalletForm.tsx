"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";

import { createPlatformPaymentMethod } from "@/actions/admin/platform-wallets/createPlatformWallet";
import { updatePlatformPaymentMethod } from "@/actions/admin/platform-wallets/updatePlatformWallet";
import {
  initialPlatformPaymentMethodFormState,
  type PlatformPaymentMethodFormActionState,
} from "@/actions/admin/platform-wallets/platformWalletForm.state";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type PlatformPaymentMethodFormDefaults = {
  type?: "BANK_INFO" | "WALLET_ADDRESS";
  label?: string;
  providerName?: string | null;
  accountName?: string | null;
  currency?: string | null;
  country?: string | null;
  instructions?: string | null;
  notes?: string | null;
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
  cryptoAsset?: "BTC" | "ETH" | null;
  cryptoNetwork?: "BITCOIN" | "ETHEREUM" | null;
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

function PlatformPaymentMethodFields({
  state,
  pending,
  defaultValues,
  type,
}: {
  state: PlatformPaymentMethodFormActionState;
  pending: boolean;
  defaultValues?: PlatformPaymentMethodFormDefaults;
  type: "BANK_INFO" | "WALLET_ADDRESS";
}) {
  return (
    <div className="space-y-5">
      {state.status === "error" && state.message ? (
        <Alert className="rounded-2xl border border-red-400/20 bg-red-400/10 text-red-100">
          <AlertTitle>{state.message}</AlertTitle>
        </Alert>
      ) : null}

      <input type="hidden" name="type" value={type} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel>Label</FieldLabel>
          <Input
            name="label"
            defaultValue={defaultValues?.label ?? "Treasury method"}
            className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white"
            placeholder="Primary treasury label"
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>Provider Name</FieldLabel>
          <Input
            name="providerName"
            defaultValue={defaultValues?.providerName ?? ""}
            className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white"
            placeholder="Bank or wallet provider"
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>Account Name</FieldLabel>
          <Input
            name="accountName"
            defaultValue={defaultValues?.accountName ?? ""}
            className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white"
            placeholder="Account holder / beneficiary"
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>Currency</FieldLabel>
          <Input
            name="currency"
            defaultValue={defaultValues?.currency ?? "USD"}
            className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white"
            placeholder="USD"
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>Country</FieldLabel>
          <Input
            name="country"
            defaultValue={defaultValues?.country ?? ""}
            className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white"
            placeholder="Country"
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>Sort Order</FieldLabel>
          <Input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={defaultValues?.sortOrder ?? 0}
            className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white"
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>Verification Status</FieldLabel>
          <select
            name="verificationStatus"
            defaultValue={defaultValues?.verificationStatus ?? "UNVERIFIED"}
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none"
          >
            <option value="UNVERIFIED">Unverified</option>
            <option value="VERIFIED">Verified</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <FieldLabel>Instructions</FieldLabel>
        <Textarea
          name="instructions"
          rows={3}
          defaultValue={defaultValues?.instructions ?? ""}
          className="rounded-2xl border-white/10 bg-white/[0.04] px-4 py-3 text-white"
          placeholder="Funding or transfer instructions"
        />
      </div>

      <div className="space-y-3">
        <FieldLabel>Notes</FieldLabel>
        <Textarea
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes ?? ""}
          className="rounded-2xl border-white/10 bg-white/[0.04] px-4 py-3 text-white"
          placeholder="Internal or operational notes"
        />
      </div>

      {type === "BANK_INFO" ? (
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Bank Details
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel>Bank Name</FieldLabel>
              <Input
                name="bankName"
                defaultValue={defaultValues?.bankName ?? ""}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Bank Code</FieldLabel>
              <Input
                name="bankCode"
                defaultValue={defaultValues?.bankCode ?? ""}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Account Number</FieldLabel>
              <Input
                name="accountNumber"
                defaultValue={defaultValues?.accountNumber ?? ""}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>IBAN</FieldLabel>
              <Input
                name="iban"
                defaultValue={defaultValues?.iban ?? ""}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Swift Code</FieldLabel>
              <Input
                name="swiftCode"
                defaultValue={defaultValues?.swiftCode ?? ""}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Routing Number</FieldLabel>
              <Input
                name="routingNumber"
                defaultValue={defaultValues?.routingNumber ?? ""}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <FieldLabel>Branch Name</FieldLabel>
              <Input
                name="branchName"
                defaultValue={defaultValues?.branchName ?? ""}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Wallet Details
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel>Crypto Asset</FieldLabel>
              <select
                name="cryptoAsset"
                defaultValue={defaultValues?.cryptoAsset ?? "ETH"}
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none"
              >
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
            <div className="space-y-2">
              <FieldLabel>Crypto Network</FieldLabel>
              <select
                name="cryptoNetwork"
                defaultValue={defaultValues?.cryptoNetwork ?? "ETHEREUM"}
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none"
              >
                <option value="BITCOIN">Bitcoin</option>
                <option value="ETHEREUM">Ethereum</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <FieldLabel>Wallet Address</FieldLabel>
              <Textarea
                name="walletAddress"
                rows={4}
                defaultValue={defaultValues?.walletAddress ?? ""}
                className="rounded-2xl border-white/10 bg-white/[0.04] px-4 py-3 text-white"
                placeholder="0x..."
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <FieldLabel>Wallet Tag</FieldLabel>
              <Input
                name="walletTag"
                defaultValue={defaultValues?.walletTag ?? ""}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white"
                placeholder="Optional wallet tag or memo"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
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

  useEffect(() => {
    if (defaultValues?.type) {
      setType(defaultValues.type);
    }
  }, [defaultValues?.type]);

  useEffect(() => {
    if (state.status === "success") {
      onSuccess?.();
    }
  }, [state.status, onSuccess]);

  return (
    <form action={formAction} className="space-y-5">
      {mode === "edit" && walletId ? (
        <input type="hidden" name="platformPaymentMethodId" value={walletId} />
      ) : null}

      <Tabs value={type} onValueChange={(value) => setType(value as typeof type)}>
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
      />
    </form>
  );
}
