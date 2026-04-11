import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { SenderType } from "@/generated/prisma/client";
import { getCurrentUserId, getCurrentUserRole } from "@/lib/getCurrentUser";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  const role = await getCurrentUserRole();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, targetSenderType } = await req.json();
  if (!conversationId) {
    return NextResponse.json(
      { error: "Missing conversationId" },
      { status: 400 },
    );
  }

  const senderType: SenderType = targetSenderType ?? "SUPPORT";
  const incomingSenderTypes =
    role === "ADMIN" || role === "MODERATOR" || role === "SUPER_ADMIN"
      ? [SenderType.USER]
      : [SenderType.SUPPORT, SenderType.SYSTEM];

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId },
    select: {
      id: true,
      type: true,
      members: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 },
    );
  }

  const isAllowed =
    conversation.members.length > 0 ||
    (role === "ADMIN" && conversation.type === "SUPPORT");

  if (!isAllowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deliveredAt = new Date();
  await prisma.message.updateMany({
    where: {
      conversationId,
      deliveredAt: null,
      senderType: targetSenderType ? senderType : { in: incomingSenderTypes },
    },
    data: { deliveredAt },
  });

  await pusherServer.trigger(`conversation-${conversationId}`, "delivered", {
    deliveredAt: deliveredAt.toISOString(),
  });

  return NextResponse.json({ success: true });
}
