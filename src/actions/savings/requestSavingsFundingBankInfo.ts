"use server";

import { revalidatePath } from "next/cache";

import { UserRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import {
  SAVINGS_FUNDING_BANK_INFO_REQUEST_ACK_KIND,
  SAVINGS_FUNDING_BANK_INFO_REQUEST_KIND,
} from "@/lib/notifications/savingsFundingBankInfo";

export async function requestSavingsFundingBankInfo(savingsAccountId: string) {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return { ok: false, message: "Unauthorized." };
  }

  const account = await prisma.savingsAccount.findFirst({
    where: {
      id: savingsAccountId,
      investorProfile: {
        userId: user.id,
      },
    },
    select: {
      id: true,
      currency: true,
      savingsProduct: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!account) {
    return { ok: false, message: "Savings account not found." };
  }

  const existingRequest = await prisma.notification.findFirst({
    where: {
      userId: user.id,
      key: `savings-funding-bank-info-request-ack:${account.id}:${user.id}`,
    },
    select: {
      id: true,
    },
  });

  if (existingRequest) {
    return {
      ok: true,
      message: "Your request has already been sent. Please wait for admin review.",
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

  const requestMessage = `Bank transfer details requested for savings account ${account.id} (${account.savingsProduct.name}) in ${account.currency}.`;
  const adminRequestUrl = `/account/dashboard/admin/payment-methods?requestKind=SAVINGS_FUNDING_BANK_INFO&savingsAccountId=${encodeURIComponent(account.id)}&requesterId=${encodeURIComponent(user.id)}&requesterName=${encodeURIComponent(user.name ?? "")}&requesterEmail=${encodeURIComponent(user.email ?? "")}&savingsProductName=${encodeURIComponent(account.savingsProduct.name)}&currency=${encodeURIComponent(account.currency)}`;

  await prisma.$transaction(async (tx) => {
    await tx.notification.upsert({
      where: {
        key: `savings-funding-bank-info-request-ack:${account.id}:${user.id}`,
      },
      create: {
        userId: user.id,
        title: "Bank info request sent",
        message:
          "We sent your savings bank info request to the admin team. We'll notify you when the transfer details are ready.",
        type: "SYSTEM",
        key: `savings-funding-bank-info-request-ack:${account.id}:${user.id}`,
        link: `/account/dashboard/checkout?targetType=SAVINGS_FUNDING&targetId=${account.id}&fundingMethodType=BANK_TRANSFER`,
        metadata: {
          kind: SAVINGS_FUNDING_BANK_INFO_REQUEST_ACK_KIND,
          savingsAccountId: account.id,
          requesterId: user.id,
        },
      },
      update: {
        title: "Bank info request sent",
        message:
          "We sent your savings bank info request to the admin team. We'll notify you when the transfer details are ready.",
        type: "SYSTEM",
        link: `/account/dashboard/checkout?targetType=SAVINGS_FUNDING&targetId=${account.id}&fundingMethodType=BANK_TRANSFER`,
        metadata: {
          kind: SAVINGS_FUNDING_BANK_INFO_REQUEST_ACK_KIND,
          savingsAccountId: account.id,
          requesterId: user.id,
        },
      },
    });

    for (const admin of admins) {
      await tx.notification.upsert({
        where: {
          key: `savings-funding-bank-info-request:${account.id}:${admin.id}`,
        },
        create: {
          userId: admin.id,
          title: "Savings bank info request",
          message: requestMessage,
          type: "SYSTEM",
          key: `savings-funding-bank-info-request:${account.id}:${admin.id}`,
          link: "/account/dashboard/admin/payment-methods",
        metadata: {
          kind: SAVINGS_FUNDING_BANK_INFO_REQUEST_KIND,
          savingsAccountId: account.id,
          requesterId: user.id,
          requesterName: user.name,
          requesterEmail: user.email,
          savingsProductName: account.savingsProduct.name,
          currency: account.currency,
          requestUrl: adminRequestUrl,
        },
      },
      update: {
          title: "Savings bank info request",
          message: requestMessage,
          type: "SYSTEM",
          link: "/account/dashboard/admin/payment-methods",
        metadata: {
          kind: SAVINGS_FUNDING_BANK_INFO_REQUEST_KIND,
          savingsAccountId: account.id,
          requesterId: user.id,
          requesterName: user.name,
          requesterEmail: user.email,
          savingsProductName: account.savingsProduct.name,
          currency: account.currency,
          requestUrl: adminRequestUrl,
        },
      },
    });
  }
  });

  revalidatePath("/account/dashboard/checkout");
  revalidatePath("/account/dashboard/notifications");
  revalidatePath("/account/dashboard/admin/payment-methods");

  return {
    ok: true,
    message: "Bank info request sent successfully.",
  };
}
