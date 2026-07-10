import SupportConversationDetailWorkspace from "@/components/support/SupportConversationDetailWorkspace";
import SupportConversationUnavailableState from "@/components/support/SupportConversationUnavailableState";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { getSupportConversationThread } from "@/lib/support/supportConversationService";

export default async function SuperAdminSupportConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { userId, role } = await requireDashboardRoleAccess(["SUPER_ADMIN"]);

  const { conversationId } = await params;
  const conversation = await getSupportConversationThread({
    conversationId,
    viewerUserId: userId,
    viewerRole: role,
  });

  if (!conversation) {
    return (
      <SupportConversationUnavailableState backPath="/account/dashboard/super-admin/support" />
    );
  }

  return (
    <div className="mx-auto min-h-[calc(100dvh-7rem)] max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <SupportConversationDetailWorkspace
        mode="staff"
        viewerId={userId}
        conversation={conversation}
        backPath="/account/dashboard/super-admin/support"
      />
    </div>
  );
}
