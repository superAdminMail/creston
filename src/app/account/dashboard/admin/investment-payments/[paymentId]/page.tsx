import { getInvestmentPaymentReviewDetails } from "../_lib/getInvestmentPaymentReviewDetails";
import InvestmentPaymentReviewDetail from "../_components/InvestmentPaymentReviewDetail";

type PageProps = {
  params: Promise<{
    paymentId: string;
  }>;
};

export default async function AdminInvestmentPaymentDetailPage({
  params,
}: PageProps) {
  const { paymentId } = await params;
  const payment = await getInvestmentPaymentReviewDetails(paymentId);

  return <InvestmentPaymentReviewDetail payment={payment} />;
}
