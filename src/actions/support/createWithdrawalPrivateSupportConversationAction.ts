"use server";

import { revalidatePath } from "next/cache";

import {
  ConversationRole,
  ConversationStatus,
  ConversationType,
} from "@/generated/prisma/client";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import {
  createSupportConversation,
  finalizeSupportConversationCreation,
} from "@/lib/support/supportConversationService";
import { getWithdrawalPrivateSupportConversationSource } from "@/lib/support/withdrawalPrivateSupportConversation";

type ActionResult =
  | {
      ok: true;
      conversationId: string;
    }
  | {
      ok?: false;
      error: string;
    };

export async function createWithdrawalPrivateSupportConversationAction({
  withdrawalId,
}: {
  withdrawalId: string;
}): Promise<ActionResult> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return { error: "Please sign in to continue." };
  }

  const source = getWithdrawalPrivateSupportConversationSource(withdrawalId);

  const existingConversation = await prisma.conversation.findFirst({
    where: {
      source,
      userId: user.id,
      type: ConversationType.SUPPORT,
      status: {
        notIn: [ConversationStatus.BLOCKED, ConversationStatus.DELETED],
      },
    },
    select: {
      id: true,
    },
  });

  if (existingConversation) {
    await prisma.conversationMember.upsert({
      where: {
        conversationId_userId: {
          conversationId: existingConversation.id,
          userId: user.id,
        },
      },
      create: {
        conversationId: existingConversation.id,
        userId: user.id,
        role: ConversationRole.USER,
      },
      update: {
        role: ConversationRole.USER,
      },
    });

    revalidatePath("/account/dashboard/user/support");
    revalidatePath("/account/dashboard/super-admin/support");
    revalidatePath("/account/dashboard/admin/support");

    return {
      ok: true,
      conversationId: existingConversation.id,
    };
  }

  try {
    const created = await createSupportConversation({
      creatorUserId: user.id,
      subject: "Withdrawal payment method assistance",
      message: `I need help with my withdrawal payment method for withdrawal ${withdrawalId}.`,
      type: ConversationType.SUPPORT,
      source,
      db: prisma,
      skipPostCommit: true,
    });

    await finalizeSupportConversationCreation(created);

    revalidatePath("/account/dashboard/user/support");
    revalidatePath("/account/dashboard/super-admin/support");
    revalidatePath("/account/dashboard/admin/support");

    return {
      ok: true,
      conversationId: created.createdConversation.id,
    };
  } catch {
    return {
      error: "Unable to open the private support chat right now.",
    };
  }
}
