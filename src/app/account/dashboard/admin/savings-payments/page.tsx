import SavingsPaymentReviewList from "./_components/SavingsPaymentReviewList";
import { getSavingsPaymentReviewList } from "./_lib/getSavingsPaymentReviewList";

export default async function AdminSavingsPaymentsPage() {
  const payments = await getSavingsPaymentReviewList();

  return <SavingsPaymentReviewList payments={payments} />;
}
