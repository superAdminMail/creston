"use client";

import type { WithdrawalStatus } from "@/generated/prisma";

import {
  getWithdrawalTerminalStatusDescription,
  getWithdrawalTerminalStatusFallbackReason,
  getWithdrawalTerminalStatusReasonLabel,
  getWithdrawalTerminalStatusTitle,
  isWithdrawalCompletedStatus,
} from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";
import { cn } from "@/lib/utils";

type WithdrawalTerminalNoticeProps = {
  status: WithdrawalStatus | string;
  reason?: string | null;
  variant?: "receipt" | "compact";
  className?: string;
};

export function WithdrawalTerminalNotice({
  status,
  reason,
  variant = "receipt",
  className,
}: WithdrawalTerminalNoticeProps) {
  const isCompleted = isWithdrawalCompletedStatus(status);
  const toneClassName = isCompleted
    ? variant === "compact"
      ? "border-emerald-200/50 bg-emerald-50/80 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100"
      : "border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/80 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-50"
    : variant === "compact"
      ? "border-rose-200/40 bg-rose-500/10 text-rose-700 dark:border-rose-400/20 dark:text-rose-100"
      : "border-rose-400/20 bg-rose-500/10 text-rose-950 dark:text-rose-50";

  const titleToneClassName = isCompleted
    ? variant === "compact"
      ? "text-emerald-700 dark:text-emerald-200"
      : "text-emerald-700 dark:text-emerald-200"
    : variant === "compact"
      ? "text-rose-700 dark:text-rose-200"
      : "text-rose-700 dark:text-rose-200";

  const descriptionToneClassName = isCompleted
    ? variant === "compact"
      ? "text-emerald-700/90 dark:text-emerald-100/80"
      : "text-emerald-900/90 dark:text-emerald-100/90"
    : variant === "compact"
      ? "text-rose-700/90 dark:text-rose-100/80"
      : "text-rose-100/90";

  const bodyToneClassName = isCompleted
    ? variant === "compact"
      ? "text-emerald-700/90 dark:text-emerald-100/80"
      : "text-emerald-700 dark:text-emerald-100/80"
    : variant === "compact"
      ? "text-rose-700/90 dark:text-rose-100/80"
      : "text-rose-100/80";
  const showReasonLine = !isCompleted || Boolean(reason?.trim());

  return (
    <div
      className={cn(
        variant === "compact"
          ? "rounded-xl border p-3 text-xs"
          : "rounded-2xl border p-5 shadow-sm",
        toneClassName,
        className,
      )}
    >
      <p
        className={cn(
          "text-[10px] uppercase tracking-[0.24em]",
          titleToneClassName,
        )}
      >
        {getWithdrawalTerminalStatusTitle(status)}
      </p>
      <p
        className={cn(
          variant === "compact"
            ? "mt-1 text-sm font-medium"
            : "mt-2 text-lg font-medium",
          descriptionToneClassName,
        )}
      >
        {getWithdrawalTerminalStatusDescription(status)}
      </p>
      {showReasonLine ? (
        <p
          className={cn(
            variant === "compact" ? "mt-2 block" : "mt-1",
            bodyToneClassName,
          )}
        >
          {getWithdrawalTerminalStatusReasonLabel(status)}:{" "}
          {reason ?? getWithdrawalTerminalStatusFallbackReason(status)}
        </p>
      ) : null}
    </div>
  );
}
