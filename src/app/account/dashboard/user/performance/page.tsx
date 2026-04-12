export const dynamic = "force-dynamic";

import { getUserPerformanceDataAction } from "@/actions/dashboard/get-user-performance-data";
import { UserPerformancePageClient } from "./_components/UserPerformancePageClient";

export default async function PerformancePage() {
  const data = await getUserPerformanceDataAction();

  return <UserPerformancePageClient data={data} />;
}
