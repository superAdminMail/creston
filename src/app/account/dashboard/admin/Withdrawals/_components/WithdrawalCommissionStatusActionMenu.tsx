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
          className="h-10 w-10 rounded-2xl border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] hover:text-white"
          disabled={pending}
          aria-label="Change commission status"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 rounded-2xl border border-white/10 bg-[#081224] p-1 text-white"
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
  );
}
