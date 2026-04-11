import AddSavingsAccount from "../../_components/AddSavingsAccount";

import { getSavingsPageData } from "@/actions/savings/getSavingsPageData";

export default async function NewSavingsAccountPage() {
  const data = await getSavingsPageData();

  return (
    <AddSavingsAccount
      initialProducts={data.products}
      kycStatus={data.kycStatus}
      canCreateSavingsAccount={data.canCreateSavingsAccount}
    />
  );
}
