"use server";

import { revalidatePath } from "next/cache";

import { UserRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { hasUserBankInfoRequest } from "@/lib/payments/bank/hasUserBankInfoRequest";
import { getUserPrivateBankInfo } from "@/lib/payments/bank/getUserPrivateBankInfo";
import { upsertSystemNotifications } from "@/lib/notifications/upsertSystemNotifications";
import {
  INVESTMENT_ORDER_BANK_INFO_REQUEST_ACK_KIND,
  INVESTMENT_ORDER_BANK_INFO_REQUEST_KIND,
} from "@/lib/notifications/investmentOrderBankInfo";

export async function requestInvestmentOrderBankInfo(orderId: string) {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return { ok: false, message: "Unauthorized." };
  }

  const order = await prisma.investmentOrder.findFirst({
    where: {
      id: orderId,
      investorProfile: {
        userId: user.id,
      },
    },
    select: {
      id: true,
      currency: true,
      platformPaymentMethodId: true,
      investmentPlan: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!order) {
    return { ok: false, message: "Investment order not found." };
  }

  const existingPrivateBankMethod = await getUserPrivateBankInfo(
    user.id,
    order.currency,
  );

  const hasAnyBankInfoRequest = await hasUserBankInfoRequest(user.id);

  if (
    order.platformPaymentMethodId ||
    existingPrivateBankMethod ||
    hasAnyBankInfoRequest
  ) {
    return {
      ok: true,
      message: "Bank details are already available or already requested.",
    };
  }

  const admins = await prisma.user.findMany({
    where: {
      isDeleted: false,
      role: {
        in: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (admins.length === 0) {
    return {
      ok: false,
      message: "No admin accounts are available to receive this request.",
    };
  }

  const requestMessage = `Bank transfer details requested for investment order ${order.id} (${order.investmentPlan.name}) in ${order.currency}.`;

  await prisma.$transaction(async (tx) => {
    await upsertSystemNotifications(tx, [
      {
        key: `investment-order-bank-info-request-ack:${order.id}:${user.id}`,
        userId: user.id,
        title: "Bank info request sent",
        message:
          "We sent your bank info request to the admin team. We'll notify you when the transfer details are ready.",
        link: `/account/dashboard/user/investment-orders/${order.id}/payment`,
        metadata: {
          kind: INVESTMENT_ORDER_BANK_INFO_REQUEST_ACK_KIND,
          orderId: order.id,
          requesterId: user.id,
        },
      },
      ...admins.map((admin) => ({
        key: `investment-order-bank-info-request:${order.id}:${admin.id}`,
        userId: admin.id,
        title: "Investment bank info request",
        message: requestMessage,
        link: "/account/dashboard/admin/investment-payments",
        metadata: {
          kind: INVESTMENT_ORDER_BANK_INFO_REQUEST_KIND,
          orderId: order.id,
          requesterId: user.id,
          requesterName: user.name,
          requesterEmail: user.email,
          investmentPlanName: order.investmentPlan.name,
          currency: order.currency,
        },
      })),
    ]);
  });

  revalidatePath(
    `/account/dashboard/user/investment-orders/${order.id}/payment`,
  );
  revalidatePath("/account/dashboard/notifications");
  revalidatePath("/account/dashboard/admin/investment-payments");

  return {
    ok: true,
    message: "Bank info request sent successfully.",
  };
}
