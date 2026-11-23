"use client";

import SupportDeleteConversationDialog from "../support/SupportDeleteConversationDialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  conversationCount: number;
};

export default function SupportBulkDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  conversationCount,
}: Props) {
  return (
    <SupportDeleteConversationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      isPending={isPending}
      conversationCount={conversationCount}
    />
  );
}
