import { NextResponse } from "next/server";

import { getCurrentUserId, getCurrentUserRole } from "@/lib/getCurrentUser";
import { getSupportConversationThread } from "@/lib/support/supportConversationService";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  const role = await getCurrentUserRole();

  if (!userId || !role) {
    return NextResponse.json({ messages: [] });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { error: "Missing conversationId" },
      { status: 400 },
    );
  }

  const conversation = await getSupportConversationThread({
    conversationId: id,
    viewerUserId: userId,
    viewerRole: role,
  });

  if (!conversation) {
    return NextResponse.json({ messages: [] });
  }

  return NextResponse.json({
    conversation,
    messages: conversation.messages,
  });
}
