import { NextResponse } from "next/server";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { SUPPORT_CONVERSATION_TYPES } from "@/lib/support/supportConversationService";
import { isSupportStaffRole } from "@/lib/support/supportConversationView";

export async function POST(request: Request) {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let body: { socket_id?: string; channel_name?: string } | null = null;

  if (contentType.includes("application/json")) {
    body = (await request.json().catch(() => null)) as {
      socket_id?: string;
      channel_name?: string;
    } | null;
  } else if (contentType.includes("multipart/form-data")) {
    const form = await request.formData().catch(() => null);
    body = form
      ? {
          socket_id: form.get("socket_id")?.toString(),
          channel_name: form.get("channel_name")?.toString(),
        }
      : null;
  } else {
    const text = await request.text().catch(() => "");
    const params = new URLSearchParams(text);
    body = {
      socket_id: params.get("socket_id") ?? undefined,
      channel_name: params.get("channel_name") ?? undefined,
    };
  }

  const socketId = body?.socket_id?.trim();
  const channelName = body?.channel_name?.trim();

  if (!socketId || !channelName) {
    return NextResponse.json(
      { error: "Invalid Pusher auth payload" },
      { status: 400 },
    );
  }

  if (!channelName.startsWith("presence-conversation-")) {
    return NextResponse.json({ error: "Unsupported channel" }, { status: 400 });
  }

  const conversationId = channelName.replace("presence-conversation-", "");
  if (!conversationId) {
    return NextResponse.json({ error: "Invalid channel" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      role: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      type: true,
      members: {
        where: { userId: sessionUser.id },
        select: {
          userId: true,
        },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const canAccessConversation =
    conversation.members.length > 0 ||
    (isSupportStaffRole(user.role) &&
      SUPPORT_CONVERSATION_TYPES.includes(conversation.type));

  if (!canAccessConversation) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
    user_id: sessionUser.id,
    user_info: {
      name: user.name ?? sessionUser.name ?? "Support member",
      email: user.email ?? sessionUser.email ?? null,
      role: user.role,
      isAgent: isSupportStaffRole(user.role),
    },
  });

  return NextResponse.json(authResponse);
}
