import { InvestmentOrderStatus } from "@/generated/prisma";
import { getCurrentUserRole } from "@/lib/getCurrentUser";

export function formatStatusLabel(status: InvestmentOrderStatus) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function canConfirmInvestmentOrderStatus(status: InvestmentOrderStatus) {
  return (
    status === InvestmentOrderStatus.PAID ||
    status === InvestmentOrderStatus.PENDING_CONFIRMATION
  );
}

export async function assertAdminInvestmentOrderAccess() {
  const role = await getCurrentUserRole();

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
}
