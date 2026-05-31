import { notFound } from "next/navigation";

import { getAdminWithdrawalDetails } from "@/actions/admin/withdrawals/getAdminWithdrawalDetails";
import { AdminWithdrawalDetailsClient } from "../_components/AdminWithdrawalDetailsClient";

type PageProps = {
  params: Promise<{
    withdrawalId: string;
  }>;
};

export default async function AdminWithdrawalDetailsPage(props: PageProps) {
  const { withdrawalId } = await props.params;
  const withdrawal = await getAdminWithdrawalDetails(withdrawalId);

  if (!withdrawal) {
    notFound();
  }

  return (
    <AdminWithdrawalDetailsClient
      key={`${withdrawal.id}:${withdrawal.status}:${withdrawal.hasCommissionFees}:${withdrawal.commissionPercent}:${withdrawal.savingsFeeAmount ?? "null"}:${withdrawal.commissionStatus}:${withdrawal.processedAt ?? "null"}:${withdrawal.completedAt ?? "null"}:${withdrawal.rejectedAt ?? "null"}:${withdrawal.commissionPayment?.reviewStatus ?? "null"}`}
      withdrawal={withdrawal}
    />
  );
}
