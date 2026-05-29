"use client";

import { CheckCircle2, ShieldAlert } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  cleanupLegacyBankInfoRequests,
  type CleanupLegacyBankInfoRequestsState,
} from "@/actions/super-admin/system-health/cleanupLegacyBankInfoRequests";
import { FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SuperAdminActionSubmitButton } from "@/app/account/dashboard/super-admin/_components/SuperAdminActionSubmitButton";
import { SuperAdminSectionCard } from "@/app/account/dashboard/super-admin/_components/SuperAdminSectionCard";

const CONFIRMATION_TEXT = "PURGE_LEGACY_BANK_INFO_REQUESTS";

function createInitialState(): CleanupLegacyBankInfoRequestsState {
  return {
    status: "idle",
    deletedCount: 0,
    investmentOrderCount: 0,
    savingsAccountCount: 0,
    revalidatedPathCount: 0,
  };
}

function SummaryTile({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">{helper}</p>
    </div>
  );
}

export function LegacyBankInfoRequestCleanupCard() {
  const [confirmation, setConfirmation] = useState("");
  const [state, formAction, pending] = useActionState(
    cleanupLegacyBankInfoRequests,
    createInitialState(),
  );
  const lastToastSignature = useRef<string | null>(null);
  const hasConfirmationError = Boolean(state.fieldErrors?.confirmation?.length);

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    const signature = `${state.status}:${state.message}`;

    if (lastToastSignature.current === signature) {
      return;
    }

    lastToastSignature.current = signature;

    if (state.status === "success") {
      toast.success(state.message);
      return;
    }

    toast.error(state.message);
  }, [state.message, state.status]);

  const canSubmit = confirmation.trim() === CONFIRMATION_TEXT && !pending;
  const isSuccess = state.status === "success";

  return (
    <SuperAdminSectionCard
      title="Legacy bank request cleanup"
      description="Purge orphaned legacy bank-info request acknowledgements so stale request buttons are released without sending any new notifications."
      className="border-white/10 bg-[#071120] shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
      headerClassName="border-b border-white/10"
      contentClassName="space-y-5"
    >
      <form action={formAction} className="space-y-5">
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
          <p className="font-semibold">Maintenance only</p>
          <p className="mt-1 text-amber-50/80">
            This run deletes stale legacy request acknowledgements that no
            longer have a matching live request. It does not create any new
            notification or message.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="legacy-bank-info-cleanup-confirmation">
              Confirmation text
            </FieldLabel>
            <p className="text-xs leading-5 text-slate-400">
              Type{" "}
              <span className="font-semibold text-slate-100">
                {CONFIRMATION_TEXT}
              </span>{" "}
              to enable the cleanup button.
            </p>
            <Input
              id="legacy-bank-info-cleanup-confirmation"
              name="confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={CONFIRMATION_TEXT}
              autoComplete="off"
              className={`h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500 ${
                hasConfirmationError
                  ? "border-rose-400/30 ring-1 ring-rose-400/20"
                  : ""
              }`}
            />
            {state.fieldErrors?.confirmation?.[0] ? (
              <FieldError>{state.fieldErrors.confirmation[0]}</FieldError>
            ) : null}
          </div>
        </div>

        {state.status !== "idle" ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
              isSuccess
                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                : "border-rose-400/20 bg-rose-500/10 text-rose-100"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            Revalidates notifications, checkout, and any investment order
            payment pages affected by orphaned acknowledgements.
          </p>

          <SuperAdminActionSubmitButton
            idleLabel="Purge legacy acks"
            pendingLabel="Purging..."
            variant="destructive"
            disabled={!canSubmit}
            className="h-11 rounded-2xl px-5 font-semibold"
          />
        </div>
      </form>

      {isSuccess ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryTile
              label="Deleted acks"
              value={state.deletedCount}
              helper="Orphaned acknowledgements removed from the database."
            />
            <SummaryTile
              label="Investment orders"
              value={state.investmentOrderCount}
              helper="Affected payment pages revalidated for active investment orders."
            />
            <SummaryTile
              label="Savings accounts"
              value={state.savingsAccountCount}
              helper="Savings checkout state refreshed for affected accounts."
            />
            <SummaryTile
              label="Paths revalidated"
              value={state.revalidatedPathCount}
              helper="Cached dashboard routes refreshed after cleanup."
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
            <div className="flex flex-wrap items-center gap-2 text-slate-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <span className="font-medium">Cleanup completed successfully.</span>
            </div>
            <p className="mt-2 text-slate-400">
              The database now only keeps live legacy bank-request acknowledgements
              that still have a matching request.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-500/20 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
          <div className="flex items-center gap-2 text-slate-200">
            <ShieldAlert className="h-4 w-4" />
            <span className="font-medium">One-time maintenance</span>
          </div>
          <p className="mt-2">
            If stale legacy request acks exist, this action removes them in one
            pass and immediately releases the locked request state for affected
            users.
          </p>
        </div>
      )}
    </SuperAdminSectionCard>
  );
}
