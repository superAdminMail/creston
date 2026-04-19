import { AdminInvestmentOrdersClient } from "@/app/account/dashboard/admin/investment-orders/_components/AdminInvestmentOrdersClient";
import { getAdminInvestmentOrders } from "@/actions/admin/investment-order/getAdminInvestmentOrders";

export const dynamic = "force-dynamic";

export default async function SuperAdminInvestmentOrdersPage() {
  const data = await getAdminInvestmentOrders();

  return <AdminInvestmentOrdersClient data={data} />;
}
