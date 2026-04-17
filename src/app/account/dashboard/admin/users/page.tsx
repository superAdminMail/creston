import { DashboardUserDirectory } from "../../_components/DashboardUserDirectory";
import { getDashboardUserDirectoryByHref } from "@/lib/services/dashboard/dashboardUserDirectoryService";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

export default async function AdminUsersPage() {
  const site = await getSiteConfigurationCached();
  const siteName = site?.siteName?.trim() || "Company";
  const data = await getDashboardUserDirectoryByHref(
    "/account/dashboard/admin/users",
  );

  return (
    <DashboardUserDirectory
      badgeLabel={`${siteName} Admin`}
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
