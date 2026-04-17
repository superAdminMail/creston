"use server";

import { revalidatePath } from "next/cache";

import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { deleteSupportConversation } from "@/lib/support/supportConversationService";

export async function deleteSupportConversationAction(conversationId: string) {
  const admin = await requireDashboardRoleAccess(["SUPER_ADMIN"]);

  try {
    await deleteSupportConversation({
      conversationId,
      viewerRole: admin.role,
    });

    revalidatePath("/account/dashboard/admin/support");
    revalidatePath(`/account/dashboard/admin/support/${conversationId}`);

    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to delete conversation",
    };
  }
}
