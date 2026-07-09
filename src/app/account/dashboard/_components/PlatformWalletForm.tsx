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

const FIELD_LABEL_CLASS =
  "text-xs uppercase tracking-[0.24em] text-slate-700 dark:text-slate-400";
const FIELD_INPUT_CLASS =
  "h-12 rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 shadow-sm placeholder:text-slate-500 ring-1 ring-transparent transition-colors focus-visible:border-sky-400 focus-visible:ring-sky-400/20 aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500";
const FIELD_TEXTAREA_CLASS =
  "rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 shadow-sm placeholder:text-slate-500 ring-1 ring-transparent transition-colors focus-visible:border-sky-400 focus-visible:ring-sky-400/20 aria-invalid:border-red-400/60 aria-invalid:ring-1 aria-invalid:ring-red-400/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500";
const FIELD_SURFACE_CLASS =
  "space-y-4 rounded-3xl border border-slate-300 bg-white p-4 shadow-sm sm:space-y-5 sm:p-5 lg:p-6 dark:border-white/10 dark:bg-white/[0.04]";
const FIELD_BOX_CLASS =
  "flex h-12 items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-950 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-white";
const TOGGLE_CARD_CLASS =
  "flex items-center justify-between rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-white";
const TOGGLE_TITLE_CLASS =
  "block text-sm font-semibold text-slate-950 dark:text-white";
const TOGGLE_BODY_CLASS = "block text-xs text-slate-700 dark:text-slate-400";
const CHECKBOX_CLASS =
  "h-5 w-5 rounded border-slate-300 bg-white text-sky-600 shadow-sm";
const SELECT_TRIGGER_CLASS =
  "h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 shadow-sm ring-1 ring-transparent transition-colors focus-visible:border-sky-400 focus-visible:ring-sky-400/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white";
const ALERT_CLASS =
  "rounded-2xl border border-red-200 bg-red-50 text-red-900 shadow-sm dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-100";
