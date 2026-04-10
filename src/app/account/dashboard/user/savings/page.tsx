import { getUserSavingsAccounts } from "@/actions/savings/getUserSavingsAccounts";
import SavingsDashboard from "../_components/SavingsDashboard";

export default async function Page() {
  const accounts = await getUserSavingsAccounts();

  return (
    <div>
      <SavingsDashboard accounts={accounts} />
    </div>
  );
}
