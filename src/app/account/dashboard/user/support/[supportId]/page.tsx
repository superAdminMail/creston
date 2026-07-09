import { notFound, redirect } from "next/navigation";

import SupportConversationDetailWorkspace from "@/components/support/SupportConversationDetailWorkspace";
import { getCurrentUserId, getCurrentUserRole } from "@/lib/getCurrentUser";
import { getSupportConversationThread } from "@/lib/support/supportConversationService";

export default async function SupportConversationPage({
  params,
}: {
  params: Promise<{ supportId: string }>;
}) {
  const userId = await getCurrentUserId();
  const role = await getCurrentUserRole();

  if (!userId || !role) {
    redirect("/auth/login");
  }

  const { supportId } = await params;
  const conversation = await getSupportConversationThread({
    conversationId: supportId,
    viewerUserId: userId,
    viewerRole: role,
  });

  if (!conversation) {
    notFound();
  }

  return (
    <SupportConversationDetailWorkspace
      mode="user"
      viewerId={userId}
      conversation={conversation}
    />
  );
}
