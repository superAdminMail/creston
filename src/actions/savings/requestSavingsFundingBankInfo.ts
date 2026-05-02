"use server";

import { revalidatePath } from "next/cache";

import { UserRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { hasUserBankInfoRequest } from "@/lib/payments/bank/hasUserBankInfoRequest";
import { upsertSystemNotifications } from "@/lib/notifications/upsertSystemNotifications";
import {
  SAVINGS_FUNDING_BANK_INFO_REQUEST_ACK_KIND,
  SAVINGS_FUNDING_BANK_INFO_REQUEST_KIND,
} from "@/lib/notifications/savingsFundingBankInfo";
import { getUserPrivateBankInfo } from "@/lib/payments/bank/getUserPrivateBankInfo";

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

  const existingPrivateBankMethod = await getUserPrivateBankInfo(
    user.id,
    account.currency,
  );

  const hasAnyBankInfoRequest = await hasUserBankInfoRequest(user.id);

  if (existingPrivateBankMethod || hasAnyBankInfoRequest) {
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

  const requestMessage = `Bank transfer details requested for savings account ${account.id} (${account.savingsProduct.name}) in ${account.currency}.`;
  const adminRequestUrl = `/account/dashboard/admin/payment-methods?requestKind=SAVINGS_FUNDING_BANK_INFO&savingsAccountId=${encodeURIComponent(account.id)}&requesterId=${encodeURIComponent(user.id)}&requesterName=${encodeURIComponent(user.name ?? "")}&requesterEmail=${encodeURIComponent(user.email ?? "")}&savingsProductName=${encodeURIComponent(account.savingsProduct.name)}&currency=${encodeURIComponent(account.currency)}`;

  await prisma.$transaction(async (tx) => {
    await upsertSystemNotifications(tx, [
      {
        key: `savings-funding-bank-info-request-ack:${account.id}:${user.id}`,
        userId: user.id,
        title: "Bank info request sent",
        message:
          "We sent your savings bank info request to the admin team. We'll notify you when the transfer details are ready.",
        link: `/account/dashboard/checkout?targetType=SAVINGS_FUNDING&targetId=${account.id}&fundingMethodType=BANK_TRANSFER`,
        metadata: {
          kind: SAVINGS_FUNDING_BANK_INFO_REQUEST_ACK_KIND,
          savingsAccountId: account.id,
          requesterId: user.id,
        },
      },
      ...admins.map((admin) => ({
        key: `savings-funding-bank-info-request:${account.id}:${admin.id}`,
        userId: admin.id,
        title: "Savings bank info request",
        message: requestMessage,
        link: adminRequestUrl,
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
      })),
    ]);
  });

  revalidatePath("/account/dashboard/checkout");
  revalidatePath("/account/dashboard/notifications");
  revalidatePath("/account/dashboard/admin/payment-methods");

  return {
    ok: true,
    message: "Bank info request sent successfully.",
  };
}
