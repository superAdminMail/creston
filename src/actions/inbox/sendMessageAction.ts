"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUserId, getCurrentUserRole } from "@/lib/getCurrentUser";
import {
  replyToSupportConversation,
  isSupportStaff,
} from "@/lib/support/supportConversationService";

export async function sendMessageAction({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}) {
  const userId = await getCurrentUserId();
  const role = await getCurrentUserRole();
  if (!userId || !role) return { error: "Unauthorized" };

  if (isSupportStaff(role)) {
    return { error: "Unauthorized" };
  }

  const text = content.trim();
  if (!text) {
    return { error: "Message cannot be empty" };
  }

  await replyToSupportConversation({
    conversationId,
    viewerUserId: userId,
    viewerRole: role,
    content: text,
  });

  revalidatePath("/account/dashboard/user/support");
  revalidatePath("/account/dashboard/admin/support");

  return { success: true };
}
