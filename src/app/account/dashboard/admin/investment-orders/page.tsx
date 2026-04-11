import { getAdminInvestmentOrders } from "@/actions/admin/investment-order/getAdminInvestmentOrders";
import { getDashboardResourceCollectionByHref } from "@/lib/services/dashboard/dashboardResourceService";
import { AdminInvestmentOrdersClient } from "./_components/AdminInvestmentOrdersClient";

export default async function AdminInvestmentOrdersPage() {
  const [data] = await Promise.all([
    getAdminInvestmentOrders(),
    getDashboardResourceCollectionByHref("/account/dashboard/admin/investment-orders"),
  ]);

  return <AdminInvestmentOrdersClient data={data} />;
}
