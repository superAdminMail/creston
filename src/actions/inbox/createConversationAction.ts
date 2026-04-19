"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId, getCurrentUserRole } from "@/lib/getCurrentUser";
import {
  createSupportConversation,
  finalizeSupportConversationCreation,
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

  const role = await getCurrentUserRole();

  const created = await prisma.$transaction(
    async (tx) =>
      createSupportConversation({
        creatorUserId: userId,
        subject: parsed.data.subject,
        message: parsed.data.message,
        type: "SUPPORT",
        source: "dashboard-support",
        db: tx,
        skipPostCommit: true,
      }),
    {
      maxWait: 5_000,
      timeout: 10_000,
    },
  );

  await finalizeSupportConversationCreation(created);

  const thread =
    role && userId
      ? await getSupportConversationThread({
          conversationId: created.createdConversation.id,
          viewerUserId: userId,
          viewerRole: role,
        })
      : null;

  revalidatePath("/account/dashboard/user/support");
  revalidatePath("/account/dashboard/admin/support");
  revalidatePath("/account/dashboard/super-admin/support");

  if (!thread) {
    return {
      ok: true,
      conversation: {
        id: created.createdConversation.id,
        ticketId: created.createdConversation.id,
        subject: created.createdConversation.subject,
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
