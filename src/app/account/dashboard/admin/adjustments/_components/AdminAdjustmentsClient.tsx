"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { adjustAccountBalance } from "@/actions/admin/adjustments/adjustAccountBalance";
import type { AdminAccountAdjustmentState } from "@/actions/admin/adjustments/adjustAccountBalance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatEnumLabel } from "@/lib/formatters/formatters";
import type {
  AdminAdjustmentAccountType,
  AdminAdjustmentPageData,
} from "@/lib/types/adminAdjustments";
import { cn } from "@/lib/utils";

type Props = {
  data: AdminAdjustmentPageData;
};

const initialState: AdminAccountAdjustmentState = {
  status: "idle",
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? "Saving..." : "Save adjustment"}
    </Button>
  );
}

function getAccountTypeLabel(accountType: AdminAdjustmentAccountType) {
  return accountType === "INVESTMENT_ACCOUNT"
    ? "Investment account"
    : "Savings account";
}

export function AdminAdjustmentsClient({ data }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(adjustAccountBalance, initialState);
  const [selectedAccountType, setSelectedAccountType] =
    useState<AdminAdjustmentAccountType>(
      data.defaultAccountType ?? "INVESTMENT_ACCOUNT",
    );
  const [selectedAccountId, setSelectedAccountId] = useState(
    data.defaultAccountId ?? "",
  );
  const [direction, setDirection] = useState<"ADD" | "DEDUCT">("ADD");
  const lastToastKey = useRef<string | null>(null);

  const accountOptions = useMemo(
    () =>
      data.accounts.filter(
        (account) => account.accountType === selectedAccountType,
      ),
    [data.accounts, selectedAccountType],
  );

  const activeAccountId =
    accountOptions.some((account) => account.id === selectedAccountId)
      ? selectedAccountId
      : accountOptions[0]?.id ?? "";

  const selectedAccount =
    data.accounts.find((account) => account.id === activeAccountId) ??
    accountOptions[0] ??
    null;
  const canSubmit = accountOptions.length > 0 && Boolean(activeAccountId);

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    const toastKey = `${state.status}:${state.message}:${state.adjustmentId ?? ""}`;

    if (lastToastKey.current === toastKey) {
      return;
    }

    lastToastKey.current = toastKey;

    if (state.status === "success") {
      toast.success(state.message);
      return;
    }

    toast.error(state.message);
  }, [state.adjustmentId, state.message, state.status]);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(8,17,37,0.98))] text-white shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
        <CardHeader className="space-y-2 border-b border-white/8 px-4 py-4 sm:px-6 sm:py-5">
          <CardTitle className="text-lg sm:text-xl">
            Balance adjustment form
          </CardTitle>
          <p className="text-sm text-slate-400">
            Select an account, choose whether to add or deduct funds, then save
            the adjustment. The change is audit logged and the user is
            notified.
          </p>
        </CardHeader>

        <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
          <form action={formAction} className="space-y-5">
            <input type="hidden" name="accountType" value={selectedAccountType} />
            <input type="hidden" name="accountId" value={activeAccountId} />
            <input type="hidden" name="direction" value={direction} />

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-100">
                Account type
              </label>
              <Select
                value={selectedAccountType}
                onValueChange={(next) => {
                  const nextType = next as AdminAdjustmentAccountType;
                  setSelectedAccountType(nextType);
                }}
              >
                <SelectTrigger className="h-11 w-full rounded-2xl border-white/10 bg-white/[0.04] text-left text-white">
                  <SelectValue placeholder="Choose account type" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="INVESTMENT_ACCOUNT">
                  Investment account
                </SelectItem>
                <SelectItem value="SAVINGS_ACCOUNT">
                  Savings account
                </SelectItem>
              </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Pick the account family you want to adjust.
              </p>
              {state.fieldErrors?.accountType?.[0] ? (
                <p className="text-xs text-red-300">
                  {state.fieldErrors.accountType[0]}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-100">
                Target account
              </label>
              <Select
                value={activeAccountId}
                onValueChange={setSelectedAccountId}
                disabled={accountOptions.length === 0}
              >
                <SelectTrigger className="h-11 w-full rounded-2xl border-white/10 bg-white/[0.04] text-left text-white">
                  <SelectValue
                    placeholder={
                      accountOptions.length === 0
                        ? "No accounts available"
                        : "Choose an account"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {accountOptions.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Only active or frozen accounts are shown here.
              </p>
              {state.fieldErrors?.accountId?.[0] ? (
                <p className="text-xs text-red-300">{state.fieldErrors.accountId[0]}</p>
              ) : null}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-100">
                  Adjustment direction
                </label>
              <Select
                value={direction}
                onValueChange={(next) => setDirection(next as "ADD" | "DEDUCT")}
              >
                <SelectTrigger className="h-11 w-full rounded-2xl border-white/10 bg-white/[0.04] text-left text-white">
                  <SelectValue placeholder="Choose direction" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADD">Add to balance</SelectItem>
                    <SelectItem value="DEDUCT">Deduct from balance</SelectItem>
                  </SelectContent>
                </Select>
                {state.fieldErrors?.direction?.[0] ? (
                  <p className="text-xs text-red-300">
                    {state.fieldErrors.direction[0]}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <label htmlFor="amount" className="text-sm font-medium text-slate-100">
                  Amount
                </label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="100.00"
                  className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
                />
                {state.fieldErrors?.amount?.[0] ? (
                  <p className="text-xs text-red-300">{state.fieldErrors.amount[0]}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="reason" className="text-sm font-medium text-slate-100">
                Reason
              </label>
              <Textarea
                id="reason"
                name="reason"
                rows={4}
                placeholder="Explain why the adjustment is being applied."
                className="rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">
                This note is stored in the audit log and user notification.
              </p>
              {state.fieldErrors?.reason?.[0] ? (
                <p className="text-xs text-red-300">{state.fieldErrors.reason[0]}</p>
              ) : null}
            </div>

            {state.message ? (
              <div
                className={cn(
                  "rounded-2xl border px-4 py-3 text-sm",
                  state.status === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                    : "border-red-500/30 bg-red-500/10 text-red-200",
                )}
              >
                {state.message}
              </div>
            ) : null}

            <div className="flex items-center justify-end">
              <SubmitButton disabled={!canSubmit} />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(8,17,37,0.98))] text-white shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
        <CardHeader className="space-y-2 border-b border-white/8 px-4 py-4 sm:px-6 sm:py-5">
          <CardTitle className="text-lg sm:text-xl">Selected account</CardTitle>
          <p className="text-sm text-slate-400">
            Review the currently selected account before saving the adjustment.
          </p>
        </CardHeader>

        <CardContent className="space-y-4 px-4 py-4 sm:px-6 sm:py-6">
          {selectedAccount ? (
            <>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Account
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {selectedAccount.title}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {getAccountTypeLabel(selectedAccount.accountType)}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Current balance
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatCurrency(
                      selectedAccount.balance,
                      selectedAccount.currency,
                    )}
                  </p>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatEnumLabel(selectedAccount.status)}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Owner
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {selectedAccount.ownerName}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedAccount.ownerEmail}
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Source
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  {selectedAccount.meta}
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
              No adjustable accounts are currently available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
