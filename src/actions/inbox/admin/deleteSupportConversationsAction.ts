"use server";

import { revalidatePath } from "next/cache";

import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { deleteSupportConversations } from "@/lib/support/supportConversationService";

export async function deleteSupportConversationsAction(
  conversationIds: string[],
) {
  const admin = await requireDashboardRoleAccess(["SUPER_ADMIN"]);

  try {
    const result = await deleteSupportConversations({
      conversationIds,
      viewerRole: admin.role,
    });

    revalidatePath("/account/dashboard/super-admin/support");
    for (const conversationId of conversationIds) {
      revalidatePath(`/account/dashboard/super-admin/support/${conversationId}`);
    }

    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to delete conversations",
    };
  }
}
