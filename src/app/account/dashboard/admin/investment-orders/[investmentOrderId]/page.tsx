import { notFound } from "next/navigation";

import { getAdminInvestmentOrderDetails } from "@/actions/admin/investment-order/getAdminInvestmentOrderDetails";
import { AdminInvestmentOrderDetailsClient } from "./_components/AdminInvestmentOrderDetailsClient";

type PageProps = {
  params: Promise<{
    investmentOrderId: string;
  }>;
};

export default async function AdminInvestmentOrderDetailsPage(props: PageProps) {
  const { investmentOrderId } = await props.params;
  const order = await getAdminInvestmentOrderDetails(investmentOrderId);

  if (!order) {
    notFound();
  }

  return <AdminInvestmentOrderDetailsClient order={order} />;
}
