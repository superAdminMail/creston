"use client";

import { ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserRole } from "@/generated/prisma/client";
import type { SupportInboxMode } from "@/lib/support/supportConversationView";

type Props = {
  mode: SupportInboxMode;
  viewerRole: UserRole;
  onCreateTicket: () => void;
  onSendVerification: () => void;
};

export default function SupportInboxHeader({
  mode,
  viewerRole,
  onCreateTicket,
  onSendVerification,
}: Props) {
  const isStaffView = mode === "staff";
  const isSuperAdmin = viewerRole === UserRole.SUPER_ADMIN;

  const title = isStaffView
    ? isSuperAdmin
      ? "Executive support tickets"
      : "Customer support tickets"
    : "My support tickets";

  const description = isStaffView
    ? isSuperAdmin
      ? "Track every open request, ownership, and unread reply from the platform control seat."
      : "Track pending requests, assignment, and unread customer replies in one place."
    : "Review replies from the support team and keep every conversation in one secure thread.";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <p className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-900 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-sky-300">
          <Sparkles className="h-3.5 w-3.5" />
          Support inbox
        </p>

        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl">
            {title}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            {description}
          </p>
        </div>
      </div>

      {isStaffView ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            onClick={onSendVerification}
            variant="outline"
            className="rounded-full border border-sky-400/20 bg-sky-500/10 px-5 text-sky-900 shadow-sm hover:bg-sky-500/20 hover:text-sky-950 dark:text-sky-200 dark:hover:text-white"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Send support verification
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          onClick={onCreateTicket}
          className="rounded-full bg-[#3c9ee0] px-5 text-white shadow-[0_18px_40px_-22px_rgba(60,158,224,0.9)] hover:bg-[#2f8bd0]"
        >
          New support ticket
        </Button>
      )}
    </div>
  );
}
