import { redirect } from "next/navigation";

import SupportInboxWorkspace from "@/components/support/SupportInboxWorkspace";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { getSupportInboxConversations } from "@/lib/support/supportConversationService";
import { prisma } from "@/lib/prisma";
import { getSupportVerificationsAction } from "@/actions/admin/support/getSupportVerificationsAction";

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const { userId, role } = await requireDashboardRoleAccess([
    "ADMIN",
    "SUPER_ADMIN",
  ]);

  const { conversation } = await searchParams;

  if (conversation) {
    redirect(`/account/dashboard/admin/support/${conversation}`);
  }

  const [inbox, users, verificationsResponse] = await Promise.all([
    getSupportInboxConversations({
      viewerUserId: userId,
      viewerRole: role,
      mode: "staff",
      sort: "latest",
    }),

    prisma.user.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 300,
    }),

    getSupportVerificationsAction(),
  ]);

  const verifications = verificationsResponse.success
    ? verificationsResponse.verifications
    : [];

  return (
    <div className="mx-auto min-h-[calc(100dvh-7rem)] max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <SupportInboxWorkspace
        mode="staff"
        viewerId={userId}
        viewerRole={role}
        initialConversations={inbox}
        users={users}
        verifications={verifications}
      />
    </div>
  );
}
