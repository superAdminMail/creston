"use server";

import { getCurrentUserId, getCurrentUserRole } from "@/lib/getCurrentUser";
import { markSupportConversationRead } from "@/lib/support/supportConversationService";

export async function markConversationReadAction(conversationId: string) {
  const userId = await getCurrentUserId();
  const role = await getCurrentUserRole();
  if (!userId || !role) return;

  await markSupportConversationRead({
    conversationId,
    viewerUserId: userId,
    viewerRole: role,
  });
}
