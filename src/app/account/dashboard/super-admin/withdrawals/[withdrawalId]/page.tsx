import { notFound } from "next/navigation";

import { getAdminWithdrawalDetails } from "@/actions/admin/withdrawals/getAdminWithdrawalDetails";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";

import { AdminWithdrawalDetailsClient } from "../../../admin/Withdrawals/_components/AdminWithdrawalDetailsClient";

type PageProps = {
  params: Promise<{
    withdrawalId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function SuperAdminWithdrawalDetailsPage(
  props: PageProps,
) {
  await requireDashboardRoleAccess(["SUPER_ADMIN"]);

  const { withdrawalId } = await props.params;
  const withdrawal = await getAdminWithdrawalDetails(withdrawalId);

  if (!withdrawal) {
    notFound();
  }

  return (
    <AdminWithdrawalDetailsClient
      key={`${withdrawal.id}:${withdrawal.status}:${withdrawal.hasCommissionFees}:${withdrawal.commissionPercent}:${withdrawal.savingsFeeAmount ?? "null"}:${withdrawal.commissionStatus}:${withdrawal.processedAt ?? "null"}:${withdrawal.completedAt ?? "null"}:${withdrawal.rejectedAt ?? "null"}:${withdrawal.commissionPayment?.reviewStatus ?? "null"}:${withdrawal.feePayment?.reviewStatus ?? "null"}:${withdrawal.feePayment?.submittedAt ?? "null"}`}
      withdrawal={withdrawal}
      backHref="/account/dashboard/super-admin/withdrawals"
      backLabel="Back to withdrawals"
      headerLabel="Withdrawal receipt"
      headerDescription="Super-admin receipt view for payout review, payment availability, and lifecycle controls."
    />
  );
}
