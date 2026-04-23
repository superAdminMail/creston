export const dynamic = "force-dynamic";

import { getAdminAnalyticsData } from "@/lib/service/getAdminAnalyticsData";

import { SuperAdminAnalyticsClient } from "./_components/SuperAdminAnalyticsClient";

export default async function SuperAdminAnalyticsPage() {
  const data = await getAdminAnalyticsData();

  return <SuperAdminAnalyticsClient data={data} />;
}
