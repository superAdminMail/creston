"use server";

import { RuntimeStatus, SavingsStatus } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";
import { prisma } from "@/lib/prisma";

const ACTIVE_FUNDING_INTENT_STATUSES = new Set([
  "PENDING",
  "SUBMITTED",
  "PARTIALLY_PAID",
  "PAID",
]);

export type CancelSavingsAccountResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

export async function cancelSavingsAccount(
  savingsAccountId: string,
): Promise<CancelSavingsAccountResult> {
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
      name: true,
      balance: true,
      currency: true,
      status: true,
      isLocked: true,
      savingsFundingIntents: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          status: true,
        },
      },
    },
  });

  if (!account) {
    return { ok: false, message: "Savings account not found." };
  }

  if (account.status !== SavingsStatus.ACTIVE) {
    return { ok: false, message: "This savings account is already closed." };
  }

  if (Number(account.balance) > 0) {
    return {
      ok: false,
      message: "Withdraw the available balance before closing this account.",
    };
  }

  if (account.isLocked) {
    return {
      ok: false,
      message: "Unlock this savings account before closing it.",
    };
  }

  const latestFundingIntentStatus = account.savingsFundingIntents[0]?.status ?? null;

  if (
    latestFundingIntentStatus &&
    ACTIVE_FUNDING_INTENT_STATUSES.has(latestFundingIntentStatus)
  ) {
    return {
      ok: false,
      message:
        "Complete or cancel the active funding request before closing this account.",
    };
  }

  try {
    await prisma.savingsAccount.update({
      where: {
        id: account.id,
      },
      data: {
        status: SavingsStatus.CLOSED,
        runtimeStatus: RuntimeStatus.CLOSED,
        lockedUntil: null,
      },
    });

    await logAuditEvent({
      actorUserId: user.id,
      action: "SAVINGS_ACCOUNT_CANCELLED",
      entityType: "SavingsAccount",
      entityId: account.id,
      description: `Closed savings account ${account.name}.`,
      metadata: {
        savingsAccountId: account.id,
        savingsAccountName: account.name,
        currency: account.currency,
      },
    });
  } catch (error) {
    console.error("[cancelSavingsAccount]", error);

    return {
      ok: false,
      message: "We could not close your savings account right now.",
    };
  }

  revalidatePath("/account/dashboard/user/savings");

  return {
    ok: true,
    message: "Savings account closed successfully.",
  };
}
