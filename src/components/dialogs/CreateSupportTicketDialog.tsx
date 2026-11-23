"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NewConversationModal from "@/components/inbox/NewConversationModal";
import type { NewConversation } from "@/lib/types/chat.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (conversation: NewConversation) => void;
};

export default function CreateSupportTicketDialog({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/60 bg-white/96 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-950/96 dark:text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create support ticket</DialogTitle>
        </DialogHeader>

        <NewConversationModal
          onClose={() => onOpenChange(false)}
          onCreated={onCreated}
        />
      </DialogContent>
    </Dialog>
  );
}
