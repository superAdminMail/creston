"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";

import ChatBox from "@/components/inbox/ChatBox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DrawerSurface } from "@/components/ui/drawer-surface";
import { SenderType } from "@/generated/prisma/client";
import { sendSupportMessageAction } from "@/actions/inbox/admin/sendSupportMessageAction";
import { sendMessageAction } from "@/actions/inbox/sendMessageAction";
import { deleteConversationAction } from "@/actions/inbox/deleteConversationAction";
import SupportDeleteConversationDialog from "./SupportDeleteConversationDialog";
import { cn } from "@/lib/utils";
import {
  getSupportPriorityLabel,
  getSupportRoleLabel,
  getSupportStatusLabel,
  type SupportConversationThread,
  type SupportInboxMode,
} from "@/lib/support/supportConversationView";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "@/app/account/dashboard/_components/dashboardSurfaces";

type Props = {
  mode: SupportInboxMode;
  viewerId: string;
  conversation: SupportConversationThread;
  backPath?: string;
};

const SUPPORT_PANEL_CLASS = cn(
  DASHBOARD_PAGE_PANEL_CLASS,
  "rounded-[2rem] p-6 sm:p-8",
);

const SUPPORT_SURFACE_CLASS = cn(
  DASHBOARD_PAGE_SURFACE_CLASS,
  "rounded-[1.9rem]",
);

function formatDateTime(value?: string | null) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

function formatDateShort(value?: string | null) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatSupportLabel(value?: string | null) {
  if (!value) return "Unknown";

  return value
    .split("_")
    .filter(Boolean)
    .map((segment) => segment.charAt(0) + segment.slice(1).toLowerCase())
    .join(" ");
}

