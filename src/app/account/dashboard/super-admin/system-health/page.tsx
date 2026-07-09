import { redirect } from "next/navigation";

import { getSuperAdminSystemHealth } from "@/actions/super-admin/system-health/getSuperAdminSystemHealth";

import { SystemHealthClient } from "./_components/SystemHealthClient";

export default async function SuperAdminSystemHealthPage({
  searchParams,
}: {
  searchParams: Promise<{
    notificationPage?: string;
    proofPage?: string;
  }>;
}) {
  const { notificationPage, proofPage } = await searchParams;
  const parsedNotificationPage = notificationPage
    ? Number.parseInt(notificationPage, 10)
    : 1;
  const requestedNotificationPage =
    Number.isFinite(parsedNotificationPage) && parsedNotificationPage > 0
      ? parsedNotificationPage
      : 1;
  const parsedProofPage = proofPage ? Number.parseInt(proofPage, 10) : 1;
  const requestedProofPage =
    Number.isFinite(parsedProofPage) && parsedProofPage > 0
      ? parsedProofPage
      : 1;

  const health = await getSuperAdminSystemHealth({
    notificationPage: requestedNotificationPage,
    proofPage: requestedProofPage,
  });

  if (
    health.notificationCleanup.page !== requestedNotificationPage ||
    health.submittedProofCleanup.page !== requestedProofPage
  ) {
    const params = new URLSearchParams();

    if (health.notificationCleanup.page > 1) {
      params.set("notificationPage", String(health.notificationCleanup.page));
    }

    if (health.submittedProofCleanup.page > 1) {
      params.set("proofPage", String(health.submittedProofCleanup.page));
    }

    const query = params.toString();

    redirect(
      query
        ? `/account/dashboard/super-admin/system-health?${query}`
        : "/account/dashboard/super-admin/system-health",
    );
  }

  return <SystemHealthClient health={health} />;
}
