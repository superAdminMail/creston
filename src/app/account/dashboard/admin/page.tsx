import { DashboardOverviewShell } from "@/app/account/dashboard/_components/DashboardOverviewShell";
import { getDashboardOverviewByHref } from "@/lib/services/dashboard/dashboardOverviewService";

export default async function AdminDashboardPage() {
  const overview = await getDashboardOverviewByHref("/account/dashboard/admin");

  return <DashboardOverviewShell {...overview} />;
}
