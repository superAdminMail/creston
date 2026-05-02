import "server-only";

import {
  ConversationPriority,
  ConversationRole,
  ConversationStatus,
  ConversationType,
  Prisma,
  PrismaClient,
  SenderType,
  UserRole,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createRealtimeNotification } from "@/lib/notifications/createNotification";
import { notifyManyRealtimeNotifications } from "@/lib/notifications/notifyManyRealtimeNotifications";
import formatTicketId from "@/lib/support/formatTicketId";
import {
  createSupportParticipant,
  getSupportActorRoleFromUserRole,
  isSupportStaffRole,
  type SupportActorRole,
  type SupportConversationParticipant,
  type SupportConversationMessage,
  type SupportConversationPreview,
  type SupportConversationThread,
  type SupportInboxFilter,
  type SupportInboxMode,
  type SupportInboxSort,
} from "@/lib/support/supportConversationView";
import {
  persistConversationMessage,
  processConversationMessageAfterWrite,
} from "@/lib/inbox/conversationService";

export const SUPPORT_CONVERSATION_TYPES: ConversationType[] = [
  ConversationType.SUPPORT,
  ConversationType.ACCOUNT_ISSUES,
  ConversationType.INVESTMENT_INQUIRIES,
  ConversationType.CONTACT_INQUIRY,
];

const INCOMING_TO_USER = [SenderType.SUPPORT, SenderType.SYSTEM] as const;
const INCOMING_TO_STAFF = [SenderType.USER] as const;

const conversationListInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  agent: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  members: {
    select: {
      userId: true,
      role: true,
      unreadCount: true,
      lastReadAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  },
  messages: {
    take: 1,
    orderBy: {
      createdAt: "desc" as const,
    },
    select: {
      id: true,
      conversationId: true,
      content: true,
      senderId: true,
      senderType: true,
      createdAt: true,
      deliveredAt: true,
    },
  },
} satisfies Prisma.ConversationInclude;

const conversationThreadInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  agent: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  members: {
    select: {
      userId: true,
      role: true,
      unreadCount: true,
      lastReadAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  },
  messages: {
    orderBy: {
      createdAt: "asc" as const,
    },
    select: {
      id: true,
      conversationId: true,
      content: true,
      senderId: true,
      senderType: true,
      createdAt: true,
      deliveredAt: true,
    },
  },
} satisfies Prisma.ConversationInclude;

const conversationCreationInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.ConversationInclude;

type ConversationListRecord = Prisma.ConversationGetPayload<{
  include: typeof conversationListInclude;
}>;

type ConversationThreadRecord = Prisma.ConversationGetPayload<{
  include: typeof conversationThreadInclude;
}>;

type ConversationCreationRecord = Prisma.ConversationGetPayload<{
  include: typeof conversationCreationInclude;
}>;

type SupportDbClient = Prisma.TransactionClient | PrismaClient;

const SUPPORT_INTERACTIVE_TRANSACTION_OPTIONS = {
  maxWait: 5_000,
  timeout: 10_000,
} as const;

export type SupportConversationCreationResult = {
  createdConversation: ConversationCreationRecord;
  message: Awaited<ReturnType<typeof persistConversationMessage>>;
};

function getSupportActorRoleLabel(
  senderType: SenderType,
  role: UserRole | null | undefined,
  fallback: SupportActorRole = "SYSTEM",
): SupportActorRole {
  if (senderType === SenderType.USER) {
    return "USER";
  }

  if (senderType === SenderType.SYSTEM) {
    return "SYSTEM";
  }

  return getSupportActorRoleFromUserRole(role, fallback);
}

function getSupportActorName(
  senderType: SenderType,
  user?: { name: string | null; email: string | null } | null,
) {
  if (senderType === SenderType.SYSTEM) {
    return "System";
  }

  if (user?.name?.trim()) return user.name.trim();
  if (user?.email?.trim()) return user.email.trim();

  return senderType === SenderType.USER ? "User" : "Support Agent";
}

