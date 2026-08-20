import { redirect } from "next/navigation";

import SupportInboxWorkspace from "@/components/support/SupportInboxWorkspace";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { getSupportInboxConversations } from "@/lib/support/supportConversationService";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

export default async function SuperAdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const { userId, role } = await requireDashboardRoleAccess(["SUPER_ADMIN"]);

  const { conversation } = await searchParams;
  if (conversation) {
    redirect(`/account/dashboard/super-admin/support/${conversation}`);
  }

  const site = await getSiteConfigurationCached();
  const siteName = site?.siteName?.trim() || "Company";

  const inbox = await getSupportInboxConversations({
    viewerUserId: userId,
    viewerRole: role,
    mode: "staff",
    sort: "latest",
  });

  return (
    <div className="mx-auto min-h-[calc(100dvh-7rem)] max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <SupportInboxWorkspace
        siteName={siteName}
        mode="staff"
        viewerId={userId}
        viewerRole={role}
        initialConversations={inbox}
        detailBasePath="/account/dashboard/super-admin/support"
      />
    </div>
  );
}
