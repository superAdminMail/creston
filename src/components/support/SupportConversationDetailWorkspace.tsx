"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";

import ChatBox from "@/components/inbox/ChatBox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  backPath?: string;
};

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
            <span className="text-slate-600 dark:text-slate-400">Ticket ID</span>
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
            <span className="text-slate-600 dark:text-slate-400">Opened by</span>
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
  const canDeleteConversation = !isStaffView;
  const resolvedBackPath = backPath ?? "/account/dashboard/user/support";

  const sendAction = isStaffView ? sendSupportMessageAction : sendMessageAction;

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

  const subtitle = (() => {
    const staffResponder = [...conversation.messages]
      .reverse()
      .find((message) =>
        message.senderRole === "ADMIN" ||
        message.senderRole === "MODERATOR" ||
        message.senderRole === "SUPER_ADMIN",
      );

    const responderName = staffResponder?.senderName?.trim();
    if (responderName) return responderName;

    const assignedName = conversation.assignedTo?.name?.trim();
    if (assignedName) return assignedName;

    return "support agent";
  })();

  return (
    <>
      <ChatBox
        key={conversation.id}
        conversationId={conversation.id}
        initialMessages={conversation.messages}
        title={conversation.subject}
        subtitle={subtitle}
        forceOnline={false}
        presenceTargetRoles={["ADMIN", "MODERATOR", "SUPER_ADMIN"]}
        viewerSenderType={isStaffView ? SenderType.SUPPORT : SenderType.USER}
        incomingSenderTypes={
          isStaffView
            ? [SenderType.USER]
            : [SenderType.SUPPORT, SenderType.SYSTEM]
        }
        canReply={conversation.canReply}
        fillViewport
        selfUserId={viewerId}
        senderLookup={senderLookup}
        sendAction={sendAction}
        onOpenMenu={() => setTicketDrawerOpen(true)}
        onSendComplete={() => {
          router.refresh();
        }}
        sendLabel={isStaffView ? "Reply" : "Send"}
      />

      {!isStaffView ? (
        <SupportDeleteConversationDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDeleteConversation}
          isPending={isPending}
          conversationCount={1}
        />
      ) : null}

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
                    Review the support ticket metadata without leaving the chat.
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
                {canDeleteConversation ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDeleteOpen(true)}
                    className="h-11 rounded-full border border-red-500/20 bg-red-500/10 px-4 text-sm text-red-700 hover:bg-red-500/15 hover:text-red-950 dark:text-red-200 dark:hover:text-white"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete conversation
                  </Button>
                ) : null}
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
