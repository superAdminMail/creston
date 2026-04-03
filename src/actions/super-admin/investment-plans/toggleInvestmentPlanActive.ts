"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";

export async function toggleInvestmentPlanActive(investmentPlanId: string) {
  const { userId } = await requireSuperAdminAccess();

  const plan = await prisma.investmentPlan.findUnique({
    where: { id: investmentPlanId },
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  });

  if (!plan) {
    throw new Error("Investment plan not found.");
  }

  const nextIsActive = !plan.isActive;

  await prisma.investmentPlan.update({
    where: { id: investmentPlanId },
    data: {
      isActive: nextIsActive,
    },
  });

  await logAuditEvent({
    actorUserId: userId,
    action: "investment-plan.toggled-active",
    entityType: "InvestmentPlan",
    entityId: investmentPlanId,
    description: `${nextIsActive ? "Activated" : "Deactivated"} investment plan ${plan.name}.`,
    metadata: {
      previousIsActive: plan.isActive,
      nextIsActive,
    },
  });

  revalidatePath("/account/dashboard/super-admin/investment-plans");
  revalidatePath(
    `/account/dashboard/super-admin/investment-plans/${investmentPlanId}`,
  );
}
