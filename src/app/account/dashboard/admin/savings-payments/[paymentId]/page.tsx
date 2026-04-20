import SavingsPaymentReviewDetail from "../_components/SavingsPaymentReviewDetail";
import { getSavingsPaymentReviewDetails } from "../_lib/getSavingsPaymentReviewDetails";

export default async function AdminSavingsPaymentReviewPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const payment = await getSavingsPaymentReviewDetails(paymentId);

  return <SavingsPaymentReviewDetail payment={payment} />;
}
