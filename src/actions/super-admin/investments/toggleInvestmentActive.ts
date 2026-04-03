"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";

export async function toggleInvestmentActive(investmentId: string) {
  const { userId } = await requireSuperAdminAccess();

  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  });

  if (!investment) {
    throw new Error("Investment not found.");
  }

  const nextIsActive = !investment.isActive;

  await prisma.investment.update({
    where: { id: investmentId },
    data: {
      isActive: nextIsActive,
    },
  });

  await logAuditEvent({
    actorUserId: userId,
    action: "investment.toggled-active",
    entityType: "Investment",
    entityId: investmentId,
    description: `${nextIsActive ? "Activated" : "Deactivated"} investment ${investment.name}.`,
    metadata: {
      previousIsActive: investment.isActive,
      nextIsActive,
    },
  });

  revalidatePath("/account/dashboard/super-admin/investments");
  revalidatePath(`/account/dashboard/super-admin/investments/${investmentId}`);
}
