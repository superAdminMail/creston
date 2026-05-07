import { AdminOperationsShell } from "../_components/AdminOperationsShell";
import { getAdminAdjustmentPageData } from "@/actions/admin/adjustments/getAdminAdjustmentPageData";

import { AdminAdjustmentsClient } from "./_components/AdminAdjustmentsClient";

export default async function AdminAdjustmentsPage() {
  const data = await getAdminAdjustmentPageData();

  return (
    <AdminOperationsShell
      title="Adjustments"
      description="Add or deduct balance from an active investment or savings account, with audit logging and user notifications."
      stats={[
        {
          title: "Adjustable accounts",
          value: String(data.stats.totalAccounts),
          hint: "Open investment and savings accounts that can be adjusted",
        },
        {
          title: "Investment accounts",
          value: String(data.stats.investmentAccounts),
          hint: "Investment account balances currently available",
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
