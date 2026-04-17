"use server";

import { revalidatePath } from "next/cache";

import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { assignSupportConversationToMe } from "@/lib/support/supportConversationService";

export async function assignSupportConversationToMeAction(conversationId: string) {
  const admin = await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  try {
    await assignSupportConversationToMe({
      conversationId,
      viewerUserId: admin.userId,
      viewerRole: admin.role,
    });

    revalidatePath("/account/dashboard/admin/support");
    revalidatePath(`/account/dashboard/admin/support/${conversationId}`);

    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to assign conversation",
    };
  }
}
