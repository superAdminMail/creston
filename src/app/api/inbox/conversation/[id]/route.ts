import { getCurrentUserId } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ messages: [] });

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { error: "Missing conversationId" },
      { status: 400 },
    );
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      members: { some: { userId } },
    },
    include: {
      members: {
        select: {
          userId: true,
          role: true,
          lastReadAt: true,
        },
      },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) {
    return NextResponse.json({ messages: [] });
  }

  const viewerMember = conversation.members.find((member) => member.userId === userId);
  const viewerSenderType = viewerMember?.role === "USER" ? "USER" : "SUPPORT";
  const counterpartyReadAt =
    conversation.members
      .filter((member) => member.userId !== userId)
      .map((member) => member.lastReadAt)
      .filter((value): value is Date => Boolean(value))
      .sort((left, right) => right.getTime() - left.getTime())[0] ?? null;

  return NextResponse.json({
    messages: conversation.messages.map((message) => ({
      id: message.id,
      conversationId: message.conversationId,
      senderType: message.senderType,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      deliveredAt: message.deliveredAt?.toISOString() ?? null,
      readAt:
        counterpartyReadAt &&
        message.senderType === viewerSenderType &&
        counterpartyReadAt >= message.createdAt
          ? counterpartyReadAt.toISOString()
          : null,
    })),
  });
}
