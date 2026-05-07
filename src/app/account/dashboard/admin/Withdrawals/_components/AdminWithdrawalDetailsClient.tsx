"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateWithdrawalCommission } from "@/actions/admin/withdrawals/updateWithdrawalCommission";
import type { AdminWithdrawalDetails } from "@/actions/admin/withdrawals/getAdminWithdrawalDetails";
import { createInitialFormState } from "@/lib/forms/actionState";
import { formatCurrency } from "@/lib/formatters/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type FieldName =
  | "withdrawalId"
  | "hasCommissionFees"
  | "commissionPercent"
  | "feeAmount";

const initialState = createInitialFormState<FieldName>();

function formatDateTime(value: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

export function AdminWithdrawalDetailsClient({
  withdrawal,
}: {
  withdrawal: AdminWithdrawalDetails;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateWithdrawalCommission,
    initialState,
  );
  const [hasCommissionFees, setHasCommissionFees] = useState(
    withdrawal.hasCommissionFees,
  );
  const [commissionPercent, setCommissionPercent] = useState(
    withdrawal.sourceType === "INVESTMENT_ORDER" &&
    withdrawal.commissionPercent > 0
      ? withdrawal.commissionPercent.toFixed(2)
      : "",
  );
  const [feeAmount, setFeeAmount] = useState(
    withdrawal.sourceType === "SAVINGS_ACCOUNT" &&
    withdrawal.savingsFeeAmount !== null
      ? withdrawal.savingsFeeAmount.toFixed(2)
      : "",
  );
  const lastToast = useRef<string | null>(null);

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    const toastKey = `${state.status}:${state.message}:${withdrawal.id}`;

    if (lastToast.current === toastKey) {
      return;
    }

    lastToast.current = toastKey;

    if (state.status === "success") {
      toast.success(state.message);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [lastToast, router, state.message, state.status, withdrawal.id]);

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <div className="space-y-3">
        <Link
          href="/account/dashboard/admin/Withdrawals"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Back to withdrawals
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">
              Withdrawal commission
            </h1>
            <p className="text-sm leading-7 text-slate-400">
              {withdrawal.requester.name ?? "Unnamed investor"} |{" "}
              {withdrawal.requester.email ?? "Unknown email"} |{" "}
              {withdrawal.sourceLabel}
            </p>
          </div>

          <Badge
            variant="secondary"
            className={cn(
              "w-fit border",
              withdrawal.hasCommissionFees
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : "border-white/10 bg-white/[0.04] text-slate-200",
            )}
          >
            {withdrawal.hasCommissionFees
              ? "Commission enabled"
              : "Commission disabled"}
          </Badge>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Status" value={withdrawal.statusLabel} />
        <InfoCard
          label="Commission status"
          value={withdrawal.commissionStatusLabel}
        />
        <InfoCard label="Amount" value={withdrawal.amount} />
        <InfoCard label="Currency" value={withdrawal.currency} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold text-white">
                Commission settings
              </h2>

              <form action={formAction} className="space-y-6">
                <input type="hidden" name="withdrawalId" value={withdrawal.id} />
                <input
                  type="hidden"
                  name="hasCommissionFees"
                  value={hasCommissionFees ? "true" : "false"}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-white">
                        Charge commission
                      </Label>
                      <p className="text-sm text-slate-400">
                        Enable this to apply a commission to the withdrawal.
                      </p>
                    </div>

                    <Switch
                      checked={hasCommissionFees}
                      onCheckedChange={setHasCommissionFees}
                      disabled={!withdrawal.canEditCommission || pending}
                    />
                  </div>

                  {withdrawal.sourceType === "INVESTMENT_ORDER" ? (
                    <div className="grid max-w-sm gap-2">
                      <Label
                        htmlFor="commissionPercent"
                        className="text-sm font-medium text-white"
                      >
                        Commission percent
                      </Label>
                      <Input
                        id="commissionPercent"
                        name="commissionPercent"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={commissionPercent}
                        onChange={(event) =>
                          setCommissionPercent(event.target.value)
                        }
                        disabled={
                          !withdrawal.canEditCommission ||
                          pending ||
                          !hasCommissionFees
                        }
                        className="rounded-2xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                        placeholder="5.00"
                      />
                      <p className="text-xs text-slate-400">
                        {hasCommissionFees
                          ? "Enter a percent between 0 and 100."
                          : "Enable commission to edit the percent."}
                      </p>
                      {state.fieldErrors?.commissionPercent?.length ? (
                        <p className="text-xs text-rose-300">
                          {state.fieldErrors.commissionPercent[0]}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {withdrawal.sourceType === "SAVINGS_ACCOUNT" ? (
                    <div className="grid max-w-sm gap-2">
                      <Label
                        htmlFor="feeAmount"
                        className="text-sm font-medium text-white"
                      >
                        Fee amount
                      </Label>
                      <Input
                        id="feeAmount"
                        name="feeAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={feeAmount}
                        onChange={(event) => setFeeAmount(event.target.value)}
                        disabled={
                          !withdrawal.canEditCommission ||
                          pending ||
                          !hasCommissionFees
                        }
                        className="rounded-2xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-slate-400">
                        {hasCommissionFees
                          ? "Enter the fixed fee amount for this savings withdrawal."
                          : "Enable commission to edit the fee amount."}
                      </p>
                      {state.fieldErrors?.feeAmount?.length ? (
                        <p className="text-xs text-rose-300">
                          {state.fieldErrors.feeAmount[0]}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {withdrawal.sourceType === "SAVINGS_ACCOUNT" && hasCommissionFees ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                      Savings withdrawals store the fixed fee amount on the order.
                      {withdrawal.savingsFeeAmount !== null ? (
                        <span className="text-white">
                          {" "}
                          Current stored fee:{" "}
                          {formatCurrency(
                            withdrawal.savingsFeeAmount,
                            withdrawal.currency,
                          )}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {state.status === "error" && state.message ? (
                  <p className="text-sm text-rose-300">{state.message}</p>
                ) : null}

                {withdrawal.canEditCommission ? (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="submit"
                      disabled={pending}
                      className={cn(
                        "rounded-2xl",
                        hasCommissionFees
                          ? "bg-emerald-600 hover:bg-emerald-500"
                          : "bg-slate-700 hover:bg-slate-600",
                      )}
                    >
                      {pending ? "Saving..." : "Save commission"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    Commission settings can only be edited while the withdrawal is pending.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold text-white">
                Withdrawal details
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard
                  label="Requested at"
                  value={formatDateTime(withdrawal.requestedAt)}
                />
                <InfoCard
                  label="Processed at"
                  value={formatDateTime(withdrawal.processedAt)}
                />
                <InfoCard
                  label="Completed at"
                  value={formatDateTime(withdrawal.completedAt)}
                />
                <InfoCard
                  label="Rejected at"
                  value={formatDateTime(withdrawal.rejectedAt)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard label="Source" value={withdrawal.sourceLabel} />
                <InfoCard
                  label={
                    withdrawal.sourceType === "SAVINGS_ACCOUNT"
                      ? "Fee amount"
                      : "Commission percent"
                  }
                  value={
                    withdrawal.hasCommissionFees
                      ? withdrawal.sourceType === "INVESTMENT_ORDER"
                        ? `${withdrawal.commissionPercent.toFixed(2)}%`
                        : withdrawal.savingsFeeAmount !== null
                          ? formatCurrency(
                              withdrawal.savingsFeeAmount,
                              withdrawal.currency,
                            )
                          : "Not available"
                      : "Not enabled"
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-white">Payment method</h2>
              <InfoCard
                label="Type"
                value={withdrawal.payoutMethod?.type ?? "Not available"}
              />
              <InfoCard
                label="Bank name"
                value={withdrawal.payoutMethod?.bankName ?? "Not available"}
              />
              <InfoCard
                label="Account name"
                value={withdrawal.payoutMethod?.accountName ?? "Not available"}
              />
              <InfoCard
                label="Account number"
                value={withdrawal.payoutMethod?.accountNumber ?? "Not available"}
              />
              <InfoCard
                label="Network"
                value={withdrawal.payoutMethod?.network ?? "Not available"}
              />
              <InfoCard
                label="Address"
                value={withdrawal.payoutMethod?.address ?? "Not available"}
              />
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-white">Admin notes</h2>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
                {withdrawal.adminNotes || "No admin notes recorded for this withdrawal."}
              </div>
              <h3 className="text-sm font-medium text-slate-200">
                {withdrawal.status === "REJECTED"
                  ? "Rejection reason"
                  : "Commission status"}
              </h3>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
                {withdrawal.rejectionReason ||
                  (withdrawal.status === "REJECTED"
                    ? "No rejection reason recorded."
                    : `${withdrawal.commissionStatusLabel} commission state.`)}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
