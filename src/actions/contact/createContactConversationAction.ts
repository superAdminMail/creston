"use server";

import { revalidatePath } from "next/cache";

import { SenderType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { persistConversationMessage } from "@/lib/inbox/conversationService";

export type ContactConversationActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function createContactConversationAction(
  _prevState: ContactConversationActionState,
  formData: FormData,
): Promise<ContactConversationActionState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!fullName || !email || !message) {
    return {
      status: "error",
      message: "Please complete the contact form.",
    };
  }

  await prisma.$transaction(async (tx) => {
    const createdConversation = await tx.conversation.create({
      data: {
        type: "SUPPORT",
        status: "OPEN",
        subject: `Contact request from ${fullName}`,
        contactName: fullName,
        contactEmail: email,
        source: "contact-page",
      },
      select: {
        id: true,
        subject: true,
      },
    });

    await persistConversationMessage(tx, {
      conversationId: createdConversation.id,
      senderType: SenderType.SYSTEM,
      content:
        "Thanks for reaching out. A support agent will review your message shortly.",
    });

    await persistConversationMessage(tx, {
      conversationId: createdConversation.id,
      senderType: SenderType.USER,
      content: message,
    });
  });

  revalidatePath("/account/dashboard/support");

  return {
    status: "success",
    message: "Thanks. Your message has been sent.",
  };
}