function SupportTicketInfoBlock({
  conversation,
}: {
  conversation: SupportConversationThread;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="grid gap-3 text-sm">
          <div className="flex items-start justify-between gap-3">
            <span className="text-slate-600 dark:text-slate-400">
              Ticket ID
            </span>
            <span className="font-medium text-slate-950 dark:text-white">
              {conversation.ticketId}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-slate-600 dark:text-slate-400">Type</span>
            <span className="font-medium text-slate-950 dark:text-white">
              {formatSupportLabel(conversation.type)}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-slate-600 dark:text-slate-400">Status</span>
            <Badge className="rounded-full bg-slate-200/80 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200">
              {getSupportStatusLabel(conversation.status)}
            </Badge>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-slate-600 dark:text-slate-400">Priority</span>
            <span className="font-medium text-slate-950 dark:text-white">
              {getSupportPriorityLabel(conversation.priority)}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-slate-600 dark:text-slate-400">
              Opened by
            </span>
            <span className="font-medium text-slate-950 dark:text-white">
              {conversation.openedBy.name}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-slate-600 dark:text-slate-400">Contact</span>
            <span className="text-right font-medium text-slate-950 dark:text-white">
              {conversation.contactName ?? conversation.openedBy.name}
              {conversation.contactEmail ? (
                <span className="mt-1 block text-xs font-normal text-slate-600 dark:text-slate-400">
                  {conversation.contactEmail}
                </span>
              ) : null}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-slate-600 dark:text-slate-400">
              Assigned to
            </span>
            <span className="font-medium text-slate-950 dark:text-white">
              {conversation.assignedTo?.name ?? "Unassigned"}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-slate-600 dark:text-slate-400">
              First response
            </span>
            <span className="font-medium text-slate-950 dark:text-white">
              {conversation.firstResponder?.name ?? "Pending"}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-slate-600 dark:text-slate-400">
              Last response
            </span>
            <span className="font-medium text-slate-950 dark:text-white">
              {conversation.lastResponder?.name ?? "Pending"}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-slate-600 dark:text-slate-400">Created</span>
            <span className="font-medium text-slate-950 dark:text-white">
              {formatDateTime(conversation.createdAt)}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-slate-600 dark:text-slate-400">Updated</span>
            <span className="font-medium text-slate-950 dark:text-white">
              {formatDateTime(conversation.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-500">
          Thread members
        </p>
        <div className="mt-3 space-y-2 text-sm">
          {conversation.members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-950 dark:text-white">
                  {member.user.name}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {getSupportRoleLabel(member.user.role)}
                </p>
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400">
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

      <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Users className="h-4 w-4 text-sky-700 dark:text-sky-300" />
          Conversation context
        </div>
        <Separator className="my-3 bg-slate-200/80 dark:bg-white/10" />
        <p>
          {conversation.source ? `Source: ${conversation.source}. ` : ""}
          Replies are visible only to the ticket owner and assigned support
          staff.
        </p>
      </div>
    </div>
  );
}

export default function SupportConversationDetailWorkspace({
  mode,
  viewerId,
  conversation,
  backPath,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [ticketDrawerOpen, setTicketDrawerOpen] = useState(false);
  const isStaffView = mode === "staff";
  const resolvedBackPath =
    backPath ??
    (isStaffView
      ? "/account/dashboard/admin/support"
      : "/account/dashboard/user/support");

  const sendAction = isStaffView ? sendSupportMessageAction : sendMessageAction;
  const canDeleteConversation = !isStaffView;

  const handleDeleteConversation = () => {
    startTransition(async () => {
      const result = await deleteConversationAction(conversation.id);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Conversation deleted");
      setDeleteOpen(false);
      setTicketDrawerOpen(false);
      router.push(resolvedBackPath);
      router.refresh();
    });
  };

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

  const userSubtitle = conversation.assignedTo?.name
    ? `Support agent: ${conversation.assignedTo.name}`
    : conversation.lastResponder?.name
      ? `Support agent: ${conversation.lastResponder.name}`
      : "Support agent";

  if (!isStaffView) {
    return (
      <>
        <ChatBox
          key={conversation.id}
          conversationId={conversation.id}
          initialMessages={conversation.messages}
          title={conversation.subject}
          subtitle={userSubtitle}
          forceOnline={false}
          presenceTargetRoles={["ADMIN", "MODERATOR", "SUPER_ADMIN"]}
          viewerSenderType={SenderType.USER}
          incomingSenderTypes={[SenderType.SUPPORT, SenderType.SYSTEM]}
          canReply={conversation.canReply}
          fillViewport
          selfUserId={viewerId}
          senderLookup={senderLookup}
          sendAction={sendAction}
          onOpenMenu={() => setTicketDrawerOpen(true)}
          onSendComplete={() => {
            router.refresh();
          }}
          sendLabel="Send"
        />

        <SupportDeleteConversationDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDeleteConversation}
          isPending={isPending}
          conversationCount={1}
        />

        <Drawer
          open={ticketDrawerOpen}
          onOpenChange={setTicketDrawerOpen}
          direction="right"
        >
          <DrawerSurface
            tone="light"
            className="h-full overflow-hidden data-[vaul-drawer-direction=right]:w-[min(92vw,34rem)] data-[vaul-drawer-direction=right]:rounded-l-[1.75rem] data-[vaul-drawer-direction=right]:sm:max-w-[34rem]"
          >
            <div className="flex h-full min-h-0 flex-col">
              <DrawerHeader className="border-b border-slate-200/80 px-5 pb-4 pt-5 dark:border-white/10 md:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <DrawerTitle className="text-left text-xl tracking-[-0.03em] text-slate-950 dark:text-white">
                      Ticket details
                    </DrawerTitle>
                    <DrawerDescription className="text-left text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Review the support ticket metadata without leaving the
                      chat.
                    </DrawerDescription>
                  </div>

                  <DrawerClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full border border-slate-200/80 bg-white/80 text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">
                <SupportTicketInfoBlock conversation={conversation} />
              </div>

              <DrawerFooter className="border-t border-slate-200/80 bg-white/75 px-5 py-4 dark:border-white/10 dark:bg-white/[0.04] md:px-6">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDeleteOpen(true)}
                    className="h-11 rounded-full border border-red-500/20 bg-red-500/10 px-4 text-sm text-red-700 hover:bg-red-500/15 hover:text-red-950 dark:text-red-200 dark:hover:text-white"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete conversation
                  </Button>
                  <DrawerClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-11 rounded-full border border-slate-200/80 bg-white/80 px-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white"
                    >
                      Close
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerFooter>
            </div>
          </DrawerSurface>
        </Drawer>
      </>
    );
  }

  return (
    <>
      <div
        className={
          isStaffView
            ? "space-y-6"
            : "flex min-h-[calc(100dvh-7rem)] flex-col gap-5"
        }
      >
        {isStaffView ? (
          <section className={SUPPORT_PANEL_CLASS}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push(resolvedBackPath)}
                  className="w-fit rounded-full border border-border/60 bg-white/80 px-4 text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to inbox
                </Button>

                <div className="space-y-3">
                  <p className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-900 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-sky-300">
                    Support ticket
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl">
                    {conversation.subject}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span>{conversation.ticketId}</span>
                    <span className="text-slate-300 dark:text-white/20">•</span>
                    <span>
                      Opened {formatDateShort(conversation.createdAt)}
                    </span>
                    <span className="text-slate-300 dark:text-white/20">•</span>
                    <span>{getSupportStatusLabel(conversation.status)}</span>
                    <span className="text-slate-300 dark:text-white/20">•</span>
                    <span>{conversation.messages.length} messages</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-full bg-slate-200/80 px-3 py-1.5 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200">
                  {getSupportStatusLabel(conversation.status)}
                </Badge>
                <Badge className="rounded-full bg-slate-200/80 px-3 py-1.5 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200">
                  {getSupportPriorityLabel(conversation.priority)}
                </Badge>
                {conversation.assignedTo ? (
                  <Badge className="rounded-full bg-sky-500/15 px-3 py-1.5 text-sky-900 dark:text-sky-200">
                    Assigned to {conversation.assignedTo.name}
                  </Badge>
                ) : (
                  <Badge className="rounded-full bg-amber-500/15 px-3 py-1.5 text-amber-800 dark:text-amber-200">
                    Unassigned
                  </Badge>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="flex min-h-0 flex-1 justify-center">
            <ChatBox
              key={conversation.id}
              conversationId={conversation.id}
              initialMessages={conversation.messages}
              title={conversation.subject}
              subtitle={userSubtitle}
              forceOnline={false}
              presenceTargetRoles={["ADMIN", "MODERATOR", "SUPER_ADMIN"]}
              viewerSenderType={SenderType.USER}
              incomingSenderTypes={[SenderType.SUPPORT, SenderType.SYSTEM]}
              canReply={conversation.canReply}
              selfUserId={viewerId}
              senderLookup={senderLookup}
              sendAction={sendAction}
              onOpenMenu={() => setTicketDrawerOpen(true)}
              onSendComplete={() => {
                router.refresh();
              }}
              sendLabel="Send"
            />
          </section>
        )}

        {isStaffView ? (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <Card
              className={cn(
                SUPPORT_SURFACE_CLASS,
                "overflow-hidden text-slate-950 dark:text-white",
              )}
            >
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

            <Card
              className={cn(
                SUPPORT_SURFACE_CLASS,
                "text-slate-950 dark:text-white",
              )}
            >
              <CardContent className="space-y-4 p-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-500">
                    Ticket details
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    Thread metadata
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Ownership, assignment, and response history in one place.
                  </p>
                </div>

                <SupportTicketInfoBlock conversation={conversation} />
              </CardContent>
            </Card>
          </section>
        ) : null}

        {!isStaffView ? (
          <SupportDeleteConversationDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onConfirm={handleDeleteConversation}
            isPending={isPending}
            conversationCount={1}
          />
        ) : null}
      </div>

      {!isStaffView ? (
        <Drawer
          open={ticketDrawerOpen}
          onOpenChange={setTicketDrawerOpen}
          direction="right"
        >
          <DrawerSurface
            tone="light"
            className="h-full overflow-hidden data-[vaul-drawer-direction=right]:w-[min(92vw,34rem)] data-[vaul-drawer-direction=right]:rounded-l-[1.75rem] data-[vaul-drawer-direction=right]:sm:max-w-[34rem]"
          >
            <div className="flex h-full min-h-0 flex-col">
              <DrawerHeader className="border-b border-slate-200/80 px-5 pb-4 pt-5 dark:border-white/10 md:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <DrawerTitle className="text-left text-xl tracking-[-0.03em] text-slate-950 dark:text-white">
                      Ticket details
                    </DrawerTitle>
                    <DrawerDescription className="text-left text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Review the support ticket metadata without leaving the
                      chat.
                    </DrawerDescription>
                  </div>

                  <DrawerClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full border border-slate-200/80 bg-white/80 text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">
                <SupportTicketInfoBlock conversation={conversation} />
              </div>

              <DrawerFooter className="border-t border-slate-200/80 bg-white/75 px-5 py-4 dark:border-white/10 dark:bg-white/[0.04] md:px-6">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDeleteOpen(true)}
                    className="h-11 rounded-full border border-red-500/20 bg-red-500/10 px-4 text-sm text-red-700 hover:bg-red-500/15 hover:text-red-950 dark:text-red-200 dark:hover:text-white"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete conversation
                  </Button>
                  <DrawerClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-11 rounded-full border border-slate-200/80 bg-white/80 px-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white"
                    >
                      Close
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerFooter>
            </div>
          </DrawerSurface>
        </Drawer>
      ) : null}
    </>
  );
}
