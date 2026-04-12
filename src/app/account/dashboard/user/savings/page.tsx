export const dynamic = "force-dynamic";

import { getSavingsPageData } from "@/actions/savings/getSavingsPageData";
import SavingsDashboard from "../_components/SavingsDashboard";

export default async function Page() {
  const data = await getSavingsPageData();

  return (
    <div>
      <SavingsDashboard
        accounts={data.accounts}
        kycStatus={data.kycStatus}
        canCreateSavingsAccount={data.canCreateSavingsAccount}
      />
    </div>
  );
}
