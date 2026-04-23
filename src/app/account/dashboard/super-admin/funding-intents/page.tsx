import { getSuperAdminFundingIntents } from "@/actions/super-admin/funding-intents/getSuperAdminFundingIntents";

import { FundingIntentsClient } from "./_components/FundingIntentsClient";

export const dynamic = "force-dynamic";

export default async function FundingIntentsPage() {
  const data = await getSuperAdminFundingIntents();

  return <FundingIntentsClient initialData={data} />;
}
