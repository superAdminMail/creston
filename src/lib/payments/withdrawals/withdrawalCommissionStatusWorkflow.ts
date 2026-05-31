import { CommissionStatus } from "@/generated/prisma";

import { formatEnumLabel } from "@/lib/formatters/formatters";

const terminalStatuses = new Set<CommissionStatus>([
  CommissionStatus.PAID,
  CommissionStatus.CANCELLED,
  CommissionStatus.VOID,
]);

export type WithdrawalCommissionStatusActionOption = {
  status: CommissionStatus;
  label: string;
  description: string;
  disabled: boolean;
  isCurrent: boolean;
};

export function isWithdrawalCommissionTerminalStatus(
  status: CommissionStatus | string,
) {
  return terminalStatuses.has(status as CommissionStatus);
}

export function isWithdrawalCommissionSettledStatus(
  status: CommissionStatus | string,
) {
  return isWithdrawalCommissionTerminalStatus(status);
}

export function canTransitionWithdrawalCommissionStatus(
  currentStatus: CommissionStatus | string,
  nextStatus: CommissionStatus | string,
) {
  if (currentStatus === nextStatus) {
    return true;
  }

  if (isWithdrawalCommissionTerminalStatus(currentStatus)) {
    return false;
  }

  return true;
}

export function getWithdrawalCommissionStatusActionLabel(
  status: CommissionStatus | string,
) {
  return `Mark as ${formatEnumLabel(status)}`;
}

export function getWithdrawalCommissionStatusActionDescription(
  status: CommissionStatus | string,
) {
  switch (status) {
    case CommissionStatus.PENDING:
      return "Move this commission back to pending review.";
    case CommissionStatus.PARTIALLY_PAID:
      return "Mark this commission as partially paid.";
    case CommissionStatus.PAID:
      return "Mark this commission as fully paid and settled.";
    case CommissionStatus.CANCELLED:
      return "Cancel this commission workflow.";
    case CommissionStatus.VOID:
      return "Void this commission state.";
  }

  return formatEnumLabel(status);
}

export function getWithdrawalCommissionStatusTone(
  status: CommissionStatus | string,
) {
  switch (status) {
    case CommissionStatus.PENDING:
      return "bg-amber-500/10 text-amber-300 border-amber-400/20";
    case CommissionStatus.PARTIALLY_PAID:
      return "bg-sky-500/10 text-sky-300 border-sky-400/20";
    case CommissionStatus.PAID:
      return "bg-emerald-500/10 text-emerald-300 border-emerald-400/20";
    case CommissionStatus.CANCELLED:
      return "bg-red-500/10 text-red-300 border-red-400/20";
    case CommissionStatus.VOID:
      return "bg-slate-500/10 text-slate-300 border-slate-400/20";
  }
}

export function getWithdrawalCommissionStatusActionOptions(
  currentStatus: CommissionStatus | string,
): WithdrawalCommissionStatusActionOption[] {
  return [
    CommissionStatus.PENDING,
    CommissionStatus.PARTIALLY_PAID,
    CommissionStatus.PAID,
    CommissionStatus.CANCELLED,
    CommissionStatus.VOID,
  ].map((status) => ({
    status,
    label: getWithdrawalCommissionStatusActionLabel(status),
    description: getWithdrawalCommissionStatusActionDescription(status),
    disabled:
      status === currentStatus ||
      (isWithdrawalCommissionTerminalStatus(currentStatus) &&
        status !== currentStatus),
    isCurrent: status === currentStatus,
  }));
}

export function getWithdrawalCommissionStatusTransitionError(
  currentStatus: CommissionStatus | string,
  nextStatus: CommissionStatus | string,
) {
  if (currentStatus === nextStatus) {
    return `Commission is already marked as ${formatEnumLabel(nextStatus)}.`;
  }

  if (isWithdrawalCommissionTerminalStatus(currentStatus)) {
    return `This commission is already ${formatEnumLabel(currentStatus).toLowerCase()} and cannot be moved to another status.`;
  }

  return null;
}

export function getWithdrawalCommissionStatusSuccessMessage(
  status: CommissionStatus,
) {
  return `Commission marked as ${formatEnumLabel(status).toLowerCase()}.`;
}
