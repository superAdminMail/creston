"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Inbox,
  Loader2,
  MessageSquareText,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRoundPlus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import NewConversationModal from "@/components/inbox/NewConversationModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { UserRole } from "@/generated/prisma/client";
import type { NewConversation } from "@/lib/types/chat.types";
import {
  createSupportParticipant,
  getSupportStatusLabel,
  type SupportConversationMessage,
  type SupportConversationPreview,
  type SupportInboxFilter,
  type SupportInboxMode,
  type SupportInboxSort,
} from "@/lib/support/supportConversationView";
import { isWithdrawalPrivateSupportConversationSource } from "@/lib/support/withdrawalPrivateSupportConversation";
import { assignSupportConversationToMeAction } from "@/actions/inbox/admin/assignSupportConversationToMeAction";
import { deleteSupportConversationsAction } from "@/actions/inbox/admin/deleteSupportConversationsAction";
import SupportDeleteConversationDialog from "./SupportDeleteConversationDialog";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "@/app/account/dashboard/_components/dashboardSurfaces";

type Props = {
  mode: SupportInboxMode;
  viewerId: string;
  viewerRole: UserRole;
  initialConversations: SupportConversationPreview[];
  detailBasePath?: string;
};

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

const SUPPORT_HERO_CLASS = cn(
  DASHBOARD_PAGE_PANEL_CLASS,
  "rounded-[2rem] p-6 sm:p-8",
);

const SUPPORT_LIST_CLASS = cn(
  DASHBOARD_PAGE_SURFACE_CLASS,
  "overflow-hidden rounded-[1.9rem]",
);

const SUPPORT_SIDE_CLASS = cn(DASHBOARD_PAGE_SURFACE_CLASS, "rounded-[1.9rem]");

function formatAbsoluteDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatRelativeTime(value?: string | null, hydrated = false) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  if (!hydrated) {
    return formatAbsoluteDate(value);
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (Math.abs(diffMinutes) < 1) return "Just now";
  if (Math.abs(diffMinutes) < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) return `${diffDays}d ago`;

  return formatAbsoluteDate(value);
}

function getPreviewSubtitle(ticket: SupportConversationPreview) {
  if (ticket.assignedTo) {
    return `Assigned to ${ticket.assignedTo.name}`;
  }

  if (ticket.type === "CONTACT_INQUIRY") {
    return ticket.openedBy.email ?? ticket.openedBy.name;
  }

  return ticket.openedBy.name;
}

function buildNewConversationPreview(
  conversation: NewConversation,
  viewerId: string,
): SupportConversationPreview {
  const lastMessage = conversation.messages.at(-1) ?? null;
  const createdAt = new Date().toISOString();

  const formattedLastMessage: SupportConversationMessage | null = lastMessage
    ? {
        id: lastMessage.id,
        conversationId: lastMessage.conversationId,
        content: lastMessage.content,
        senderId: lastMessage.senderId ?? null,
        senderName: lastMessage.senderName ?? "You",
        senderEmail: lastMessage.senderEmail ?? null,
        senderRole: lastMessage.senderRole ?? "USER",
        senderType: lastMessage.senderType,
        createdAt: lastMessage.createdAt,
        deliveredAt: lastMessage.deliveredAt ?? null,
        readAt: lastMessage.readAt ?? null,
      }
    : null;

  return {
    id: conversation.id,
    ticketId: conversation.ticketId ?? conversation.id,
    type: "SUPPORT",
    status: "OPEN",
    priority: "NORMAL",
    subject: conversation.subject ?? "Support Ticket",
    openedBy: createSupportParticipant({
      id: viewerId,
      name: "You",
      email: null,
      role: "USER",
    }),
    assignedTo: null,
    firstResponder: null,
    lastResponder: null,
    lastMessage: formattedLastMessage,
    unreadCount: 0,
    createdAt,
    updatedAt: createdAt,
    lastMessageAt: formattedLastMessage?.createdAt ?? createdAt,
    source: null,
    isAssignedToMe: false,
    canReply: true,
  };
}

