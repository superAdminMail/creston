import { notFound } from "next/navigation";

import SupportConversationDetailWorkspace from "@/components/support/SupportConversationDetailWorkspace";
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
    notFound();
  }

  return (
    <div className="mx-auto min-h-[calc(100dvh-7rem)] max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
      <SupportConversationDetailWorkspace
        mode="staff"
        viewerId={userId}
        conversation={conversation}
      />
    </div>
  );
}
