"use client";

import type { SupportConversationPreview } from "@/lib/support/supportConversationView";
import { UserRole } from "@/generated/prisma/client";

import SupportConversationCard from "./SupportConversationCard";
import SupportInboxEmptyState from "./SupportInboxEmptyState";

type Props = {
  conversations: SupportConversationPreview[];
  viewerRole: UserRole;
  isStaffView: boolean;
  canManageTickets: boolean;
  canDeleteTickets: boolean;
  isPending: boolean;
  selectedConversationIds: string[];
  onSelect: (conversationId: string) => void;
  onAssignToMe: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  onToggleSelection: (conversationId: string) => void;
};

export default function SupportConversationList({
  conversations,
  viewerRole,
  isStaffView,
  canManageTickets,
  canDeleteTickets,
  isPending,
  selectedConversationIds,
  onSelect,
  onAssignToMe,
  onDelete,
  onToggleSelection,
}: Props) {
  if (!conversations.length) {
    return <SupportInboxEmptyState />;
  }

  return (
    <div className="space-y-3">
      {conversations.map((ticket) => (
        <SupportConversationCard
          key={ticket.id}
          ticket={ticket}
          viewerRole={viewerRole}
          isStaffView={isStaffView}
          canManageTickets={canManageTickets}
          canDeleteTickets={canDeleteTickets}
          isPending={isPending}
          isSelected={selectedConversationIds.includes(ticket.id)}
          onSelect={onSelect}
          onAssignToMe={onAssignToMe}
          onDelete={onDelete}
          onToggleSelection={onToggleSelection}
        />
      ))}
    </div>
  );
}
