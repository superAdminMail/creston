import { DashboardOverviewShell } from "@/app/account/dashboard/_components/DashboardOverviewShell";
import { getDashboardOverviewByHref } from "@/lib/services/dashboard/dashboardOverviewService";

export default async function SuperAdminDashboardPage() {
  const overview = await getDashboardOverviewByHref(
    "/account/dashboard/super-admin",
  );

  return <DashboardOverviewShell {...overview} />;
}
