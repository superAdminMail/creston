"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUserId, getCurrentUserRole } from "@/lib/getCurrentUser";
import {
  createSupportConversation,
  getSupportConversationThread,
} from "@/lib/support/supportConversationService";
import {
  supportConversationSchema,
  type SupportConversationValues,
} from "@/lib/zodValidations/support";

export async function createConversationAction({
  subject,
  message,
}: {
  subject?: string;
  message: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Unauthorized" };

  const parsed = supportConversationSchema.safeParse({
    subject,
    message,
  } satisfies SupportConversationValues);

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ?? "Please complete the support form.",
    };
  }

  const conversation = await createSupportConversation({
    creatorUserId: userId,
    subject: parsed.data.subject,
    message: parsed.data.message,
    type: "SUPPORT",
    source: "dashboard-support",
  });

  const role = await getCurrentUserRole();
  const thread =
    role && userId
      ? await getSupportConversationThread({
          conversationId: conversation.id,
          viewerUserId: userId,
          viewerRole: role,
        })
      : null;

  revalidatePath("/account/dashboard/user/support");
  revalidatePath("/account/dashboard/admin/support");

  if (!thread) {
    return {
      ok: true,
      conversation: {
        id: conversation.id,
        ticketId: conversation.id,
        subject: conversation.subject,
        messages: [],
      },
    };
  }

  return {
    ok: true,
    conversation: {
      id: thread.id,
      ticketId: thread.ticketId,
      subject: thread.subject,
      messages: thread.messages,
    },
  };
}
