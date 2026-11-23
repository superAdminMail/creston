"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { UserRole } from "@/generated/prisma/client";
import type { NewConversation } from "@/lib/types/chat.types";
import {
  createSupportParticipant,
  type SupportConversationPreview,
  type SupportInboxFilter,
  type SupportInboxMode,
  type SupportInboxSort,
} from "@/lib/support/supportConversationView";
import { assignSupportConversationToMeAction } from "@/actions/inbox/admin/assignSupportConversationToMeAction";
import { deleteSupportConversationsAction } from "@/actions/inbox/admin/deleteSupportConversationsAction";
import { buildNewConversationPreview } from "../utils/buildNewConversationPreview";

type FilterOption = {
  key: SupportInboxFilter;
  label: string;
};

const ADMIN_FILTERS: FilterOption[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "open", label: "Open" },
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
  { key: "assigned-to-me", label: "Assigned to me" },
  { key: "unassigned", label: "Unassigned" },
];

const USER_FILTERS: FilterOption[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "open", label: "Open" },
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
];

type UseSupportInboxProps = {
  mode: SupportInboxMode;
  viewerId: string;
  viewerRole: UserRole;
  initialConversations: SupportConversationPreview[];
  detailBasePath?: string;
};

export function useSupportInbox({
  mode,
  viewerId,
  viewerRole,
  initialConversations,
  detailBasePath,
}: UseSupportInboxProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [conversations, setConversations] = useState(initialConversations);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SupportInboxFilter>("all");
  const [sort, setSort] = useState<SupportInboxSort>("latest");

  const [createOpen, setCreateOpen] = useState(false);
  const [supportVerificationOpen, setSupportVerificationOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConversationIds, setDeleteConversationIds] = useState<
    string[] | null
  >(null);
  const [selectedConversationIds, setSelectedConversationIds] = useState<
    string[]
  >([]);

  const isStaffView = mode === "staff";
  const filters = isStaffView ? ADMIN_FILTERS : USER_FILTERS;

  const canManageTickets =
    isStaffView &&
    (viewerRole === UserRole.ADMIN || viewerRole === UserRole.SUPER_ADMIN);

  const canDeleteTickets = isStaffView && viewerRole === UserRole.SUPER_ADMIN;

  const selectedCount = selectedConversationIds.length;

  const detailPath = (conversationId: string) =>
    detailBasePath
      ? `${detailBasePath}/${conversationId}`
      : isStaffView
        ? `/account/dashboard/admin/support/${conversationId}`
        : `/account/dashboard/user/support/${conversationId}`;

  const filteredConversations = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return conversations
      .filter((ticket) => {
        const matchesQuery =
          !normalized ||
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
            .includes(normalized);

        const matchesFilter =
          filter === "all" ||
          (filter === "unread" && ticket.unreadCount > 0) ||
          (filter === "open" && ticket.status === "OPEN") ||
          (filter === "pending" && ticket.status === "WAITING") ||
          (filter === "resolved" &&
            ["RESOLVED", "CLOSED"].includes(ticket.status)) ||
          (filter === "assigned-to-me" && ticket.isAssignedToMe) ||
          (filter === "unassigned" && !ticket.assignedTo);

        return matchesQuery && matchesFilter;
      })
      .sort((left, right) => {
        if (sort === "oldest") {
          return (
            new Date(left.createdAt).getTime() -
            new Date(right.createdAt).getTime()
          );
        }

        if (sort === "newest") {
          return (
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime()
          );
        }

        return (
          new Date(right.lastMessageAt ?? right.updatedAt).getTime() -
          new Date(left.lastMessageAt ?? left.updatedAt).getTime()
        );
      });
  }, [conversations, filter, query, sort]);

  const stats = useMemo(() => {
    const unread = conversations.filter(
      (ticket) => ticket.unreadCount > 0,
    ).length;

    const open = conversations.filter(
      (ticket) => ticket.status === "OPEN",
    ).length;

    const waiting = conversations.filter(
      (ticket) => ticket.status === "WAITING",
    ).length;

    return {
      total: conversations.length,
      unread,
      open,
      waiting,
    };
  }, [conversations]);

  const visibleConversationIds = useMemo(
    () => filteredConversations.map((ticket) => ticket.id),
    [filteredConversations],
  );

  const allVisibleSelected =
    visibleConversationIds.length > 0 &&
    visibleConversationIds.every((conversationId) =>
      selectedConversationIds.includes(conversationId),
    );

  const someVisibleSelected =
    visibleConversationIds.some((conversationId) =>
      selectedConversationIds.includes(conversationId),
    ) && !allVisibleSelected;

  const handleSelect = (conversationId: string) => {
    router.push(detailPath(conversationId));
  };

  const handleAssignToMe = (conversationId: string) => {
    startTransition(async () => {
      const response =
        await assignSupportConversationToMeAction(conversationId);

      if (response?.error) {
        toast.error(response.error);
        return;
      }

      setConversations((prev) =>
        prev.map((ticket) =>
          ticket.id === conversationId
            ? {
                ...ticket,
                assignedTo: createSupportParticipant({
                  id: viewerId,
                  name: "You",
                  email: null,
                  role:
                    viewerRole === UserRole.SUPER_ADMIN
                      ? "SUPER_ADMIN"
                      : "ADMIN",
                }),
                isAssignedToMe: true,
              }
            : ticket,
        ),
      );

      toast.success("Conversation assigned to you");
    });
  };

  const handleDelete = (conversationId: string) => {
    setDeleteConversationIds([conversationId]);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteConversationIds?.length) return;

    startTransition(async () => {
      const conversationIds = deleteConversationIds;
      const response = await deleteSupportConversationsAction(conversationIds);

      if (response?.error) {
        toast.error(response.error);
        return;
      }

      setConversations((prev) =>
        prev.filter((ticket) => !conversationIds.includes(ticket.id)),
      );

      const deletedCount = response?.deletedCount ?? conversationIds.length;

      toast.success(
        deletedCount > 1
          ? `${deletedCount} support conversations deleted`
          : "Conversation deleted",
      );

      setDeleteOpen(false);
      setDeleteConversationIds(null);

      setSelectedConversationIds((prev) =>
        prev.filter(
          (conversationId) => !conversationIds.includes(conversationId),
        ),
      );
    });
  };

  const toggleConversationSelection = (conversationId: string) => {
    setSelectedConversationIds((prev) =>
      prev.includes(conversationId)
        ? prev.filter((id) => id !== conversationId)
        : [...prev, conversationId],
    );
  };

  const toggleAllVisibleSelection = () => {
    setSelectedConversationIds((prev) =>
      allVisibleSelected
        ? prev.filter(
            (conversationId) =>
              !visibleConversationIds.includes(conversationId),
          )
        : Array.from(new Set([...prev, ...visibleConversationIds])),
    );
  };

  const clearSelection = () => setSelectedConversationIds([]);

  const handleBatchDelete = () => {
    if (!selectedConversationIds.length) return;

    setDeleteConversationIds(selectedConversationIds);
    setDeleteOpen(true);
  };

  const handleCreated = (conversation: NewConversation) => {
    setConversations((prev) => [
      buildNewConversationPreview(conversation, viewerId),
      ...prev,
    ]);

    setCreateOpen(false);
    router.push(detailPath(conversation.id));
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteOpen(open);

    if (!open) {
      setDeleteConversationIds(null);
    }
  };

  return {
    conversations,
    filteredConversations,
    stats,

    query,
    setQuery,
    filter,
    setFilter,
    sort,
    setSort,
    filters,

    isStaffView,
    canManageTickets,
    canDeleteTickets,
    isPending,

    createOpen,
    setCreateOpen,
    supportVerificationOpen,
    setSupportVerificationOpen,
    deleteOpen,
    handleDeleteDialogOpenChange,
    deleteConversationIds,

    selectedConversationIds,
    selectedCount,
    allVisibleSelected,
    someVisibleSelected,

    handleSelect,
    handleAssignToMe,
    handleDelete,
    confirmDelete,
    toggleConversationSelection,
    toggleAllVisibleSelection,
    clearSelection,
    handleBatchDelete,
    handleCreated,
  };
}
