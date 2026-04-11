import { getDashboardResourceCollectionByHref } from "@/lib/services/dashboard/dashboardResourceService";
import { AdminResourceCollectionPage } from "../_components/AdminResourceCollectionPage";

export default async function AdminSavingsAccountsPage() {
  const collection = await getDashboardResourceCollectionByHref(
    "/account/dashboard/admin/savings-accounts",
  );

  return (
    <AdminResourceCollectionPage
      title="Savings Accounts"
      description="Review saver accounts, product alignment, and account status."
      collection={collection}
    />
  );
}
