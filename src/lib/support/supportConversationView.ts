import {
  ConversationPriority,
  ConversationRole,
  ConversationStatus,
  ConversationType,
  SenderType,
  UserRole,
} from "@/generated/prisma/client";

export type SupportInboxMode = "user" | "staff";
export type SupportInboxSort = "latest" | "oldest" | "newest";
export type SupportInboxFilter =
  | "all"
  | "unread"
  | "open"
  | "pending"
  | "resolved"
  | "assigned-to-me"
  | "unassigned";

export type SupportActorRole =
  | "USER"
  | "ADMIN"
  | "SUPER_ADMIN"
  | "MODERATOR"
  | "SYSTEM"
  | "CONTACT";

export type SupportConversationParticipant = {
  id: string | null;
  name: string;
  email: string | null;
  role: SupportActorRole;
};

export type SupportConversationMessage = {
  id: string;
  conversationId: string;
  content: string;
  senderId: string | null;
  senderName: string;
  senderEmail: string | null;
  senderRole: SupportActorRole;
  senderType: SenderType;
  createdAt: string;
  deliveredAt: string | null;
  readAt: string | null;
};

export type SupportConversationPreview = {
  id: string;
  ticketId: string;
  type: ConversationType;
  status: ConversationStatus;
  priority: ConversationPriority;
  subject: string;
  openedBy: SupportConversationParticipant;
  assignedTo: SupportConversationParticipant | null;
  firstResponder: SupportConversationParticipant | null;
  lastResponder: SupportConversationParticipant | null;
  lastMessage: SupportConversationMessage | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  isAssignedToMe: boolean;
  canReply: boolean;
};

export type SupportConversationThread = SupportConversationPreview & {
  contactName: string | null;
  contactEmail: string | null;
  source: string | null;
  members: Array<{
    userId: string;
    role: ConversationRole;
    unreadCount: number;
    lastReadAt: string | null;
    user: SupportConversationParticipant;
  }>;
  messages: SupportConversationMessage[];
};

export function getSupportStatusLabel(status: ConversationStatus) {
  switch (status) {
    case ConversationStatus.OPEN:
      return "Open";
    case ConversationStatus.WAITING:
      return "Pending";
    case ConversationStatus.RESOLVED:
      return "Resolved";
    case ConversationStatus.CLOSED:
      return "Closed";
    case ConversationStatus.ARCHIVED:
      return "Archived";
    case ConversationStatus.CANCELLED:
      return "Cancelled";
    case ConversationStatus.REJECTED:
      return "Rejected";
    case ConversationStatus.BLOCKED:
      return "Blocked";
    case ConversationStatus.DELETED:
      return "Deleted";
    default:
      return status;
  }
}

export function getSupportPriorityLabel(priority: ConversationPriority) {
  switch (priority) {
    case ConversationPriority.LOW:
      return "Low";
    case ConversationPriority.NORMAL:
      return "Normal";
    case ConversationPriority.HIGH:
      return "High";
    case ConversationPriority.URGENT:
      return "Urgent";
    default:
      return priority;
  }
}

export function getSupportRoleLabel(role: SupportActorRole) {
  switch (role) {
    case "USER":
      return "User";
    case "ADMIN":
      return "Admin";
    case "SUPER_ADMIN":
      return "Super Admin";
    case "MODERATOR":
      return "Moderator";
    case "CONTACT":
      return "Contact";
    default:
      return "System";
  }
}

export function isSupportStaffRole(role: UserRole | null | undefined) {
  return (
    role === UserRole.ADMIN ||
    role === UserRole.SUPER_ADMIN ||
    role === UserRole.MODERATOR
  );
}

export function isSupportStaff(role: UserRole | null | undefined) {
  return isSupportStaffRole(role);
}

export function getSupportActorRoleFromUserRole(
  role: UserRole | null | undefined,
  fallback: SupportActorRole = "SYSTEM",
): SupportActorRole {
  if (role === UserRole.SUPER_ADMIN) return "SUPER_ADMIN";
  if (role === UserRole.ADMIN) return "ADMIN";
  if (role === UserRole.MODERATOR) return "MODERATOR";
  if (role === UserRole.USER) return "USER";
  return fallback;
}

export function createSupportParticipant(input: {
  id: string | null;
  name: string;
  email: string | null;
  role: SupportActorRole;
}): SupportConversationParticipant {
  return input;
}