function toParticipant(
  senderType: SenderType,
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
    role: UserRole | null;
  } | null,
): SupportConversationParticipant {
  const role = getSupportActorRoleLabel(
    senderType,
    user?.role ?? null,
    senderType === SenderType.USER ? "USER" : "SYSTEM",
  );

  return {
    id: user?.id ?? null,
    name: getSupportActorName(senderType, user),
    email: user?.email ?? null,
    role,
  };
}

function getConversationSubject(conversation: ConversationListRecord) {
  if (conversation.subject?.trim()) {
    return conversation.subject.trim();
  }

  if (conversation.type === ConversationType.CONTACT_INQUIRY) {
    return conversation.contactName
      ? `Contact request from ${conversation.contactName}`
      : "Contact request";
  }

  if (conversation.user?.name?.trim()) {
    return `Support request from ${conversation.user.name.trim()}`;
  }

  return "Support ticket";
}

function getTicketId(conversation: { createdAt: Date }) {
  return formatTicketId(conversation.createdAt);
}

function getAllowedIncomingSenderTypes(viewerRole: UserRole) {
  return isSupportStaffRole(viewerRole) ? INCOMING_TO_STAFF : INCOMING_TO_USER;
}

export function getSupportIncomingSenderTypes(viewerRole: UserRole) {
  return getAllowedIncomingSenderTypes(viewerRole);
}

