import { RuntimeStatus } from "@/generated/prisma";
import { formatEnumLabel } from "@/lib/formatters/formatters";

export function formatInvestmentOrderRuntimeStatusLabel(status: string) {
  switch (status) {
    case RuntimeStatus.PAUSED:
      return "Inactive";
    case RuntimeStatus.ONGOING:
    case RuntimeStatus.ACTIVE:
      return "Ongoing";
    default:
      return formatEnumLabel(status);
  }
}

export function isInactiveInvestmentOrderRuntimeStatus(status: string) {
  return status === RuntimeStatus.PAUSED;
}