const SUBMIT_BUTTON_CLASS =
  "w-full rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.32)] transition hover:opacity-95";

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
  return <label className={FIELD_LABEL_CLASS}>{children}</label>;
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
        <Alert className={ALERT_CLASS}>
          <AlertTitle>{state.message}</AlertTitle>
        </Alert>
      ) : null}

      <input type="hidden" name="type" value={type} />
      <input
        type="hidden"
        name="verificationStatus"
        value={verificationStatus}
      />

      {type === "BANK_INFO" ? (
        <div className={FIELD_SURFACE_CLASS}>
          <p className={FIELD_LABEL_CLASS}>Bank Details</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 min-w-0">
              <FieldLabel>Provider Name</FieldLabel>
              <Input
                name="providerName"
                defaultValue={defaultValues?.providerName ?? ""}
                aria-invalid={Boolean(fieldErrors?.providerName?.[0])}
                className={FIELD_INPUT_CLASS}
                placeholder="Bank provider"
              />
              <FieldError fieldErrors={fieldErrors} name="providerName" />
            </div>
            <div className="space-y-2 min-w-0">
              <FieldLabel>Account Name</FieldLabel>
              <Input
                name="accountName"
                defaultValue={defaultValues?.accountName ?? ""}
                required
                aria-invalid={Boolean(fieldErrors?.accountName?.[0])}
                className={FIELD_INPUT_CLASS}
                placeholder="Account holder / beneficiary"
              />
              <FieldError fieldErrors={fieldErrors} name="accountName" />
            </div>
            <div className="space-y-2 min-w-0">
              <FieldLabel>Bank Name</FieldLabel>
              <Input
                name="bankName"
                defaultValue={defaultValues?.bankName ?? ""}
                required
                aria-invalid={Boolean(fieldErrors?.bankName?.[0])}
                className={FIELD_INPUT_CLASS}
              />
              <FieldError fieldErrors={fieldErrors} name="bankName" />
            </div>
            <div className="space-y-2 min-w-0">
              <FieldLabel>Bank Code</FieldLabel>
              <Input
                name="bankCode"
                defaultValue={defaultValues?.bankCode ?? ""}
                aria-invalid={Boolean(fieldErrors?.bankCode?.[0])}
                className={FIELD_INPUT_CLASS}
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
                className={FIELD_INPUT_CLASS}
              />
              <FieldError fieldErrors={fieldErrors} name="accountNumber" />
            </div>
            <div className="space-y-2 min-w-0">
              <FieldLabel>Reference</FieldLabel>
              <Input
                name="reference"
                defaultValue={defaultValues?.reference ?? ""}
                aria-invalid={Boolean(fieldErrors?.reference?.[0])}
                className={FIELD_INPUT_CLASS}
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
                className={FIELD_INPUT_CLASS}
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
                className={FIELD_INPUT_CLASS}
              />
              <FieldError fieldErrors={fieldErrors} name="iban" />
            </div>
            <div className="space-y-2 min-w-0">
              <FieldLabel>Swift Code</FieldLabel>
              <Input
                name="swiftCode"
                defaultValue={defaultValues?.swiftCode ?? ""}
                aria-invalid={Boolean(fieldErrors?.swiftCode?.[0])}
                className={FIELD_INPUT_CLASS}
              />
              <FieldError fieldErrors={fieldErrors} name="swiftCode" />
            </div>
            <div className="space-y-2 min-w-0">
              <FieldLabel>Routing Number</FieldLabel>
              <Input
                name="routingNumber"
                defaultValue={defaultValues?.routingNumber ?? ""}
                aria-invalid={Boolean(fieldErrors?.routingNumber?.[0])}
                className={FIELD_INPUT_CLASS}
              />
              <FieldError fieldErrors={fieldErrors} name="routingNumber" />
            </div>
            <div className="space-y-2 min-w-0 sm:col-span-2 lg:col-span-3">
              <FieldLabel>Branch Name</FieldLabel>
              <Input
                name="branchName"
                defaultValue={defaultValues?.branchName ?? ""}
                aria-invalid={Boolean(fieldErrors?.branchName?.[0])}
                className={FIELD_INPUT_CLASS}
              />
              <FieldError fieldErrors={fieldErrors} name="branchName" />
            </div>
          </div>
        </div>
      ) : (
        <div className={FIELD_SURFACE_CLASS}>
          <p className={FIELD_LABEL_CLASS}>Wallet Details</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 min-w-0">
              <FieldLabel>Asset</FieldLabel>
              <input
                type="hidden"
                name="cryptoAsset"
                value={defaultValues?.cryptoAsset ?? "BTC"}
              />
              <div className={FIELD_BOX_CLASS}>
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
              <div className={FIELD_BOX_CLASS}>
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
                className={FIELD_TEXTAREA_CLASS}
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
                className={FIELD_INPUT_CLASS}
                placeholder="Optional wallet tag or memo"
              />
              <FieldError fieldErrors={fieldErrors} name="walletTag" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel>Label</FieldLabel>
          <Input
            name="label"
            defaultValue={defaultValues?.label ?? "Treasury method"}
            required
            aria-invalid={Boolean(fieldErrors?.label?.[0])}
            className={FIELD_INPUT_CLASS}
            placeholder="Primary treasury label"
          />
          <FieldError fieldErrors={fieldErrors} name="label" />
        </div>

        <div className="space-y-2">
          <FieldLabel>Currency</FieldLabel>
          <Input
            name="currency"
            defaultValue={defaultValues?.currency ?? "USD"}
            required
            aria-invalid={Boolean(fieldErrors?.currency?.[0])}
            className={FIELD_INPUT_CLASS}
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
            className={FIELD_INPUT_CLASS}
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
            className={FIELD_INPUT_CLASS}
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
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
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
          className={FIELD_TEXTAREA_CLASS}
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
          className={FIELD_TEXTAREA_CLASS}
          placeholder="Internal or operational notes"
        />
        <FieldError fieldErrors={fieldErrors} name="notes" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={TOGGLE_CARD_CLASS}>
          <span>
            <span className={TOGGLE_TITLE_CLASS}>Private method</span>
            <span className={TOGGLE_BODY_CLASS}>
              Keep this method hidden from all users unless it is attached to a
              specific request.
            </span>
          </span>
          <input
            type="checkbox"
            name="isPrivate"
            value="true"
            defaultChecked={defaultValues?.isPrivate ?? false}
            className={CHECKBOX_CLASS}
          />
        </label>

        <label className={TOGGLE_CARD_CLASS}>
          <span>
            <span className={TOGGLE_TITLE_CLASS}>Set as active</span>
            <span className={TOGGLE_BODY_CLASS}>
              Enable this payment method for funding flows.
            </span>
          </span>
          <input
            type="checkbox"
            name="isActive"
            value="true"
            defaultChecked={defaultValues?.isActive ?? true}
            className={CHECKBOX_CLASS}
          />
        </label>

        <label className={TOGGLE_CARD_CLASS}>
          <span>
            <span className={TOGGLE_TITLE_CLASS}>Set as default</span>
            <span className={TOGGLE_BODY_CLASS}>
              Make this the primary platform payment method.
            </span>
          </span>
          <input
            type="checkbox"
            name="isDefault"
            value="true"
            defaultChecked={defaultValues?.isDefault ?? false}
            className={CHECKBOX_CLASS}
          />
        </label>
      </div>

      <Button type="submit" disabled={pending} className={SUBMIT_BUTTON_CLASS}>
        {pending ? "Saving..." : "Save"}
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
        <TabsList className="grid w-full grid-cols-2 rounded-2xl border border-border/60 bg-slate-100/90 p-1 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <TabsTrigger
            value="BANK_INFO"
            className="rounded-2xl text-slate-700 hover:text-slate-950 data-[state=active]:border data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-slate-950 dark:text-slate-300 dark:hover:text-white dark:data-[state=active]:border-white/10 dark:data-[state=active]:bg-white/[0.08] dark:data-[state=active]:text-white"
          >
            Bank info
          </TabsTrigger>
          <TabsTrigger
            value="WALLET_ADDRESS"
            className="rounded-2xl text-slate-700 hover:text-slate-950 data-[state=active]:border data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-slate-950 dark:text-slate-300 dark:hover:text-white dark:data-[state=active]:border-white/10 dark:data-[state=active]:bg-white/[0.08] dark:data-[state=active]:text-white"
          >
            Crypto wallet
          </TabsTrigger>
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
