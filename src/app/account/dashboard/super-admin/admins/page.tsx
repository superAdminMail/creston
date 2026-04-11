import { DashboardUserDirectory } from "../../_components/DashboardUserDirectory";
import { getDashboardUserDirectoryByHref } from "@/lib/services/dashboard/dashboardUserDirectoryService";

export default async function SuperAdminAdminsPage() {
  const data = await getDashboardUserDirectoryByHref(
    "/account/dashboard/super-admin/admins",
  );

  return (
    <DashboardUserDirectory
      badgeLabel="Havenstone Super Admin"
      title="Admin Directory"
      description="Review admin accounts, track operational access, and keep high-trust staff records visible from one consistent interface."
      cardTitle="Admins"
      cardDescription="Dynamic admin records available to the super admin team."
      searchPlaceholder="Search admins by name, email, or joined date..."
      users={data.users}
      stats={data.stats}
    />
  );
}
