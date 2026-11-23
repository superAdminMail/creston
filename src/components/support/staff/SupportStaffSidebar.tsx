"use client";

import { SupportVerificationPreview } from "@/actions/admin/support/getSupportVerificationsAction";
import SupportTeamQueue from "./SupportTeamQueue";
import SupportVerificationList from "@/app/account/dashboard/admin/_components/SupportVerificationList";

type Props = {
  stats: {
    total: number;
    unread: number;
    open: number;
    waiting: number;
  };
  verifications: SupportVerificationPreview[];
};

export default function SupportStaffSidebar({ stats, verifications }: Props) {
  return (
    <aside className="space-y-5">
      <SupportTeamQueue stats={stats} />
      <SupportVerificationList verifications={verifications} />
    </aside>
  );
}
