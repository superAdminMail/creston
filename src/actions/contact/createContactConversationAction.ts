"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  createSupportConversation,
} from "@/lib/support/supportConversationService";
import { sendContactEmail } from "@/lib/resend/contact";
import { contactSchema } from "@/lib/zodValidations/contact";

export type ContactConversationActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

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
    const sender = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (sender?.id) {
      await createSupportConversation({
        creatorUserId: sender.id,
        contactName: fullName,
        contactEmail: email,
        subject: `Contact request from ${fullName}`,
        message,
        type: "CONTACT_INQUIRY",
        source: "contact-page",
      });

      revalidatePath("/account/dashboard/user/support");
      revalidatePath("/account/dashboard/admin/support");
    }

    try {
      await sendContactEmail({
        name: fullName,
        email,
        message,
      });
    } catch (emailError) {
      console.error("Failed to send contact email notification:", emailError);
    }

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
