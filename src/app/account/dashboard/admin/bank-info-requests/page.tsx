import { getInvestmentBankInfoRequests } from "../investment-payments/_lib/getInvestmentBankInfoRequests";
import BankInfoRequestsClient from "./_components/BankInfoRequestsClient";

const Page = async () => {
  const bankInfoRequests = await getInvestmentBankInfoRequests();

  return <BankInfoRequestsClient bankInfoRequests={bankInfoRequests} />;
};

export default Page;
