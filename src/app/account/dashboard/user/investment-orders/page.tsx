import { getUserInvestmentOrders } from "@/actions/investment-order/getUserInvestmentOrders";
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
  const params = searchParams ? await searchParams : undefined;
  const createdOrderId = params?.created ?? null;

  return (
    <div className="space-y-6">
      <UserInvestmentsHeader />
      <UserInvestmentsList data={data} createdOrderId={createdOrderId} />
    </div>
  );
}
