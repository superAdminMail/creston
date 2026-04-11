import { DashboardUserDirectory } from "../../_components/DashboardUserDirectory";
import { getDashboardUserDirectoryByHref } from "@/lib/services/dashboard/dashboardUserDirectoryService";

export default async function SuperAdminUsersPage() {
  const data = await getDashboardUserDirectoryByHref(
    "/account/dashboard/super-admin/users",
  );

  return (
    <DashboardUserDirectory
      badgeLabel="Havenstone Super Admin"
      title="User Management"
      description="Review user accounts, monitor verification progress, and inspect savings and investment activity from a live administrative control center."
      cardTitle="Users"
      cardDescription="Dynamic user records available to the super admin team."
      searchPlaceholder="Search users by name, email, role, or joined date..."
      users={data.users}
      stats={data.stats}
    />
  );
}
