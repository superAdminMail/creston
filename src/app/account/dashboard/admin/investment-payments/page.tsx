import InvestmentPaymentReviewList from "./_components/InvestmentPaymentReviewList";
import { getInvestmentBankInfoRequests } from "./_lib/getInvestmentBankInfoRequests";
import { getInvestmentPaymentReviewList } from "./_lib/getInvestmentPaymentReviewList";

export default async function AdminInvestmentPaymentsPage() {
  const [payments, bankInfoRequests] = await Promise.all([
    getInvestmentPaymentReviewList(),
    getInvestmentBankInfoRequests(),
  ]);

  return (
    <InvestmentPaymentReviewList
      payments={payments}
      bankInfoRequests={bankInfoRequests}
    />
  );
}