async function loadSenderDirectory(
  senderIds: string[],
  db: SupportDbClient = prisma,
) {
  const uniqueIds = [...new Set(senderIds.filter(Boolean))];

  if (!uniqueIds.length) {
    return new Map<
      string,
      {
        id: string;
        name: string | null;
        email: string | null;
        role: UserRole | null;
      }
    >();
  }

  const users = await db.user.findMany({
    where: {
      id: { in: uniqueIds },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return new Map(
    users.map((user) => [
      user.id,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    ]),
  );
}

async function loadUnreadMessagesForConversations(
  conversationIds: string[],
  viewerRole: UserRole,
  db: SupportDbClient = prisma,
) {
  const uniqueIds = [...new Set(conversationIds.filter(Boolean))];

  if (!uniqueIds.length) {
    return new Map<string, Date[]>();
  }

  const incomingSenderTypes = getAllowedIncomingSenderTypes(viewerRole);

  const messages = await db.message.findMany({
    where: {
      conversationId: {
        in: uniqueIds,
      },
      senderType: {
        in: [...incomingSenderTypes],
      },
    },
    select: {
      conversationId: true,
      createdAt: true,
    },
  });

  const byConversationId = new Map<string, Date[]>();

  for (const message of messages) {
    const existing = byConversationId.get(message.conversationId);

    if (existing) {
      existing.push(message.createdAt);
    } else {
      byConversationId.set(message.conversationId, [message.createdAt]);
    }
  }

  return byConversationId;
}

function canViewConversation(
  conversation: Pick<ConversationThreadRecord, "type" | "members">,
  viewerUserId: string,
  viewerRole: UserRole,
) {
  if (isSupportStaffRole(viewerRole)) {
    return SUPPORT_CONVERSATION_TYPES.includes(conversation.type);
  }

  return conversation.members.some((member) => member.userId === viewerUserId);
}

function buildPreview(
  conversation: ConversationListRecord,
  viewerUserId: string,
  unreadCount: number,
  senderDirectory?: Map<
    string,
    {
      id: string;
      name: string | null;
      email: string | null;
      role: UserRole | null;
    }
  >,
): SupportConversationPreview {
  const lastMessage = conversation.messages[0] ?? null;
  const firstResponderMessage = conversation.messages[0] ?? null;

  const openedBy = conversation.user
    ? toParticipant(SenderType.USER, conversation.user)
    : conversation.contactName || conversation.contactEmail
      ? createSupportParticipant({
          id: null,
          name:
            conversation.contactName?.trim() ||
            conversation.contactEmail?.trim() ||
            "Contact",
          email: conversation.contactEmail ?? null,
          role: "CONTACT",
        })
      : createSupportParticipant({
          id: null,
          name: "Contact",
          email: null,
          role: "CONTACT",
        });

  const assignedTo = conversation.agent
    ? toParticipant(SenderType.SUPPORT, conversation.agent)
    : null;

  const lastResponder =
    lastMessage?.senderType === SenderType.USER
      ? openedBy
      : lastMessage?.senderType === SenderType.SYSTEM
        ? createSupportParticipant({
            id: null,
            name: "System",
            email: null,
            role: "SYSTEM",
          })
        : lastMessage?.senderId && senderDirectory?.get(lastMessage.senderId)
          ? toParticipant(
              SenderType.SUPPORT,
              senderDirectory.get(lastMessage.senderId) ?? null,
            )
          : (assignedTo ??
            createSupportParticipant({
              id: null,
              name: "Support Agent",
              email: null,
              role: "ADMIN",
            }));

  const firstResponder =
    firstResponderMessage?.senderType === SenderType.USER
      ? openedBy
      : firstResponderMessage?.senderType === SenderType.SYSTEM
        ? createSupportParticipant({
            id: null,
            name: "System",
            email: null,
            role: "SYSTEM",
          })
        : (assignedTo ?? null);

  const lastMessageDto = lastMessage
    ? {
        id: lastMessage.id,
        conversationId: lastMessage.conversationId,
        content: lastMessage.content,
        senderId: lastMessage.senderId,
        senderName:
          lastMessage.senderType === SenderType.USER
            ? openedBy.name
            : lastMessage.senderType === SenderType.SYSTEM
              ? "System"
              : (assignedTo?.name ?? "Support Agent"),
        senderEmail:
          lastMessage.senderType === SenderType.USER
            ? openedBy.email
            : lastMessage.senderType === SenderType.SYSTEM
              ? null
              : (assignedTo?.email ?? null),
        senderRole:
          lastMessage.senderType === SenderType.USER
            ? "USER"
            : lastMessage.senderType === SenderType.SYSTEM
              ? "SYSTEM"
              : (assignedTo?.role ?? "ADMIN"),
        senderType: lastMessage.senderType,
        createdAt: lastMessage.createdAt.toISOString(),
        deliveredAt: lastMessage.deliveredAt?.toISOString() ?? null,
        readAt: null,
      }
    : null;

  return {
    id: conversation.id,
    ticketId: getTicketId(conversation),
    type: conversation.type,
    status: conversation.status,
    priority: conversation.priority,
    subject: getConversationSubject(conversation),
    openedBy,
    assignedTo,
    firstResponder,
    lastResponder,
    lastMessage: lastMessageDto,
    unreadCount,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
    isAssignedToMe:
      Boolean(conversation.agentId) && conversation.agentId === viewerUserId,
    canReply:
      conversation.status !== ConversationStatus.CLOSED &&
      conversation.status !== ConversationStatus.DELETED &&
      conversation.status !== ConversationStatus.BLOCKED,
  };
}

export async function getSupportInboxConversations(input: {
  viewerUserId: string;
  viewerRole: UserRole;
  mode: SupportInboxMode;
  filter?: SupportInboxFilter;
  query?: string;
  sort?: SupportInboxSort;
}) {
  const isStaff = input.mode === "staff";

  const conversations = await prisma.conversation.findMany({
    where: isStaff
      ? {
          type: { in: [...SUPPORT_CONVERSATION_TYPES] },
          status: {
            notIn: [ConversationStatus.BLOCKED, ConversationStatus.DELETED],
          },
        }
      : {
          type: { in: [...SUPPORT_CONVERSATION_TYPES] },
          status: {
            notIn: [ConversationStatus.BLOCKED, ConversationStatus.DELETED],
          },
          members: {
            some: {
              userId: input.viewerUserId,
            },
          },
        },
    include: conversationListInclude,
    orderBy:
      input.sort === "oldest"
        ? [{ createdAt: "asc" }, { updatedAt: "asc" }]
        : input.sort === "newest"
          ? [{ createdAt: "desc" }, { updatedAt: "desc" }]
          : [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
  });

  const senderDirectory = await loadSenderDirectory(
    conversations
      .map((conversation) => conversation.messages[0]?.senderId)
      .filter((senderId): senderId is string => Boolean(senderId)),
  );
  const unreadMessagesByConversationId = await loadUnreadMessagesForConversations(
    conversations.map((conversation) => conversation.id),
    input.viewerRole,
  );

  const decorated = conversations.map((conversation) => {
    const viewerMember = conversation.members.find(
      (member) => member.userId === input.viewerUserId,
    );
    const unreadMessages =
      unreadMessagesByConversationId.get(conversation.id) ?? [];
    const unreadCount = unreadMessages.filter((createdAt) =>
      viewerMember?.lastReadAt ? createdAt > viewerMember.lastReadAt : true,
    ).length;

    return buildPreview(
      conversation,
      input.viewerUserId,
      unreadCount,
      senderDirectory,
    );
  });

  const query = input.query?.trim().toLowerCase() ?? "";
  const filtered = decorated.filter((ticket) => {
    const matchesQuery =
      !query ||
      [
        ticket.ticketId,
        ticket.subject,
        ticket.openedBy.name,
        ticket.openedBy.email ?? "",
        ticket.assignedTo?.name ?? "",
        ticket.lastResponder?.name ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

    const matchesFilter =
      input.filter === "all" ||
      !input.filter ||
      (input.filter === "unread" && ticket.unreadCount > 0) ||
      (input.filter === "open" && ticket.status === ConversationStatus.OPEN) ||
      (input.filter === "pending" &&
        ticket.status === ConversationStatus.WAITING) ||
      (input.filter === "resolved" &&
        (ticket.status === ConversationStatus.RESOLVED ||
          ticket.status === ConversationStatus.CLOSED)) ||
      (input.filter === "assigned-to-me" && ticket.isAssignedToMe) ||
      (input.filter === "unassigned" && !ticket.assignedTo);

    return matchesQuery && matchesFilter;
  });

  return filtered;
}

export async function getSupportConversationThread(input: {
  conversationId: string;
  viewerUserId: string;
  viewerRole: UserRole;
  db?: SupportDbClient;
}) {
  const db = input.db ?? prisma;

  const conversation = await db.conversation.findFirst({
    where: {
      id: input.conversationId,
      ...(isSupportStaffRole(input.viewerRole)
        ? {
            type: { in: [...SUPPORT_CONVERSATION_TYPES] },
          }
        : {
            members: {
              some: {
                userId: input.viewerUserId,
              },
            },
          }),
    },
    include: conversationThreadInclude,
  });

  if (
    !conversation ||
    !canViewConversation(conversation, input.viewerUserId, input.viewerRole)
  ) {
    return null;
  }

  const viewerMember = conversation.members.find(
    (member) => member.userId === input.viewerUserId,
  );
  const unreadMessagesByConversationId = await loadUnreadMessagesForConversations(
    [conversation.id],
    input.viewerRole,
    db,
  );
  const unreadMessages = unreadMessagesByConversationId.get(conversation.id) ?? [];
  const unreadCount = unreadMessages.filter((createdAt) =>
    viewerMember?.lastReadAt ? createdAt > viewerMember.lastReadAt : true,
  ).length;
  const senderDirectory = await loadSenderDirectory(
    conversation.messages
      .map((message) => message.senderId)
      .filter((senderId): senderId is string => Boolean(senderId)),
    db,
  );
  const preview = buildPreview(
    conversation,
    input.viewerUserId,
    unreadCount,
    senderDirectory,
  );

  const messages = conversation.messages.map((message) => {
    const senderUser = message.senderId
      ? (senderDirectory.get(message.senderId) ?? null)
      : null;
    const senderRole = getSupportActorRoleLabel(
      message.senderType,
      senderUser?.role ??
        (message.senderType === SenderType.USER
          ? (conversation.user?.role ?? null)
          : message.senderType === SenderType.SYSTEM
            ? null
            : (conversation.agent?.role ?? null)),
      message.senderType === SenderType.USER ? "USER" : "SYSTEM",
    );

    const senderName =
      message.senderType === SenderType.SYSTEM
        ? "System"
        : senderUser?.name?.trim()
          ? senderUser.name.trim()
          : message.senderType === SenderType.USER
            ? conversation.user?.name?.trim() ||
              conversation.user?.email?.trim() ||
              "User"
            : conversation.agent?.name?.trim() ||
              conversation.agent?.email?.trim() ||
              "Support Agent";

    return {
      id: message.id,
      conversationId: message.conversationId,
      content: message.content,
      senderId: message.senderId,
      senderName,
      senderEmail:
        senderUser?.email ??
        (message.senderType === SenderType.USER
          ? (conversation.user?.email ?? null)
          : (conversation.agent?.email ?? null)),
      senderRole,
      senderType: message.senderType,
      createdAt: message.createdAt.toISOString(),
      deliveredAt: message.deliveredAt?.toISOString() ?? null,
      readAt: null,
    } satisfies SupportConversationMessage;
  });

  const firstStaffMessage = conversation.messages.find(
    (message) => message.senderType === SenderType.SUPPORT,
  );
  const lastConversationMessage = conversation.messages.at(-1) ?? null;
  const firstResponder = firstStaffMessage
    ? createSupportParticipant({
        id: firstStaffMessage.senderId ?? null,
        name: firstStaffMessage.senderId
          ? (senderDirectory.get(firstStaffMessage.senderId)?.name?.trim() ??
            "Support Agent")
          : "Support Agent",
        email: firstStaffMessage.senderId
          ? (senderDirectory.get(firstStaffMessage.senderId)?.email ?? null)
          : null,
        role: getSupportActorRoleFromUserRole(
          firstStaffMessage.senderId
            ? senderDirectory.get(firstStaffMessage.senderId)?.role ?? null
            : null,
          "ADMIN",
        ),
      })
    : preview.firstResponder;

  const lastResponder =
    lastConversationMessage?.senderType === SenderType.USER
      ? preview.openedBy
      : lastConversationMessage?.senderType === SenderType.SYSTEM
        ? createSupportParticipant({
            id: null,
            name: "System",
            email: null,
            role: "SYSTEM",
          })
        : lastConversationMessage?.senderId
          ? createSupportParticipant({
              id: lastConversationMessage.senderId,
              name:
                senderDirectory
                  .get(lastConversationMessage.senderId)
                  ?.name?.trim() ?? "Support Agent",
              email:
                senderDirectory.get(lastConversationMessage.senderId)?.email ??
                null,
              role: getSupportActorRoleFromUserRole(
                senderDirectory.get(lastConversationMessage.senderId)?.role ??
                  null,
                "ADMIN",
              ),
            })
          : preview.lastResponder;

  return {
    ...preview,
    firstResponder,
    lastResponder,
    contactName: conversation.contactName ?? null,
    contactEmail: conversation.contactEmail ?? null,
    source: conversation.source ?? null,
    members: conversation.members.map((member) => ({
      userId: member.userId,
      role: member.role,
      unreadCount: member.unreadCount,
      lastReadAt: member.lastReadAt?.toISOString() ?? null,
      user:
        member.role === ConversationRole.USER
          ? toParticipant(SenderType.USER, member.user)
          : toParticipant(SenderType.SUPPORT, member.user),
    })),
    messages,
  } satisfies SupportConversationThread;
}

async function ensureConversationMember(
  db: SupportDbClient,
  input: {
    conversationId: string;
    userId: string;
    role: ConversationRole;
  },
) {
  await db.conversationMember.upsert({
    where: {
      conversationId_userId: {
        conversationId: input.conversationId,
        userId: input.userId,
      },
    },
    create: {
      conversationId: input.conversationId,
      userId: input.userId,
      role: input.role,
    },
    update: {
      role: input.role,
    },
  });
}

async function createSupportConversationRecord(
  db: SupportDbClient,
  input: {
    creatorUserId?: string | null;
    contactName?: string | null;
    contactEmail?: string | null;
    subject?: string | null;
    message: string;
    type?: ConversationType;
    source?: string | null;
    priority?: ConversationPriority;
  },
): Promise<SupportConversationCreationResult> {
  const cleanMessage = input.message.trim();
  if (!cleanMessage) {
    throw new Error("Message cannot be empty");
  }

  const createdConversation = await db.conversation.create({
    data: {
      type: input.type ?? ConversationType.SUPPORT,
      status: ConversationStatus.OPEN,
      subject: input.subject?.trim() || "Support Ticket",
      userId: input.creatorUserId ?? null,
      contactName: input.contactName ?? null,
      contactEmail: input.contactEmail ?? null,
      source: input.source ?? "support",
      priority: input.priority ?? ConversationPriority.NORMAL,
      members: input.creatorUserId
        ? {
            create: {
              userId: input.creatorUserId,
              role: ConversationRole.USER,
            },
          }
        : undefined,
    },
    include: conversationCreationInclude,
  });

  const message = await persistConversationMessage(db, {
    conversationId: createdConversation.id,
    senderId: input.creatorUserId ?? null,
    senderType: SenderType.USER,
    content: cleanMessage,
  });

  return { createdConversation, message };
}

export async function finalizeSupportConversationCreation(
  created: SupportConversationCreationResult,
) {
  await processConversationMessageAfterWrite(created.message, {
    publish: true,
  });

  await notifySupportStaffOfTicket({
    id: created.createdConversation.id,
    ticketId: getTicketId(created.createdConversation),
    subject: created.createdConversation.subject ?? "Support Ticket",
    openedBy: created.createdConversation.user
      ? toParticipant(SenderType.USER, created.createdConversation.user)
      : {
          id: null,
          name: created.createdConversation.contactName?.trim() ?? "Contact",
          email: created.createdConversation.contactEmail ?? null,
          role: "CONTACT",
        },
    priority: created.createdConversation.priority,
  }).catch((error) => {
    console.error("Failed to notify support staff about ticket", error);
  });
}

export async function createSupportConversation(input: {
  creatorUserId?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  subject?: string | null;
  message: string;
  type?: ConversationType;
  source?: string | null;
  priority?: ConversationPriority;
  db: SupportDbClient;
  skipPostCommit: true;
}): Promise<SupportConversationCreationResult>;
export async function createSupportConversation(input: {
  creatorUserId?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  subject?: string | null;
  message: string;
  type?: ConversationType;
  source?: string | null;
  priority?: ConversationPriority;
  db?: SupportDbClient;
  skipPostCommit?: false | undefined;
}): Promise<ConversationCreationRecord>;
export async function createSupportConversation(input: {
  creatorUserId?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  subject?: string | null;
  message: string;
  type?: ConversationType;
  source?: string | null;
  priority?: ConversationPriority;
  db?: SupportDbClient;
  skipPostCommit?: boolean;
}): Promise<ConversationCreationRecord | SupportConversationCreationResult> {
  const created = input.db
    ? await createSupportConversationRecord(input.db, input)
    : await prisma.$transaction(
        async (tx) => createSupportConversationRecord(tx, input),
        SUPPORT_INTERACTIVE_TRANSACTION_OPTIONS,
      );

  if (input.skipPostCommit) {
    return created;
  }

  await finalizeSupportConversationCreation(created);

  return created.createdConversation;
}

export async function replyToSupportConversation(input: {
  conversationId: string;
  viewerUserId: string;
  viewerRole: UserRole;
  content: string;
}) {
  const text = input.content.trim();
  if (!text) {
    throw new Error("Message cannot be empty");
  }

  const senderType = isSupportStaffRole(input.viewerRole)
    ? SenderType.SUPPORT
    : SenderType.USER;

  const conversation = await prisma.conversation.findUnique({
    where: { id: input.conversationId },
    select: {
      id: true,
      agentId: true,
      status: true,
      userId: true,
      subject: true,
      createdAt: true,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (senderType === SenderType.SUPPORT) {
    if (
      conversation.agentId &&
      conversation.agentId !== input.viewerUserId &&
      input.viewerRole !== UserRole.SUPER_ADMIN
    ) {
      throw new Error("Assigned to another agent");
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (senderType === SenderType.SUPPORT) {
      await ensureConversationMember(tx, {
        conversationId: input.conversationId,
        userId: input.viewerUserId,
        role: ConversationRole.SUPPORT,
      });

      await tx.conversation.update({
        where: { id: conversation.id },
        data: {
          ...(conversation.agentId ? {} : { agentId: input.viewerUserId }),
          status: ConversationStatus.WAITING,
        },
      });
    } else if (senderType === SenderType.USER) {
      await tx.conversation.update({
        where: { id: conversation.id },
        data: {
          status: ConversationStatus.OPEN,
        },
      });
    }

    const message = await persistConversationMessage(tx, {
      conversationId: conversation.id,
      senderId: input.viewerUserId,
      senderType,
      content: text,
    });

    return message;
  });

  await processConversationMessageAfterWrite(updated, {
    publish: true,
  });

  if (senderType === SenderType.SUPPORT && conversation.userId) {
    await notifySupportUserOfReply({
      conversationId: conversation.id,
      ticketId: getTicketId({ createdAt: conversation.createdAt }),
      userId: conversation.userId,
      messageId: updated.id,
      subject: conversation.subject ?? "Support ticket",
      message: text,
    }).catch((error) => {
      console.error("Failed to notify support user about reply", error);
    });
  }

  return updated;
}

export async function assignSupportConversationToMe(input: {
  conversationId: string;
  viewerUserId: string;
  viewerRole: UserRole;
}) {
  if (!isSupportStaffRole(input.viewerRole)) {
    throw new Error("Not allowed");
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: input.conversationId,
      type: { in: [...SUPPORT_CONVERSATION_TYPES] },
      status: {
        notIn: [ConversationStatus.BLOCKED, ConversationStatus.DELETED],
      },
    },
    select: {
      id: true,
      agentId: true,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (
    conversation.agentId &&
    conversation.agentId !== input.viewerUserId &&
    input.viewerRole !== UserRole.SUPER_ADMIN
  ) {
    throw new Error("Assigned to another agent");
  }

  await prisma.$transaction(async (tx) => {
    await ensureConversationMember(tx, {
      conversationId: conversation.id,
      userId: input.viewerUserId,
      role: ConversationRole.SUPPORT,
    });

    await tx.conversation.update({
      where: { id: conversation.id },
      data: {
        agentId: input.viewerUserId,
      },
    });
  });

  return { success: true };
}

export async function deleteSupportConversation(input: {
  conversationId: string;
  viewerRole: UserRole;
}) {
  const result = await deleteSupportConversations({
    conversationIds: [input.conversationId],
    viewerRole: input.viewerRole,
  });

  return { success: true, deletedCount: result.deletedCount };
}

export async function deleteSupportConversations(input: {
  conversationIds: string[];
  viewerRole: UserRole;
}) {
  if (input.viewerRole !== UserRole.SUPER_ADMIN) {
    throw new Error("Not allowed");
  }

  const uniqueConversationIds = [
    ...new Set(input.conversationIds.map((conversationId) => conversationId.trim()).filter(Boolean)),
  ];

  if (!uniqueConversationIds.length) {
    throw new Error("No conversations selected");
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      id: { in: uniqueConversationIds },
      type: { in: [...SUPPORT_CONVERSATION_TYPES] },
    },
    select: {
      id: true,
    },
  });

  if (!conversations.length) {
    throw new Error("Conversation not found");
  }

  const conversationIds = conversations.map((conversation) => conversation.id);

  await prisma.$transaction([
    prisma.message.deleteMany({
      where: { conversationId: { in: conversationIds } },
    }),
    prisma.conversationMember.deleteMany({
      where: { conversationId: { in: conversationIds } },
    }),
    prisma.conversation.deleteMany({
      where: { id: { in: conversationIds } },
    }),
  ]);

  return { success: true, deletedCount: conversationIds.length };
}

export async function markSupportConversationRead(input: {
  conversationId: string;
  viewerUserId: string;
  viewerRole: UserRole;
}) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: input.conversationId,
      ...(isSupportStaffRole(input.viewerRole)
        ? {
            type: { in: [...SUPPORT_CONVERSATION_TYPES] },
          }
        : {
            members: {
              some: {
                userId: input.viewerUserId,
              },
            },
          }),
    },
    select: {
      id: true,
      type: true,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const readAt = new Date();
  const senderTypes = getAllowedIncomingSenderTypes(input.viewerRole);

  if (isSupportStaffRole(input.viewerRole)) {
    await prisma.$transaction(async (tx) => {
      await ensureConversationMember(tx, {
        conversationId: input.conversationId,
        userId: input.viewerUserId,
        role: ConversationRole.SUPPORT,
      });

      await tx.message.updateMany({
        where: {
          conversationId: input.conversationId,
          senderType: { in: [...senderTypes] },
          deliveredAt: null,
        },
        data: {
          deliveredAt: readAt,
        },
      });
      await tx.conversationMember.updateMany({
        where: {
          conversationId: input.conversationId,
          userId: input.viewerUserId,
        },
        data: {
          unreadCount: 0,
          lastReadAt: readAt,
        },
      });
    });
  } else {
    await prisma.$transaction([
      prisma.message.updateMany({
        where: {
          conversationId: input.conversationId,
          senderType: { in: [...senderTypes] },
          deliveredAt: null,
        },
        data: {
          deliveredAt: readAt,
        },
      }),
      prisma.conversationMember.updateMany({
        where: {
          conversationId: input.conversationId,
          userId: input.viewerUserId,
        },
        data: {
          unreadCount: 0,
          lastReadAt: readAt,
        },
      }),
    ]);
  }

  return readAt;
}

export function isSupportStaff(role: UserRole | null | undefined) {
  return isSupportStaffRole(role);
}

async function notifySupportStaffOfTicket(conversation: {
  id: string;
  ticketId: string;
  subject: string;
  openedBy: SupportConversationParticipant;
  priority: ConversationPriority;
}) {
  const staff = await prisma.user.findMany({
    where: {
      role: {
        in: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      },
    },
    select: {
      id: true,
      role: true,
    },
  });

  await notifyManyRealtimeNotifications({
    recipients: staff,
    buildNotification: (user) => {
      const supportPath =
        user.role === UserRole.SUPER_ADMIN
          ? "/account/dashboard/super-admin/support"
          : "/account/dashboard/admin/support";

      return {
        userId: user.id,
        event: "SYSTEM",
        title: "New support ticket",
        message: `${conversation.openedBy.name}: ${conversation.subject}`,
        link: `${supportPath}?conversation=${conversation.id}`,
        key: `support-ticket:${conversation.id}:${user.id}`,
        metadata: {
          kind: "support_ticket",
          conversationId: conversation.id,
          ticketId: conversation.ticketId,
          subject: conversation.subject,
          openedBy: conversation.openedBy.name,
          priority: conversation.priority,
        },
      };
    },
    failureMessage: "Failed to notify some support staff about ticket",
    failureContext: {
      conversationId: conversation.id,
      ticketId: conversation.ticketId,
    },
  });
}

async function notifySupportUserOfReply(input: {
  conversationId: string;
  ticketId: string;
  userId: string;
  messageId: string;
  subject: string;
  message: string;
}) {
  await createRealtimeNotification({
    userId: input.userId,
    event: "SYSTEM",
    title: "Support replied",
    message: input.message,
    link: `/account/dashboard/user/support?conversation=${input.conversationId}`,
    key: `support-reply:${input.messageId}`,
    metadata: {
      kind: "support_reply",
      conversationId: input.conversationId,
      ticketId: input.ticketId,
      subject: input.subject,
    },
  });
}
