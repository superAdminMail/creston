import { InvestmentOrderStatus, RuntimeStatus } from "@/generated/prisma";
import { getCurrentUserRole } from "@/lib/getCurrentUser";

export function formatStatusLabel(status: InvestmentOrderStatus) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function canConfirmInvestmentOrderStatus(status: InvestmentOrderStatus) {
  return status === InvestmentOrderStatus.PAID;
}

export function canPauseInvestmentOrderRuntimeStatus(
  status: InvestmentOrderStatus,
  runtimeStatus: RuntimeStatus,
) {
  return (
    status === InvestmentOrderStatus.CONFIRMED &&
    (runtimeStatus === RuntimeStatus.ONGOING ||
      runtimeStatus === RuntimeStatus.ACTIVE)
  );
}

export function canResumeInvestmentOrderRuntimeStatus(
  status: InvestmentOrderStatus,
  runtimeStatus: RuntimeStatus,
) {
  return (
    status === InvestmentOrderStatus.CONFIRMED &&
    runtimeStatus === RuntimeStatus.PAUSED
  );
}

export async function assertAdminInvestmentOrderAccess() {
  const role = await getCurrentUserRole();

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
}
