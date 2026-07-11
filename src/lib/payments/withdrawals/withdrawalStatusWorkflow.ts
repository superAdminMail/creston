import { CommissionStatus, Prisma, WithdrawalStatus } from "@/generated/prisma";

import { formatEnumLabel } from "@/lib/formatters/formatters";

const terminalStatuses = new Set<WithdrawalStatus>([
  WithdrawalStatus.COMPLETED,
  WithdrawalStatus.REJECTED,
  WithdrawalStatus.CANCELLED,
]);

export type WithdrawalStatusActionOption = {
  status: WithdrawalStatus;
  label: string;
  description: string;
  disabled: boolean;
  isCurrent: boolean;
  requiresReason: boolean;
};

export function isWithdrawalTerminalStatus(status: WithdrawalStatus | string) {
  return terminalStatuses.has(status as WithdrawalStatus);
}

export function canTransitionWithdrawalStatus(
  currentStatus: WithdrawalStatus | string,
  nextStatus: WithdrawalStatus | string,
) {
  if (currentStatus === nextStatus) {
    return true;
  }

  if (isWithdrawalTerminalStatus(currentStatus)) {
    return false;
  }

  return true;
}

export function getWithdrawalStatusActionLabel(status: WithdrawalStatus | string) {
  return `Mark as ${formatEnumLabel(status)}`;
}

export function getWithdrawalStatusActionDescription(
  status: WithdrawalStatus | string,
) {
  switch (status) {
    case WithdrawalStatus.PENDING:
      return "Move this withdrawal back to pending review.";
    case WithdrawalStatus.APPROVED:
      return "Mark this withdrawal as approved.";
    case WithdrawalStatus.PROCESSING:
      return "Mark this withdrawal as processing.";
    case WithdrawalStatus.COMPLETED:
      return "Mark this withdrawal as completed and close the lifecycle.";
    case WithdrawalStatus.REJECTED:
      return "Mark this withdrawal as rejected.";
    case WithdrawalStatus.CANCELLED:
      return "Mark this withdrawal as cancelled.";
  }

  return formatEnumLabel(status);
}

export function isWithdrawalCompletedStatus(status: WithdrawalStatus | string) {
  return status === WithdrawalStatus.COMPLETED;
}

export function getWithdrawalTerminalStatusTitle(
  status: WithdrawalStatus | string,
) {
  switch (status) {
    case WithdrawalStatus.COMPLETED:
      return "This withdrawal has been completed successfully.";
    case WithdrawalStatus.CANCELLED:
      return "This withdrawal request was cancelled.";
    case WithdrawalStatus.REJECTED:
      return "This withdrawal request was rejected.";
    default:
      return "This withdrawal request is no longer active.";
  }
}

export function getWithdrawalTerminalStatusDescription(
  status: WithdrawalStatus | string,
) {
  switch (status) {
    case WithdrawalStatus.COMPLETED:
      return "The payout lifecycle is closed and no further action is required.";
    case WithdrawalStatus.CANCELLED:
      return "The request was cancelled and no further payout action is required.";
    case WithdrawalStatus.REJECTED:
      return "The request was rejected and no further payout action is required.";
    default:
      return "No further action is available for this request.";
  }
}

export function getWithdrawalTerminalStatusReasonLabel(
  status: WithdrawalStatus | string,
) {
  switch (status) {
    case WithdrawalStatus.COMPLETED:
      return "Completion note";
    case WithdrawalStatus.CANCELLED:
      return "Cancellation reason";
    case WithdrawalStatus.REJECTED:
      return "Rejection reason";
    default:
      return "Reason";
  }
}

export function getWithdrawalTerminalStatusFallbackReason(
  status: WithdrawalStatus | string,
) {
  switch (status) {
    case WithdrawalStatus.COMPLETED:
      return "This withdrawal was completed successfully.";
    case WithdrawalStatus.CANCELLED:
      return "Your withdrawal request was cancelled by the admin team.";
    case WithdrawalStatus.REJECTED:
      return "Your withdrawal request was rejected by the admin team.";
    default:
      return "No terminal reason was recorded.";
  }
}

export function requiresWithdrawalStatusReason(
  status: WithdrawalStatus | string,
) {
  return (
    status === WithdrawalStatus.REJECTED ||
    status === WithdrawalStatus.CANCELLED
  );
}

