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

  const order = await prisma.investmentOrder.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      amount: true,
      amountPaid: true,
      confirmedAt: true,
      investmentPlan: {
        select: {
          durationDays: true,
        },
      },
      investmentAccountId: true,
    },
  });

  if (!order) {
    return { ok: false, message: "Investment order not found." };
  }

  if (order.status === "CONFIRMED") {
    return { ok: false, message: "This order is already confirmed." };
  }

  if (order.status !== "PAID") {
    return {
      ok: false,
      message: "Only fully paid orders can be confirmed.",
    };
  }

  const confirmedAt = new Date();
  const startDate = confirmedAt;
  const maturityDate = addDays(confirmedAt, order.investmentPlan.durationDays);

  await prisma.$transaction(async (tx) => {
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
  });

  revalidatePath("/account/dashboard/admin/investment-payments");
  revalidatePath(
    `/account/dashboard/user/investment-orders/${order.id}/payment`,
  );

  return {
    ok: true,
    message: "Investment order confirmed successfully.",
  };
}
