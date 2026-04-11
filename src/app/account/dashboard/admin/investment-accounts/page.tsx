import { getDashboardResourceCollectionByHref } from "@/lib/services/dashboard/dashboardResourceService";
import { AdminResourceCollectionPage } from "../_components/AdminResourceCollectionPage";

export default async function AdminInvestmentAccountsPage() {
  const collection = await getDashboardResourceCollectionByHref(
    "/account/dashboard/admin/investment-accounts",
  );

  return (
    <AdminResourceCollectionPage
      title="Investment Accounts"
      description="Track live investment account records, balances, and status changes."
      collection={collection}
    />
  );
}
