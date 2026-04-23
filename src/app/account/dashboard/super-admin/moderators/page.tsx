import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { DashboardUserDirectory } from "../../_components/DashboardUserDirectory";
import { getDashboardUserDirectoryByHref } from "@/lib/services/dashboard/dashboardUserDirectoryService";

export default async function SuperAdminModeratorsPage() {
  const site = await getSiteConfigurationCached();
  const data = await getDashboardUserDirectoryByHref(
    "/account/dashboard/super-admin/moderators",
  );

  return (
    <DashboardUserDirectory
      badgeLabel={`${site?.siteName?.trim() || "Company"} Super Admin`}
      title="Moderator Directory"
      description="Track moderator coverage, review staff verification, and monitor operational records from the same premium control surface."
      cardTitle="Moderators"
      cardDescription="Dynamic moderator records available to the super admin team."
      searchPlaceholder="Search moderators by name, email, or joined date..."
      users={data.users}
      stats={data.stats}
    />
  );
}
