"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Inbox,
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRoundPlus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { assignSupportConversationToMeAction } from "@/actions/inbox/admin/assignSupportConversationToMeAction";
import { deleteSupportConversationAction } from "@/actions/inbox/admin/deleteSupportConversationAction";

type Props = {
  mode: SupportInboxMode;
  viewerId: string;
  viewerRole: UserRole;
  initialConversations: SupportConversationPreview[];
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

function formatRelativeTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (Math.abs(diffMinutes) < 1) return "Just now";
  if (Math.abs(diffMinutes) < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
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
    isAssignedToMe: false,
    canReply: true,
  };
}

export default function SupportInboxWorkspace({
  mode,
  viewerId,
  viewerRole,
  initialConversations,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [conversations, setConversations] = useState(initialConversations);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SupportInboxFilter>("all");
  const [sort, setSort] = useState<SupportInboxSort>("latest");
  const [createOpen, setCreateOpen] = useState(false);

  const filters = mode === "staff" ? ADMIN_FILTERS : USER_FILTERS;
  const canManageTickets =
    mode === "staff" &&
    (viewerRole === UserRole.ADMIN || viewerRole === UserRole.SUPER_ADMIN);
  const canDeleteTickets = mode === "staff" && viewerRole === UserRole.SUPER_ADMIN;
  const detailPath = (conversationId: string) =>
    mode === "staff"
      ? `/account/dashboard/admin/support/${conversationId}`
      : `/account/dashboard/user/support/${conversationId}`;

  const filteredConversations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = conversations
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

    return list;
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

  const handleSelect = (conversationId: string) => {
    router.push(detailPath(conversationId));
  };

  const handleAssignToMe = (conversationId: string) => {
    startTransition(async () => {
      const response = await assignSupportConversationToMeAction(conversationId);
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
                    viewerRole === UserRole.SUPER_ADMIN ? "SUPER_ADMIN" : "ADMIN",
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
    const confirmed = window.confirm(
      "Delete this support conversation permanently?",
    );

    if (!confirmed) return;

    startTransition(async () => {
      const response = await deleteSupportConversationAction(conversationId);
      if (response?.error) {
        toast.error(response.error);
        return;
      }

      setConversations((prev) =>
        prev.filter((ticket) => ticket.id !== conversationId),
      );

      toast.success("Conversation deleted");
    });
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
      <section className="card-premium rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
              <Sparkles className="h-3.5 w-3.5" />
              Support inbox
            </p>
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                {mode === "staff"
                  ? "Customer support tickets"
                  : "My support tickets"}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
                {mode === "staff"
                  ? "Track pending requests, assignment, and unread customer replies in one place."
                  : "Review replies from the support team and keep every conversation in one secure thread."}
              </p>
            </div>
          </div>

          {mode !== "staff" ? (
            <Button
              onClick={() => setCreateOpen(true)}
              className="rounded-full bg-[linear-gradient(135deg,var(--brand-blue),#1e74c6)] px-5 text-white shadow-[0_18px_40px_-22px_rgba(60,158,224,0.9)] hover:bg-[linear-gradient(135deg,#4aa7eb,#1e74c6)]"
            >
              New support ticket
            </Button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,17,37,0.98))] text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Inbox className="h-4 w-4" />
              Tickets
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search ticket ID, subject, name..."
                  className="h-11 rounded-2xl border-white/10 bg-white/[0.04] pl-10 text-white placeholder:text-slate-500 focus-visible:ring-sky-400/40"
                />
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                <Select
                  value={sort}
                  onValueChange={(value) => setSort(value as SupportInboxSort)}
                >
                  <SelectTrigger className="h-10 flex-1 rounded-2xl border-white/10 bg-white/[0.04] text-white">
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

            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    filter === item.key
                      ? "border-sky-400/40 bg-sky-500/15 text-sky-200"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-3">
              {filteredConversations.length ? (
                filteredConversations.map((ticket) => (
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
                      "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {ticket.subject}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {ticket.ticketId} · {getPreviewSubtitle(ticket)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {ticket.unreadCount > 0 ? (
                          <Badge className="rounded-full bg-sky-500/15 px-2.5 py-1 text-[11px] text-sky-200">
                            {ticket.unreadCount}
                          </Badge>
                        ) : null}

                        {canManageTickets ? (
                          <div className="flex items-center gap-1 opacity-100 transition group-hover:opacity-100 lg:opacity-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isPending}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleAssignToMe(ticket.id);
                              }}
                              className="h-8 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 text-[11px] text-sky-200 hover:bg-sky-500/20 hover:text-white"
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
                                className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-red-500/15 hover:text-red-200"
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

                    <div className="mt-4 grid gap-2 text-xs text-slate-400">
                      <div className="flex items-center justify-between gap-3">
                        <span>{getSupportStatusLabel(ticket.status)}</span>
                        <span>
                          {formatRelativeTime(
                            ticket.lastMessageAt ?? ticket.updatedAt,
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
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-400">
                  No support tickets match your filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,17,37,0.99))] text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
          <CardContent className="flex min-h-full flex-col justify-between p-5">
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Dedicated thread view
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  Support tickets in a thread
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  You can view and reply to support tickets in a dedicated
                  thread view.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Total tickets
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {stats.total}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Unread
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {stats.unread}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Open
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {stats.open}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Pending
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {stats.waiting}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
              Tip: Use the filters above to narrow down your search.
            </div>
          </CardContent>
        </Card>
      </section>

      {mode !== "staff" ? (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="border-white/10 bg-zinc-950 text-white sm:max-w-xl">
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
    </div>
  );
}
