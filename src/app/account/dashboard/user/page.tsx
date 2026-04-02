import { getUserDashboardDataAction } from "@/actions/dashboard/get-user-dashboard-data";
import UserDashboardPage from "./UserDashboardPage";

export default async function Page() {
  const { userName, stats } = await getUserDashboardDataAction();

  return <UserDashboardPage userName={userName} stats={stats} />;
}
