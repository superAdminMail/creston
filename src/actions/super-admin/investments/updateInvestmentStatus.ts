"use server";

import { revalidatePath } from "next/cache";

import { InvestmentCatalogStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";

export async function updateInvestmentStatus(
  investmentId: string,
  status: InvestmentCatalogStatus,
) {
  const { userId } = await requireSuperAdminAccess();

  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  if (!investment) {
    throw new Error("Investment not found.");
  }

  await prisma.investment.update({
    where: { id: investmentId },
    data: {
      status,
    },
  });

  await logAuditEvent({
    actorUserId: userId,
    action: "investment.updated-status",
    entityType: "Investment",
    entityId: investmentId,
    description: `Updated status for investment ${investment.name}.`,
    metadata: {
      previousStatus: investment.status,
      nextStatus: status,
    },
  });

  revalidatePath("/account/dashboard/super-admin/investments");
  revalidatePath(`/account/dashboard/super-admin/investments/${investmentId}`);
}
