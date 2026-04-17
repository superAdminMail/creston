"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import ChatBox from "@/components/inbox/ChatBox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SenderType } from "@/generated/prisma/client";
import { sendSupportMessageAction } from "@/actions/inbox/admin/sendSupportMessageAction";
import { sendMessageAction } from "@/actions/inbox/sendMessageAction";
import { deleteConversationAction } from "@/actions/inbox/deleteConversationAction";
import {
  getSupportPriorityLabel,
  getSupportRoleLabel,
  getSupportStatusLabel,
  type SupportConversationThread,
  type SupportInboxMode,
} from "@/lib/support/supportConversationView";

type Props = {
  mode: SupportInboxMode;
  viewerId: string;
  conversation: SupportConversationThread;
};

function formatDateTime(value?: string | null) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateShort(value?: string | null) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SupportConversationDetailWorkspace({
  mode,
  viewerId,
  conversation,
}: Props) {
  const router = useRouter();
  const isStaffView = mode === "staff";
  const backPath = isStaffView
    ? "/account/dashboard/admin/support"
    : "/account/dashboard/user/support";

  const sendAction = isStaffView ? sendSupportMessageAction : sendMessageAction;
  const canDeleteConversation = !isStaffView;

  const senderLookup = useMemo(() => {
    const lookup: Record<
      string,
      {
        name: string;
        email?: string | null;
        role?: SupportConversationThread["openedBy"]["role"];
      }
    > = {};

    if (conversation.openedBy.id) {
      lookup[conversation.openedBy.id] = {
        name: conversation.openedBy.name,
        email: conversation.openedBy.email,
        role: conversation.openedBy.role,
      };
    }

    if (conversation.assignedTo?.id) {
      lookup[conversation.assignedTo.id] = {
        name: conversation.assignedTo.name,
        email: conversation.assignedTo.email,
        role: conversation.assignedTo.role,
      };
    }

    for (const member of conversation.members) {
      if (!member.userId) continue;
      lookup[member.userId] = {
        name: member.user.name,
        email: member.user.email,
        role: member.user.role,
      };
    }

    return lookup;
  }, [conversation]);

  return (
    <div
      className={
        isStaffView
          ? "space-y-6"
          : "flex min-h-[calc(100dvh-7rem)] flex-col gap-5"
      }
    >
      <section
        className={
          isStaffView
            ? "card-premium rounded-[2rem] p-6 sm:p-8"
            : "rounded-[2rem] border border-sky-500/10 bg-[linear-gradient(180deg,rgba(7,15,32,0.98),rgba(8,17,37,0.96))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.2)] sm:p-8"
        }
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(backPath)}
              className={
                isStaffView
                  ? "w-fit rounded-full border border-white/10 bg-white/[0.04] px-4 text-slate-200 hover:bg-white/[0.08] hover:text-white"
                  : "w-fit rounded-full border border-white/10 bg-white/[0.06] px-4 text-slate-100 hover:bg-white/[0.1] hover:text-white"
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to inbox
            </Button>

            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                {isStaffView ? "Support ticket" : "My support ticket"}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                {conversation.subject}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                <span>{conversation.ticketId}</span>
                <span className="text-white/20">•</span>
                <span>Opened {formatDateShort(conversation.createdAt)}</span>
                <span className="text-white/20">•</span>
                <span>{getSupportStatusLabel(conversation.status)}</span>
                <span className="text-white/20">•</span>
                <span>{conversation.messages.length} messages</span>
              </div>

              {canDeleteConversation ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      const confirmed = window.confirm(
                        "Delete this support conversation?",
                      );
                      if (!confirmed) return;

                      void (async () => {
                        const result = await deleteConversationAction(
                          conversation.id,
                        );

                        if (result?.error) {
                          toast.error(result.error);
                          return;
                        }

                        toast.success("Conversation deleted");
                        router.push("/account/dashboard/user/support");
                        router.refresh();
                      })();
                    }}
                    className="h-9 rounded-full border border-red-500/20 bg-red-500/10 px-4 text-sm text-red-200 hover:bg-red-500/15 hover:text-white"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete conversation
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-white/[0.06] px-3 py-1.5 text-slate-200">
              {getSupportStatusLabel(conversation.status)}
            </Badge>
            {isStaffView ? (
              <>
                <Badge className="rounded-full bg-white/[0.06] px-3 py-1.5 text-slate-200">
                  {getSupportPriorityLabel(conversation.priority)}
                </Badge>
                {conversation.assignedTo ? (
                  <Badge className="rounded-full bg-sky-500/15 px-3 py-1.5 text-sky-200">
                    Assigned to {conversation.assignedTo.name}
                  </Badge>
                ) : (
                  <Badge className="rounded-full bg-amber-500/15 px-3 py-1.5 text-amber-200">
                    Unassigned
                  </Badge>
                )}
              </>
            ) : (
              <>
                <Badge className="rounded-full bg-sky-500/15 px-3 py-1.5 text-sky-200">
                  Private thread
                </Badge>
                <Badge className="rounded-full bg-white/[0.06] px-3 py-1.5 text-slate-200">
                  {conversation.messages.length} messages
                </Badge>
              </>
            )}
          </div>
        </div>
      </section>

      {isStaffView ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,17,37,0.99))] text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
            <CardContent className="p-0">
              <ChatBox
                key={conversation.id}
                conversationId={conversation.id}
                initialMessages={conversation.messages}
                title={conversation.subject}
                subtitle={
                  conversation.assignedTo
                    ? `Assigned to ${conversation.assignedTo.name}`
                    : getSupportStatusLabel(conversation.status)
                }
                forceOnline={false}
                presenceTargetRoles={["ADMIN", "MODERATOR", "SUPER_ADMIN"]}
                viewerSenderType={SenderType.SUPPORT}
                incomingSenderTypes={[SenderType.USER]}
                canReply={conversation.canReply}
                selfUserId={viewerId}
                senderLookup={senderLookup}
                sendAction={sendAction}
                onSendComplete={() => {
                  router.refresh();
                }}
                sendLabel="Reply"
              />
            </CardContent>
          </Card>

          <Card className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,17,37,0.99))] text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Ticket details
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  Thread metadata
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Ownership, assignment, and response history in one place.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Status</span>
                    <Badge className="rounded-full bg-white/[0.06] text-slate-200">
                      {getSupportStatusLabel(conversation.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Priority</span>
                    <span className="font-medium text-white">
                      {getSupportPriorityLabel(conversation.priority)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Opened by</span>
                    <span className="font-medium text-white">
                      {conversation.openedBy.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Assigned to</span>
                    <span className="font-medium text-white">
                      {conversation.assignedTo?.name ?? "Unassigned"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">First response</span>
                    <span className="font-medium text-white">
                      {conversation.firstResponder?.name ?? "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Last response</span>
                    <span className="font-medium text-white">
                      {conversation.lastResponder?.name ?? "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Created</span>
                    <span className="font-medium text-white">
                      {formatDateTime(conversation.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Updated</span>
                    <span className="font-medium text-white">
                      {formatDateTime(conversation.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Thread members
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  {conversation.members.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {member.user.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {getSupportRoleLabel(member.user.role)}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">
                        {member.unreadCount > 0
                          ? `${member.unreadCount} unread`
                          : member.lastReadAt
                            ? "Seen"
                            : "New"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="h-4 w-4" />
                  Conversation context
                </div>
                <Separator className="my-3 bg-white/10" />
                <p>
                  {conversation.source
                    ? `Source: ${conversation.source}. `
                    : ""}
                  Replies are visible only to the ticket owner and assigned
                  support staff.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : (
        <section className="flex min-h-0 flex-1 flex-col gap-6">
          <Card className="flex min-h-0 flex-1 overflow-hidden rounded-[1.9rem] border border-white/10 bg-white/[0.02] text-white shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
            <CardContent className="h-full p-0">
              <ChatBox
                key={conversation.id}
                conversationId={conversation.id}
                initialMessages={conversation.messages}
                title={conversation.subject}
                subtitle="Your private support thread"
                forceOnline={false}
                presenceTargetRoles={["ADMIN", "MODERATOR", "SUPER_ADMIN"]}
                viewerSenderType={SenderType.USER}
                incomingSenderTypes={[SenderType.SUPPORT, SenderType.SYSTEM]}
                canReply={conversation.canReply}
                selfUserId={viewerId}
                senderLookup={senderLookup}
                sendAction={sendAction}
                onSendComplete={() => {
                  router.refresh();
                }}
                sendLabel="Send"
              />
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
