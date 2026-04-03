"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";

export async function deleteInvestment(investmentId: string) {
  const { userId } = await requireSuperAdminAccess();

  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    select: {
      id: true,
      name: true,
      investmentPlans: {
        select: {
          id: true,
        },
        take: 1,
      },
    },
  });

  if (!investment) {
    redirect("/account/dashboard/super-admin/investments?toast=not-found");
  }

  if (investment.investmentPlans.length > 0) {
    redirect(
      `/account/dashboard/super-admin/investments/${investmentId}?toast=delete-blocked-plans`,
    );
  }

  await prisma.investment.delete({
    where: { id: investmentId },
  });

  await logAuditEvent({
    actorUserId: userId,
    action: "investment.deleted",
    entityType: "Investment",
    entityId: investmentId,
    description: `Deleted investment ${investment.name}.`,
    metadata: {
      name: investment.name,
    },
  });

  redirect("/account/dashboard/super-admin/investments?toast=deleted");
}
