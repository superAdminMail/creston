import { DashboardUserDirectory } from "../../_components/DashboardUserDirectory";
import { getDashboardUserDirectoryByHref } from "@/lib/services/dashboard/dashboardUserDirectoryService";

export default async function AdminUsersPage() {
  const data = await getDashboardUserDirectoryByHref(
    "/account/dashboard/admin/users",
  );

  return (
    <DashboardUserDirectory
      badgeLabel="Havenstone Admin"
      title="Users"
      description="Monitor active user records, review verification progress, and keep account operations visible from the admin workspace."
      cardTitle="Users"
      cardDescription="Dynamic user records available to the admin team."
      searchPlaceholder="Search users by name, email, role, or joined date..."
      users={data.users}
      stats={data.stats}
    />
  );
}