export function getWithdrawalStatusTone(status: WithdrawalStatus | string) {
  switch (status) {
    case WithdrawalStatus.PENDING:
      return "bg-amber-100 text-amber-900 border-amber-300/50 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-400/20";
    case WithdrawalStatus.APPROVED:
      return "bg-sky-100 text-sky-900 border-sky-300/50 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-400/20";
    case WithdrawalStatus.PROCESSING:
      return "bg-orange-100 text-orange-900 border-orange-300/50 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-400/20";
    case WithdrawalStatus.COMPLETED:
      return "bg-emerald-50 text-emerald-800 border-emerald-200/70 shadow-[0_0_0_1px_rgba(16,185,129,0.06)] dark:bg-emerald-500/10 dark:text-emerald-100 dark:border-emerald-400/20";
    case WithdrawalStatus.REJECTED:
      return "bg-rose-100 text-rose-900 border-rose-300/50 dark:bg-red-500/10 dark:text-red-300 dark:border-red-400/20";
    case WithdrawalStatus.CANCELLED:
      return "bg-slate-100 text-slate-900 border-slate-300/50 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-400/20";
  }
}

export function getWithdrawalStatusActionOptions(
  currentStatus: WithdrawalStatus | string,
): WithdrawalStatusActionOption[] {
  return [
    WithdrawalStatus.PENDING,
    WithdrawalStatus.APPROVED,
    WithdrawalStatus.PROCESSING,
    WithdrawalStatus.COMPLETED,
    WithdrawalStatus.REJECTED,
    WithdrawalStatus.CANCELLED,
  ].map((status) => ({
    status,
    label: getWithdrawalStatusActionLabel(status),
    description: getWithdrawalStatusActionDescription(status),
    disabled:
      status === currentStatus ||
      (isWithdrawalTerminalStatus(currentStatus) && status !== currentStatus),
    isCurrent: status === currentStatus,
    requiresReason: requiresWithdrawalStatusReason(status),
  }));
}

export function getWithdrawalStatusTransitionError(
  currentStatus: WithdrawalStatus | string,
  nextStatus: WithdrawalStatus | string,
) {
  if (currentStatus === nextStatus) {
    return `Withdrawal is already marked as ${formatEnumLabel(nextStatus)}.`;
  }

  if (isWithdrawalTerminalStatus(currentStatus)) {
    return `This withdrawal is already ${formatEnumLabel(currentStatus).toLowerCase()} and cannot be moved to another status.`;
  }

  return null;
}

export function getWithdrawalStatusLifecyclePatch(
  nextStatus: WithdrawalStatus,
  now: Date,
  reason?: string | null,
) : Prisma.WithdrawalOrderUpdateInput {
  const normalizedReason = reason?.trim() || null;

  switch (nextStatus) {
    case WithdrawalStatus.PENDING:
      return {
        status: nextStatus,
        processedAt: null,
        completedAt: null,
        rejectedAt: null,
        rejectionReason: null,
      };
    case WithdrawalStatus.APPROVED:
    case WithdrawalStatus.PROCESSING:
      return {
        status: nextStatus,
        processedAt: now,
        completedAt: null,
        rejectedAt: null,
        rejectionReason: null,
      };
    case WithdrawalStatus.COMPLETED:
      return {
        status: nextStatus,
        processedAt: now,
        completedAt: now,
        rejectedAt: null,
        rejectionReason: null,
      };
    case WithdrawalStatus.REJECTED:
    case WithdrawalStatus.CANCELLED:
      return {
        status: nextStatus,
        processedAt: now,
        completedAt: null,
        rejectedAt: nextStatus === WithdrawalStatus.REJECTED ? now : null,
        commissionStatus: CommissionStatus.VOID,
        rejectionReason: normalizedReason,
      };
  }

  return {};
}

export function getWithdrawalStatusSuccessMessage(status: WithdrawalStatus) {
  switch (status) {
    case WithdrawalStatus.COMPLETED:
      return "Withdrawal completed successfully.";
    case WithdrawalStatus.CANCELLED:
      return "Withdrawal cancelled successfully.";
    case WithdrawalStatus.REJECTED:
      return "Withdrawal rejected successfully.";
    default:
      return `Withdrawal marked as ${formatEnumLabel(status).toLowerCase()}.`;
  }
}

export function getWithdrawalReceiptStatusHelperText(
  status: WithdrawalStatus | string,
) {
  switch (status) {
    case WithdrawalStatus.COMPLETED:
      return "This request has been completed successfully.";
    case WithdrawalStatus.CANCELLED:
      return "This request was cancelled.";
    case WithdrawalStatus.REJECTED:
      return "This request was rejected.";
    default:
      return "This request is still active.";
  }
}
