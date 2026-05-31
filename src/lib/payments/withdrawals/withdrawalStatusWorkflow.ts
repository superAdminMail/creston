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
      return "bg-amber-500/10 text-amber-300 border-amber-400/20";
    case WithdrawalStatus.APPROVED:
      return "bg-blue-500/10 text-blue-300 border-blue-400/20";
    case WithdrawalStatus.PROCESSING:
      return "bg-amber-500/10 text-amber-300 border-amber-400/20";
    case WithdrawalStatus.COMPLETED:
      return "bg-emerald-500/10 text-emerald-300 border-emerald-400/20";
    case WithdrawalStatus.REJECTED:
      return "bg-red-500/10 text-red-300 border-red-400/20";
    case WithdrawalStatus.CANCELLED:
      return "bg-slate-500/10 text-slate-300 border-slate-400/20";
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
  return `Withdrawal marked as ${formatEnumLabel(status).toLowerCase()}.`;
}
