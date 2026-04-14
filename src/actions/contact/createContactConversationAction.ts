"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { SenderType, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { persistConversationMessage } from "@/lib/inbox/conversationService";
import { sendContactEmail } from "@/lib/resend/contact";

export type ContactConversationActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const contactSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.email("Please enter a valid email address."),
  message: z.string().min(10, "Please enter a message."),
});

export async function createContactConversationAction(
  _prevState: ContactConversationActionState,
  formData: FormData,
): Promise<ContactConversationActionState> {
  const parsed = contactSchema.safeParse({
    fullName: String(formData.get("fullName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ?? "Please complete the contact form.",
    };
  }

  const { fullName, email, message } = parsed.data;

  try {
    const createdConversation = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const conversation = await tx.conversation.create({
          data: {
            type: "CONTACT_INQUIRY",
            status: "OPEN",
            subject: `Contact request from ${fullName}`,
            contactName: fullName,
            contactEmail: email,
            source: "contact-page",
            lastMessageAt: new Date(),
            priority: "NORMAL",
          },
          select: {
            id: true,
            subject: true,
          },
        });

        await persistConversationMessage(tx, {
          conversationId: conversation.id,
          senderType: SenderType.USER,
          content: message,
        });

        await persistConversationMessage(tx, {
          conversationId: conversation.id,
          senderType: SenderType.SYSTEM,
          content:
            "Thanks for reaching out. A support agent will review your message shortly.",
        });

        return conversation;
      },
    );

    try {
      await sendContactEmail({
        name: fullName,
        email,
        message,
      });
    } catch (emailError) {
      console.error("Failed to send contact email notification:", emailError);
    }

    revalidatePath("/account/dashboard/support");

    return {
      status: "success",
      message: "Thanks. Your message has been sent.",
    };
  } catch (error) {
    console.error("Failed to create contact conversation:", error);

    return {
      status: "error",
      message:
        "Something went wrong while sending your message. Please try again.",
    };
  }
}
