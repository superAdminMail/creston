import InvestmentOrderPaymentWorkspace from "./_components/InvestmentOrderPaymentWorkspace";
import { getInvestmentOrderPaymentDetails } from "./_lib/getInvestmentOrderPaymentDetails";

type PageProps = {
  params: Promise<{
    investmentOrderId: string;
  }>;
};

export default async function InvestmentOrderPaymentPage({
  params,
}: PageProps) {
  const { investmentOrderId } = await params;
  const order = await getInvestmentOrderPaymentDetails(investmentOrderId);

  return <InvestmentOrderPaymentWorkspace order={order} />;
}
