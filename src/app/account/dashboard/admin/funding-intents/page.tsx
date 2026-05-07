import { getFundingIntents } from "@/actions/funding-intents/getFundingIntents";

import { FundingIntentsClient } from "../../super-admin/funding-intents/_components/FundingIntentsClient";

export const dynamic = "force-dynamic";

export default async function FundingIntentsPage() {
  const data = await getFundingIntents();

  return (
    <FundingIntentsClient
      initialData={data}
      detailsBaseHref="/account/dashboard/admin/investment-orders"
      secondaryAction={{
        href: "/account/dashboard/admin/investment-payments",
        label: "View payment reviews",
      }}
    />
  );
}
