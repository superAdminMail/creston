import { ConversationType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function getUserConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      members: {
        some: { userId },
      },
      type: {
        in: [
          ConversationType.SUPPORT,
          ConversationType.SYSTEM,
          ConversationType.ACCOUNT_ISSUES,
          ConversationType.INVESTMENT_INQUIRIES,
        ],
      },
      status: {
        notIn: ["DELETED", "BLOCKED"],
      },
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
        },
      },

      members: {
        select: {
          userId: true,
          lastReadAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              username: true,
            },
          },
        },
      },

      messages: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          content: true,
          senderType: true,
          createdAt: true,
        },
      },

      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  const results = await Promise.all(
    conversations.map(async (conversation) => {
      const currentMember = conversation.members.find(
        (m) => m.userId === userId,
      );

      const lastReadAt = currentMember?.lastReadAt ?? new Date(0);

      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          createdAt: {
            gt: lastReadAt,
          },
          senderType: {
            in: ["SUPPORT", "SYSTEM"],
          },
        },
      });

      const otherMember = conversation.members.find((m) => m.userId !== userId);

      return {
        id: conversation.id,
        type: conversation.type,
        subject: conversation.subject ?? "Conversation",

        agentId: conversation.agent?.id ?? null,
        agentName: conversation.agent?.name ?? "Support Agent",

        participantName:
          otherMember?.user.name ?? otherMember?.user.email ?? null,

        participantRole: otherMember?.user.role ?? null,

        canDelete:
          conversation.type === "SUPPORT" || conversation._count.members <= 1,

        unreadCount,

        lastMessage: conversation.messages[0]
          ? {
              content: conversation.messages[0].content,
              senderType: conversation.messages[0].senderType,
              createdAt: conversation.messages[0].createdAt.toISOString(),
            }
          : undefined,
      };
    }),
  );

  return results;
}
