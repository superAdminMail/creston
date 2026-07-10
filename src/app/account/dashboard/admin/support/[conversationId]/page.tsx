import SupportConversationDetailWorkspace from "@/components/support/SupportConversationDetailWorkspace";
import SupportConversationUnavailableState from "@/components/support/SupportConversationUnavailableState";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { getSupportConversationThread } from "@/lib/support/supportConversationService";

export default async function AdminSupportConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { userId, role } = await requireDashboardRoleAccess([
    "ADMIN",
    "SUPER_ADMIN",
  ]);

  const { conversationId } = await params;
  const conversation = await getSupportConversationThread({
    conversationId,
    viewerUserId: userId,
    viewerRole: role,
  });

  if (!conversation) {
    return (
      <SupportConversationUnavailableState backPath="/account/dashboard/admin/support" />
    );
  }

  return (
    <SupportConversationDetailWorkspace
      mode="staff"
      viewerId={userId}
      conversation={conversation}
    />
  );
}
