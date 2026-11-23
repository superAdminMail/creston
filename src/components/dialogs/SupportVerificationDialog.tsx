"use client";

import SendSupportVerificationDialog from "@/app/account/dashboard/admin/_components/SendSupportVerificationDialog";

export type SupportVerificationUserOption = {
  id: string;
  name: string | null;
  email: string;
};

type Props = {
  siteName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: SupportVerificationUserOption[];
};

export default function SupportVerificationDialog({
  siteName,
  open,
  onOpenChange,
  users,
}: Props) {
  return (
    <SendSupportVerificationDialog
      siteName={siteName}
      open={open}
      onOpenChange={onOpenChange}
      users={users}
    />
  );
}
