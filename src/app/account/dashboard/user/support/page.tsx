import { redirect } from "next/navigation";

import SupportInboxWorkspace from "@/components/support/SupportInboxWorkspace";
import { getCurrentUserId, getCurrentUserRole } from "@/lib/getCurrentUser";
import { getSupportInboxConversations } from "@/lib/support/supportConversationService";

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const userId = await getCurrentUserId();
  const role = await getCurrentUserRole();

  if (!userId || !role) {
    redirect("/auth/login");
  }

  const { conversation } = await searchParams;
  if (conversation) {
    redirect(`/account/dashboard/user/support/${conversation}`);
  }

  const inbox = await getSupportInboxConversations({
    viewerUserId: userId,
    viewerRole: role,
    mode: "user",
    sort: "latest",
  });

  return (
    <div className="mx-auto min-h-[calc(100dvh-7rem)] max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <SupportInboxWorkspace
        mode="user"
        viewerId={userId}
        viewerRole={role}
        initialConversations={inbox}
      />
    </div>
  );
}
