import { getCurrentUserInvestmentAccountsAction } from "@/actions/accounts/get-current-user-investment-accounts";
import { UserInvestmentAccountsPage } from "./UserInvestmentAccountsPage";

export default async function UserInvestmentAccountsPageRoute() {
  const data = await getCurrentUserInvestmentAccountsAction();

  return <UserInvestmentAccountsPage data={data} />;
}
