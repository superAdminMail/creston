import { AdminOperationsShell } from "../_components/AdminOperationsShell";
import { getAdminAdjustmentPageData } from "@/actions/admin/adjustments/getAdminAdjustmentPageData";

import { AdminAdjustmentsClient } from "./_components/AdminAdjustmentsClient";

export default async function AdminAdjustmentsPage() {
  const data = await getAdminAdjustmentPageData();

  return (
    <AdminOperationsShell
      title="Adjustments"
      description="Add or deduct balance from an active investment order or savings account, with audit logging and user notifications."
      stats={[
        {
          title: "Adjustable targets",
          value: String(data.stats.totalTargets),
          hint: "Open investment orders and savings accounts that can be adjusted",
        },
        {
          title: "Investment orders",
          value: String(data.stats.investmentOrders),
          hint: "Confirmed, running investment orders currently available",
        },
        {
          title: "Savings accounts",
          value: String(data.stats.savingsAccounts),
          hint: "Savings account balances currently available",
        },
      ]}
    >
      <AdminAdjustmentsClient data={data} />
    </AdminOperationsShell>
  );
}
