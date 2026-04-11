import { getDashboardResourceCollectionByHref } from "@/lib/services/dashboard/dashboardResourceService";
import { AdminResourceCollectionPage } from "../_components/AdminResourceCollectionPage";

export default async function AdminInvestorsPage() {
  const collection = await getDashboardResourceCollectionByHref(
    "/account/dashboard/admin/investors",
  );

  return (
    <AdminResourceCollectionPage
      title="Investor Profiles"
      description="Monitor investor onboarding and KYC progress."
      collection={collection}
    />
  );
}
