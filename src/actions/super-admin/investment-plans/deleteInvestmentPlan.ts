"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";

export async function deleteInvestmentPlan(investmentPlanId: string) {
  const { userId } = await requireSuperAdminAccess();

  const plan = await prisma.investmentPlan.findUnique({
    where: { id: investmentPlanId },
    select: {
      id: true,
      name: true,
      investmentAccounts: {
        select: {
          id: true,
        },
        take: 1,
      },
      investmentOrders: {
        select: {
          id: true,
        },
        take: 1,
      },
    },
  });

  if (!plan) {
    redirect("/account/dashboard/super-admin/investment-plans?toast=not-found");
  }

  if (plan.investmentAccounts.length > 0) {
    redirect(
      `/account/dashboard/super-admin/investment-plans/${investmentPlanId}?toast=delete-blocked-accounts`,
    );
  }

  if (plan.investmentOrders.length > 0) {
    redirect(
      `/account/dashboard/super-admin/investment-plans/${investmentPlanId}?toast=delete-blocked-orders`,
    );
  }

  await prisma.investmentPlan.delete({
    where: { id: investmentPlanId },
  });

  await logAuditEvent({
    actorUserId: userId,
    action: "investment-plan.deleted",
    entityType: "InvestmentPlan",
    entityId: investmentPlanId,
    description: `Deleted investment plan ${plan.name}.`,
    metadata: {
      name: plan.name,
    },
  });

  redirect("/account/dashboard/super-admin/investment-plans?toast=deleted");
}
