"use client";

import { useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateWithdrawalCommissionStatusAction } from "@/actions/admin/withdrawals/updateWithdrawalCommissionStatus";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CommissionStatus } from "@/generated/prisma";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";
import {
  getWithdrawalCommissionStatusActionOptions,
} from "@/lib/payments/withdrawals/withdrawalCommissionStatusWorkflow";

export function WithdrawalCommissionStatusActionMenu({
  withdrawalId,
  status,
}: {
  withdrawalId: string;
  status: CommissionStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const options = getWithdrawalCommissionStatusActionOptions(status);

  function handleStatusChange(nextStatus: CommissionStatus) {
    startTransition(async () => {
      const result = await updateWithdrawalCommissionStatusAction({
        withdrawalId,
        status: nextStatus,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-2xl border-border/60 bg-white/95 text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white"
          disabled={pending}
          aria-label="Change commission status"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 rounded-2xl border border-border/60 bg-white/95 p-1 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-950/95 dark:text-white dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.status}
            disabled={option.disabled || pending}
            onSelect={() => {
              if (option.disabled) {
                return;
              }

              handleStatusChange(option.status);
            }}
            className={cn(
              "flex items-start gap-3 rounded-xl px-3 py-2 text-sm",
              option.isCurrent &&
                "bg-sky-500/10 text-slate-950 dark:bg-white/5 dark:text-white",
            )}
          >
            <div className="min-w-0 space-y-1">
              <p className="font-medium text-slate-950 dark:text-white">
                {option.isCurrent
                  ? `Current: ${formatEnumLabel(option.status)}`
                  : option.label}
              </p>
              <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                {option.description}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
