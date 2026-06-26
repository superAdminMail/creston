"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { updateWithdrawalStatusAction } from "@/actions/admin/withdrawals/updateWithdrawalStatus";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import type { WithdrawalStatus } from "@/generated/prisma";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";
import { getWithdrawalStatusActionOptions } from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";
import { Textarea } from "@/components/ui/textarea";

export function WithdrawalStatusActionMenu({
  withdrawalId,
  status,
}: {
  withdrawalId: string;
  status: WithdrawalStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reasonOpen, setReasonOpen] = useState(false);
  const [selectedReasonStatus, setSelectedReasonStatus] =
    useState<WithdrawalStatus | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const options = getWithdrawalStatusActionOptions(status);
  const selectedReasonOption = useMemo(
    () =>
      selectedReasonStatus
        ? (options.find((option) => option.status === selectedReasonStatus) ??
          null)
        : null,
    [options, selectedReasonStatus],
  );

  function handleStatusChange(
    nextStatus: WithdrawalStatus,
    reasonValue?: string | null,
  ) {
    startTransition(async () => {
      const result = await updateWithdrawalStatusAction({
        withdrawalId,
        status: nextStatus,
        reason: reasonValue ?? undefined,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  function openReasonDialog(nextStatus: WithdrawalStatus) {
    setSelectedReasonStatus(nextStatus);
    setReason("");
    setReasonError("");
    setReasonOpen(true);
  }

  function submitReasonedStatusChange() {
    if (!selectedReasonStatus) {
      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setReasonError("A reason is required before submitting this change.");
      toast.error("A reason is required before submitting this change.");
      return;
    }

    setReasonError("");
    setReasonOpen(false);
    handleStatusChange(selectedReasonStatus, trimmedReason);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-2xl border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] hover:text-white"
            disabled={pending}
            aria-label="Change withdrawal status"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-64 rounded-2xl border border-white/10 bg-[#081224] p-1 text-white"
        >
          {options.map((option) => (
            <DropdownMenuItem
              key={option.status}
              disabled={option.disabled || pending}
              onSelect={() => {
                if (option.disabled) {
                  return;
                }

                if (option.requiresReason) {
                  openReasonDialog(option.status);
                  return;
                }

                handleStatusChange(option.status);
              }}
              className={cn(
                "flex items-start gap-3 rounded-xl px-3 py-2 text-sm",
                option.isCurrent && "bg-white/5 text-white",
              )}
            >
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-white">
                  {option.isCurrent
                    ? `Current: ${formatEnumLabel(option.status)}`
                    : option.label}
                </p>
                <p className="text-xs leading-5 text-slate-400">
                  {option.description}
                </p>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent className="border-white/10 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedReasonOption?.status === "CANCELLED"
                ? "Cancel withdrawal"
                : "Reject withdrawal"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Label htmlFor="withdrawalStatusReason" className="text-slate-200">
              Reason
            </Label>
            <Textarea
              id="withdrawalStatusReason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (reasonError) {
                  setReasonError("");
                }
              }}
              placeholder="Explain why this withdrawal is being rejected or cancelled."
              className="min-h-28 rounded-2xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
            />
            {reasonError ? (
              <p className="text-xs text-rose-300">{reasonError}</p>
            ) : null}
            <p className="text-xs leading-5 text-slate-400">
              This note will be saved with the withdrawal status update and
              shown to the user where applicable.
            </p>
          </div>

          <DialogFooter className="border-white/10 bg-transparent px-2 py-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReasonOpen(false)}
              className="rounded-2xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
            >
              Close
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={submitReasonedStatusChange}
              className="rounded-2xl bg-rose-600 hover:bg-rose-500"
            >
              {pending ? "Saving..." : "Submit reason"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
