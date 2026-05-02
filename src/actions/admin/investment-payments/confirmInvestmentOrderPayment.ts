"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export async function confirmInvestmentOrderPayment(orderId: string) {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const confirmedAt = new Date();
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.investmentOrder.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        amountPaid: true,
        investmentPlan: {
          select: {
            durationDays: true,
          },
        },
        investmentAccountId: true,
      },
    });

    if (!order) {
      return { ok: false as const, message: "Investment order not found." };
    }

    if (order.status === "CONFIRMED") {
      return { ok: false as const, message: "This order is already confirmed." };
    }

    if (order.status !== "PAID") {
      return {
        ok: false as const,
        message: "Only fully paid orders can be confirmed.",
      };
    }

    const startDate = confirmedAt;
    const maturityDate = addDays(confirmedAt, order.investmentPlan.durationDays);

    await tx.investmentOrder.update({
      where: { id: order.id },
      data: {
        status: "CONFIRMED",
        runtimeStatus: "ONGOING",
        confirmedAt,
        startDate,
        maturityDate,
      },
    });

    await tx.investmentAccount.update({
      where: { id: order.investmentAccountId },
      data: {
        status: "ACTIVE",
        openedAt: confirmedAt,
        balance: {
          increment: order.amountPaid,
        },
      },
    });

    return { ok: true as const, orderId: order.id };
  });

  if (!result.ok) {
    return result;
  }

  revalidatePath("/account/dashboard/admin/investment-payments");
  revalidatePath(
    `/account/dashboard/user/investment-orders/${result.orderId}/payment`,
  );

  return {
    ok: true,
    message: "Investment order confirmed successfully.",
  };
}
