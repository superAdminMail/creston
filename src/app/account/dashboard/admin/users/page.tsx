import { getDashboardResourceCollectionByHref } from "@/lib/services/dashboard/dashboardResourceService";
import { AdminResourceCollectionPage } from "../_components/AdminResourceCollectionPage";

export default async function AdminUsersPage() {
  const collection = await getDashboardResourceCollectionByHref(
    "/account/dashboard/admin/users",
  );

  return (
    <AdminResourceCollectionPage
      title="Users"
      description="Active user records"
      collection={collection}
    />
  );
}
