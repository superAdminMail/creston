"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { Loader2, Trash2, UserRoundPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BrowserLocalTimestamp } from "@/components/time/BrowserLocalTimestamp";
import { UserRole } from "@/generated/prisma/client";
import {
  getSupportStatusLabel,
  type SupportConversationPreview,
} from "@/lib/support/supportConversationView";
import { isWithdrawalPrivateSupportConversationSource } from "@/lib/support/withdrawalPrivateSupportConversation";
import { cn } from "@/lib/utils";

type Props = {
  ticket: SupportConversationPreview;
  viewerRole: UserRole;
  isStaffView: boolean;
  canManageTickets: boolean;
  canDeleteTickets: boolean;
  isPending: boolean;
  isSelected: boolean;
  onSelect: (conversationId: string) => void;
  onAssignToMe: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  onToggleSelection: (conversationId: string) => void;
};

function getPreviewSubtitle(ticket: SupportConversationPreview) {
  if (ticket.assignedTo) {
    return `Assigned to ${ticket.assignedTo.name}`;
  }

  if (ticket.type === "CONTACT_INQUIRY") {
    return ticket.openedBy.email ?? ticket.openedBy.name;
  }

  return ticket.openedBy.name;
}

export default function SupportConversationCard({
  ticket,
  viewerRole,
  isStaffView,
  canManageTickets,
  canDeleteTickets,
  isPending,
  isSelected,
  onSelect,
  onAssignToMe,
  onDelete,
  onToggleSelection,
}: Props) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(ticket.id);
    }
  };

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(ticket.id)}
      onKeyDown={handleKeyDown}
      className={cn(
        "group w-full rounded-[1.5rem] border p-4 text-left transition duration-300 hover:-translate-y-0.5",
        "border-slate-200/80 bg-white/75 hover:border-sky-300/70 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.06]",
        isSelected && "border-sky-400/30 bg-sky-500/10 dark:bg-sky-500/10",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {canDeleteTickets ? (
            <div
              onClick={stopPropagation}
              onKeyDown={(event) => event.stopPropagation()}
              role="presentation"
              className="mt-0.5"
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelection(ticket.id)}
                aria-label={`Select ${ticket.subject}`}
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
              isWithdrawalPrivateSupportConversationSource(ticket.source) ? (
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
                  onAssignToMe(ticket.id);
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
                    onDelete(ticket.id);
                  }}
                  className="h-8 w-8 shrink-0 rounded-full border border-border/60 bg-white/80 text-slate-500 hover:bg-red-500/15 hover:text-red-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-red-200"
                  aria-label={`Delete ${ticket.subject}`}
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

          <BrowserLocalTimestamp
            value={ticket.lastMessageAt ?? ticket.updatedAt}
            variant="datetime"
          />
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
  );
}