export default function SupportInboxWorkspace({
  mode,
  viewerId,
  viewerRole,
  initialConversations,
  detailBasePath,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [conversations, setConversations] = useState(initialConversations);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SupportInboxFilter>("all");
  const [sort, setSort] = useState<SupportInboxSort>("latest");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConversationIds, setDeleteConversationIds] = useState<
    string[] | null
  >(null);
  const [selectedConversationIds, setSelectedConversationIds] = useState<
    string[]
  >([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-900 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-sky-300">
            <Sparkles className="h-3.5 w-3.5" />
            Support inbox
          </p>
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl">
              {isStaffView
                ? viewerRole === UserRole.SUPER_ADMIN
                  ? "Executive support tickets"
                  : "Customer support tickets"
                : "My support tickets"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
              {isStaffView
                ? viewerRole === UserRole.SUPER_ADMIN
                  ? "Track every open request, ownership, and unread reply from the platform control seat."
                  : "Track pending requests, assignment, and unread customer replies in one place."
                : "Review replies from the support team and keep every conversation in one secure thread."}
            </p>
          </div>
        </div>

        {!isStaffView ? (
          <Button
            onClick={() => setCreateOpen(true)}
            className="rounded-full bg-[#3c9ee0] px-5 text-white shadow-[0_18px_40px_-22px_rgba(60,158,224,0.9)] hover:bg-[#2f8bd0]"
          >
            New support ticket
          </Button>
        ) : null}
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="text-slate-950 dark:text-white">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Inbox className="h-4 w-4 text-sky-700 dark:text-sky-300" />
              Tickets
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search ticket ID, subject, name..."
                  className="h-11 rounded-2xl border-border/60 bg-white/95 pl-10 text-slate-950 placeholder:text-slate-400 focus-visible:ring-sky-400/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <Select
                  value={sort}
                  onValueChange={(value) => setSort(value as SupportInboxSort)}
                >
                  <SelectTrigger className="h-10 flex-1 rounded-2xl border-border/60 bg-white/95 text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest activity</SelectItem>
                    <SelectItem value="newest">Newest created</SelectItem>
                    <SelectItem value="oldest">Oldest created</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {canDeleteTickets ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white/75 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Checkbox
                    checked={
                      allVisibleSelected
                        ? true
                        : someVisibleSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={() => toggleAllVisibleSelection()}
                  />
                  <span>
                    {selectedCount
                      ? `${selectedCount} selected`
                      : "Select tickets for batch delete"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedCount ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      className="h-8 rounded-full border border-border/60 bg-white/80 px-3 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
                    >
                      Clear
                    </Button>
                  ) : null}

                  <Button
                    type="button"
                    size="sm"
                    disabled={!selectedCount}
                    onClick={handleBatchDelete}
                    className="h-8 rounded-full bg-red-600 px-3 text-xs text-white hover:bg-red-700"
                  >
                    Delete selected
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    filter === item.key
                      ? "border-sky-400/40 bg-sky-500/15 text-sky-900 dark:text-sky-200"
                      : "border-slate-200/80 bg-white/80 text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <Separator className="bg-slate-200/80 dark:bg-white/10" />

            <div className="space-y-3">
              {filteredConversations.length ? (
                filteredConversations.map((ticket) => (
                  // Private withdrawal support conversations are only visible to super-admins,
                  // but we still surface a tiny label so they stand out in the queue.
                  <div
                    key={ticket.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelect(ticket.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleSelect(ticket.id);
                      }
                    }}
                    className={cn(
                      "group w-full rounded-[1.5rem] border p-4 text-left transition duration-300 hover:-translate-y-0.5",
                      "border-slate-200/80 bg-white/75 hover:border-sky-300/70 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.06]",
                      selectedConversationIds.includes(ticket.id) &&
                        "border-sky-400/30 bg-sky-500/10 dark:bg-sky-500/10",
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        {canDeleteTickets ? (
                          <div
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={(event) => event.stopPropagation()}
                            role="presentation"
                            className="mt-0.5"
                          >
                            <Checkbox
                              checked={selectedConversationIds.includes(
                                ticket.id,
                              )}
                              onCheckedChange={() =>
                                toggleConversationSelection(ticket.id)
                              }
                            />
                          </div>
                        ) : null}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="break-words text-sm font-semibold leading-5 text-slate-950 dark:text-white sm:line-clamp-2">
                              {ticket.subject}
                            </p>
                            {isStaffView &&
                            viewerRole === UserRole.SUPER_ADMIN &&
                            isWithdrawalPrivateSupportConversationSource(
                              ticket.source,
                            ) ? (
                              <Badge className="shrink-0 rounded-full bg-fuchsia-500/15 px-2.5 py-1 text-[11px] text-fuchsia-700 dark:text-fuchsia-200">
                                Private
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 break-words text-xs leading-5 text-slate-600 dark:text-slate-400">
                            {ticket.ticketId} | {getPreviewSubtitle(ticket)}
                          </p>
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:flex-nowrap sm:self-start">
                        {ticket.unreadCount > 0 ? (
                          <Badge className="shrink-0 rounded-full bg-sky-500/15 px-2.5 py-1 text-[11px] text-sky-900 dark:text-sky-200">
                            {ticket.unreadCount}
                          </Badge>
                        ) : null}

                        {canManageTickets ? (
                          <div className="flex flex-wrap items-center justify-end gap-1 opacity-100 transition group-hover:opacity-100 lg:opacity-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isPending}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleAssignToMe(ticket.id);
                              }}
                              className="h-8 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 text-[11px] text-sky-900 hover:bg-sky-500/20 hover:text-sky-950 dark:text-sky-200 dark:hover:text-white"
                            >
                              <UserRoundPlus className="mr-1.5 h-3.5 w-3.5" />
                              Assign to me
                            </Button>
                            {canDeleteTickets ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={isPending}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDelete(ticket.id);
                                }}
                                className="h-8 w-8 shrink-0 rounded-full border border-border/60 bg-white/80 text-slate-500 hover:bg-red-500/15 hover:text-red-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-red-200"
                              >
                                {isPending ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center justify-between gap-3">
                        <span>{getSupportStatusLabel(ticket.status)}</span>
                        <span>
                          {formatRelativeTime(
                            ticket.lastMessageAt ?? ticket.updatedAt,
                            isHydrated,
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>
                          {ticket.lastResponder?.name
                            ? `Last reply by ${ticket.lastResponder.name}`
                            : "No replies yet"}
                        </span>
                        {ticket.assignedTo ? (
                          <span>{ticket.assignedTo.name}</span>
                        ) : (
                          <span>Unassigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-200/80 bg-white/75 px-4 py-8 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                  No support tickets match your filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {isStaffView ? (
          <Card
            className={cn(SUPPORT_SIDE_CLASS, "text-slate-950 dark:text-white")}
          >
            <CardContent className="flex min-h-full flex-col justify-between p-5">
              <div className="space-y-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-500">
                    Support ops
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    Team queue
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Manage assignment, unread replies, and ticket state from a
                    single operational view.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-500">
                      Total tickets
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                      {stats.total}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-500">
                      Unread
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                      {stats.unread}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-500">
                      Open
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                      {stats.open}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-500">
                      Pending
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                      {stats.waiting}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                  Use the filters to find the queue you want, then assign or
                  open the ticket directly from the list.
                </div>
              </div>

              <div className="mt-6 rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                Tip: High-priority work shows up faster when the queue is
                filtered to unread or unassigned tickets.
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card
            className={cn(SUPPORT_SIDE_CLASS, "text-slate-950 dark:text-white")}
          >
            <CardContent className="space-y-5 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 px-1 py-4 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 text-sky-700 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
                  <MessageSquareText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-500">
                    Support center
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                    Help from one secure place
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Track every request, continue existing threads, and create a
                    new ticket when you need fresh help.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-500">
                    Open threads
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                    {stats.open}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-500">
                    Unread replies
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                    {stats.unread}
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <div className="px-1 py-1">
                    <ShieldCheck className="h-4 w-4  text-sky-700 dark:text-sky-300" />
                  </div>
                  What to expect
                </div>
                <div className="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex px-0.5 py-0.5 h-6 w-6 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-900 dark:text-sky-200">
                      1
                    </span>
                    <p>
                      Create one ticket for each new issue so replies stay easy
                      to track.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-0.5 px-0.5 py-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-900 dark:text-sky-200">
                      2
                    </span>
                    <p>
                      Support replies inside the same thread and your inbox
                      updates live.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex px-0.5 py-0.5 h-6 w-6 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-900 dark:text-sky-200">
                      3
                    </span>
                    <p>
                      Use the ticket list to jump back into any conversation at
                      any time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                Need a new request?
                <Button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="mt-3 w-full rounded-full bg-[#3c9ee0] text-white shadow-[0_18px_40px_-22px_rgba(60,158,224,0.9)] hover:bg-[#2f8bd0]"
                >
                  New support ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {!isStaffView ? (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="border-border/60 bg-white/96 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-950/96 dark:text-white sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Create support ticket</DialogTitle>
            </DialogHeader>
            <NewConversationModal
              onClose={() => setCreateOpen(false)}
              onCreated={handleCreated}
            />
          </DialogContent>
        </Dialog>
      ) : null}

      {canDeleteTickets ? (
        <SupportDeleteConversationDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) {
              setDeleteConversationIds(null);
            }
          }}
          onConfirm={confirmDelete}
          isPending={isPending}
          conversationCount={deleteConversationIds?.length ?? 1}
        />
      ) : null}
    </div>
  );
}
