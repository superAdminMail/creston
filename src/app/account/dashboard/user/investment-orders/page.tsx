export const dynamic = "force-dynamic";

import { getUserInvestmentOrders } from "@/actions/investment-order/getUserInvestmentOrders";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { UserInvestmentsHeader } from "./_components/UserInvestmentsHeader";
import { UserInvestmentsList } from "./_components/UserInvestmentsList";

type UserInvestmentsPageProps = {
  searchParams?: Promise<{
    created?: string;
  }>;
};

export default async function UserInvestmentsPage({
  searchParams,
}: UserInvestmentsPageProps) {
  const data = await getUserInvestmentOrders();
  const site = await getSiteConfigurationCached();
  const siteName = site?.siteName ?? "";
  const params = searchParams ? await searchParams : undefined;
  const createdOrderId = params?.created ?? null;
  const showNewOrderButton = data.orders.length > 0;

  return (
    <div className="space-y-6">
      <UserInvestmentsHeader
        siteName={siteName}
        showNewOrderButton={showNewOrderButton}
      />
      <UserInvestmentsList
        data={data}
        createdOrderId={createdOrderId}
        siteName={siteName}
      />
    </div>
  );
}
