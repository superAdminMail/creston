"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SupportDeleteConversationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
  conversationCount?: number;
};

export default function SupportDeleteConversationDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
  conversationCount = 1,
}: SupportDeleteConversationDialogProps) {
  const isBatch = conversationCount > 1;
  const title = isBatch
    ? "Delete support conversations?"
    : "Delete support conversation?";
  const description = isBatch
    ? `This action permanently removes ${conversationCount} selected support tickets and their messages. The users will no longer be able to view them.`
    : "This action permanently removes the selected support ticket and its messages.";
  const confirmLabel = isBatch
    ? `Delete ${conversationCount} conversations`
    : "Delete conversation";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="leading-6">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="bg-red-600 text-white hover:bg-red-700"
            disabled={isPending}
          >
            {isPending ? "Deleting..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
