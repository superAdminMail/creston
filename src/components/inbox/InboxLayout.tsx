"use client";

import { useMemo, useState } from "react";
import InboxList from "./InboxList";
import ChatMessages from "./ChatMessages";
import EmptyInboxState from "./EmptyInboxState";
import NewConversationModal from "./NewConversationModal";
import { InboxPreview } from "@/lib/types/chat.types";
import { SenderType } from "@/generated/prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type PresenceRole = "ADMIN" | "MODERATOR" | "SUPER_ADMIN" | "USER";

type Props = {
  conversations: InboxPreview[];
  currentUserId: string;
  initialActiveId?: string | null;
};

function isIncomingPreview(
  payload: {
    senderType: SenderType;
  },
) {
  return payload.senderType === "SUPPORT" || payload.senderType === "SYSTEM";
}

function getConversationTitle(conversation: InboxPreview) {
  if (conversation.agentId) {
    return conversation.agentName ?? "Support Agent";
  }

  return "Support Assistant";
}

function getConversationSubtitle(conversation: InboxPreview) {
  if (conversation.agentId) {
    return conversation.agentName
      ? `Assigned to ${conversation.agentName}`
      : "Support ticket";
  }

  return conversation.participantName
    ? `Assigned to ${conversation.participantName}`
    : "Support ticket";
}

function getConversationMeta(conversation: InboxPreview) {
  if (conversation.agentId) {
    return conversation.agentName
      ? `Assigned to ${conversation.agentName}`
      : "Support ticket";
  }

  return conversation.participantName
    ? `Assigned to ${conversation.participantName}`
    : "Support ticket";
}

function getPresenceTargetRoles(conversation: InboxPreview) {
  if (conversation.participantRole) {
    return [conversation.participantRole] as PresenceRole[];
  }

  return ["ADMIN", "MODERATOR", "SUPER_ADMIN", "USER"] as PresenceRole[];
}

export default function InboxLayout({
  conversations,
  currentUserId,
  initialActiveId,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [list, setList] = useState(conversations);
  const [activeId, setActiveId] = useState<string | null>(
    initialActiveId ?? null,
  );
  const [open, setOpen] = useState(false);
  const [mobileListOpen, setMobileListOpen] = useState(false);

  const hasConversations = list.length > 0;
  const active = useMemo(
    () => list.find((conversation) => conversation.id === activeId) ?? null,
    [activeId, list],
  );

  const updateConversationQuery = (conversationId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (conversationId) {
      params.set("conversation", conversationId);
    } else {
      params.delete("conversation");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const handlePreviewUpdate = (payload: {
    conversationId: string;
    content: string;
    senderType: SenderType;
    createdAt: string;
  }) => {
    setList((prev) => {
      const index = prev.findIndex(
        (conversation) => conversation.id === payload.conversationId,
      );
      if (index === -1) return prev;

      const current = prev[index];
      const nextUnread =
        isIncomingPreview(payload) && activeId !== payload.conversationId
          ? current.unreadCount + 1
          : activeId === payload.conversationId
            ? 0
            : current.unreadCount;

      const updated: InboxPreview = {
        ...current,
        unreadCount: nextUnread,
        lastMessage: {
          content: payload.content,
          senderType: payload.senderType,
          createdAt: payload.createdAt,
        },
      };

      const next = [...prev];
      next.splice(index, 1);
      next.unshift(updated);
      return next;
    });
  };

  if (!hasConversations) {
    return (
      <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-center border bg-background px-6">
        <EmptyInboxState onNewConversation={() => setOpen(true)} />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Support Ticket</DialogTitle>
            </DialogHeader>

            <NewConversationModal
              onClose={() => setOpen(false)}
              onCreated={(conversation) => {
                const createdConversation: InboxPreview = {
                  id: conversation.id,
                  type: "SUPPORT",
                  subject: conversation.subject,
                  unreadCount: 0,
                  canDelete: true,
                };

                setList([createdConversation]);
                setActiveId(conversation.id);
                updateConversationQuery(conversation.id);
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <main className="mx-auto h-full min-h-0 w-full max-w-5xl overflow-hidden border bg-white/10">
      <div className="flex h-full w-full overflow-hidden">
        {/* 🟢 SIDEBAR (Inbox List) */}
        <aside
          className={cn(
            "h-full w-full bg-background md:w-[320px] md:border-r",
            // mobile behavior
            activeId ? "hidden md:block" : "block",
          )}
        >
          <InboxList
            conversations={list}
            activeId={activeId}
            currentUserId={currentUserId}
            onSelect={(id) => {
              setActiveId(id);
              updateConversationQuery(id);

              setList((prev) =>
                prev.map((conversation) =>
                  conversation.id === id
                    ? { ...conversation, unreadCount: 0 }
                    : conversation,
                ),
              );
            }}
            onNew={() => setOpen(true)}
            onDeleteConversation={(id) => {
              setList((prev) =>
                prev.filter((conversation) => conversation.id !== id),
              );
              const nextActiveId = activeId === id ? null : activeId;
              setActiveId(nextActiveId);
              updateConversationQuery(nextActiveId);
            }}
            onClearAll={() => {
              setList((prev) =>
                prev.filter((conversation) => !conversation.canDelete),
              );
              if (active?.canDelete) {
                setActiveId(null);
                updateConversationQuery(null);
              }
            }}
          />
        </aside>

        {/* 🔵 CHAT AREA */}
        <section
          className={cn(
            "flex h-full w-full flex-col",
            // mobile behavior
            !activeId ? "hidden md:flex" : "flex",
          )}
        >
          {!active ? (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              Select a conversation
            </div>
          ) : (
            <ChatMessages
              conversationId={active.id}
              title={getConversationTitle(active)}
              subtitle={getConversationSubtitle(active)}
              forceOnline={active.type === "SUPPORT" && !active.agentId}
              presenceTargetRoles={getPresenceTargetRoles(active)}
              // 🔥 THIS IS YOUR BACK BUTTON TRIGGER
              onOpenMenu={() => {
                setActiveId(null); // 👈 go back to list
                updateConversationQuery(null);
              }}
              onPreviewUpdate={(payload) =>
                handlePreviewUpdate({
                  conversationId: active.id,
                  ...payload,
                })
              }
            />
          )}
        </section>

        {/* 🧾 MODAL */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Support Ticket</DialogTitle>
            </DialogHeader>

            <NewConversationModal
              onClose={() => setOpen(false)}
              onCreated={(conversation) => {
                const createdConversation: InboxPreview = {
                  id: conversation.id,
                  type: "SUPPORT",
                  subject: conversation.subject,
                  unreadCount: 0,
                  canDelete: true,
                };

                setList((prev) => [createdConversation, ...prev]);
                setActiveId(conversation.id);
                updateConversationQuery(conversation.id);
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
