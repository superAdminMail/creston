"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma";
import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  getFriendlyServerError,
  type FormActionState,
} from "@/lib/forms/actionState";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";
import { createRealtimeNotification } from "@/lib/notifications/createNotification";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, toDecimal } from "@/lib/services/investment/decimal";
import { adminAccountAdjustmentSchema } from "@/lib/zodValidations/admin-account-adjustment";

type FieldName = "accountType" | "accountId" | "direction" | "amount" | "reason";

export type AdminAccountAdjustmentState = FormActionState<FieldName> & {
  adjustmentId?: string;
};

function formatMovementLabel(direction: "ADD" | "DEDUCT") {
  return direction === "ADD" ? "increased" : "decreased";
}

function buildAdjustmentId(accountId: string) {
  return `adj:${accountId}:${Date.now().toString(36)}`;
}

export async function adjustAccountBalance(
  _previousState: AdminAccountAdjustmentState,
  formData: FormData,
): Promise<AdminAccountAdjustmentState> {
  const admin = await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const parsed = adminAccountAdjustmentSchema.safeParse({
    accountType: formData.get("accountType"),
    accountId: formData.get("accountId"),
    direction: formData.get("direction"),
    amount: formData.get("amount"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return createValidationErrorState(
      parsed.error.flatten().fieldErrors as Record<FieldName, string[]>,
      "Please review the highlighted adjustment fields.",
    );
  }

  try {
    const amount = toDecimal(parsed.data.amount);
    const reason = parsed.data.reason?.trim() || null;

    const result = await prisma.$transaction(
      async (tx) => {
        if (parsed.data.accountType === "INVESTMENT_ACCOUNT") {
          const account = await tx.investmentAccount.findUnique({
            where: { id: parsed.data.accountId },
            select: {
              id: true,
              balance: true,
              currency: true,
              status: true,
              investorProfile: {
                select: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
              investmentPlan: {
                select: {
                  name: true,
                },
              },
            },
          });

          if (!account) {
            throw new Error("Investment account not found.");
          }

          if (account.status === "CLOSED") {
            throw new Error("Closed investment accounts cannot be adjusted.");
          }

          const balanceBefore = toDecimal(account.balance);
          const balanceAfter =
            parsed.data.direction === "ADD"
              ? balanceBefore.add(amount)
              : balanceBefore.sub(amount);
          const adjustmentId = buildAdjustmentId(account.id);

          if (balanceAfter.lessThan(0)) {
            throw new Error("Adjustment would make the balance negative.");
          }

          await tx.investmentAccount.update({
            where: { id: account.id },
            data: {
              balance: balanceAfter,
            },
          });

          await logAuditEvent({
            actorUserId: admin.userId,
            action: "adjustment.created",
            entityType: "InvestmentAccount",
            entityId: account.id,
            description: `Adjusted investment account balance for ${account.investorProfile.user.name?.trim() || account.investorProfile.user.email}.`,
            metadata: {
              accountType: parsed.data.accountType,
              accountId: account.id,
              owner: {
                id: account.investorProfile.user.id,
                name: account.investorProfile.user.name,
                email: account.investorProfile.user.email,
              },
              direction: parsed.data.direction,
              amount: decimalToNumber(amount),
              balanceBefore: decimalToNumber(balanceBefore),
              balanceAfter: decimalToNumber(balanceAfter),
              reason,
              currency: account.currency,
              sourceLabel: account.investmentPlan.name,
            },
            db: tx,
          });

          return {
            adjustmentId,
            account: {
              id: account.id,
              type: parsed.data.accountType,
              currency: account.currency,
              balanceBefore: decimalToNumber(balanceBefore),
              balanceAfter: decimalToNumber(balanceAfter),
              ownerId: account.investorProfile.user.id,
              ownerName: account.investorProfile.user.name?.trim() || null,
              ownerEmail: account.investorProfile.user.email,
              sourceLabel: account.investmentPlan.name,
            },
          };
        }

        const account = await tx.savingsAccount.findUnique({
          where: { id: parsed.data.accountId },
          select: {
            id: true,
            balance: true,
            currency: true,
            status: true,
            investorProfile: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            savingsProduct: {
              select: {
                name: true,
                maxBalance: true,
              },
            },
          },
        });

        if (!account) {
          throw new Error("Savings account not found.");
        }

        if (account.status === "CLOSED") {
          throw new Error("Closed savings accounts cannot be adjusted.");
        }

        const balanceBefore = toDecimal(account.balance);
        const balanceAfter =
          parsed.data.direction === "ADD"
            ? balanceBefore.add(amount)
            : balanceBefore.sub(amount);
        const adjustmentId = buildAdjustmentId(account.id);

        if (balanceAfter.lessThan(0)) {
          throw new Error("Adjustment would make the balance negative.");
        }

        if (
          parsed.data.direction === "ADD" &&
          account.savingsProduct.maxBalance &&
          balanceAfter.greaterThan(account.savingsProduct.maxBalance)
        ) {
          throw new Error("Adjustment would exceed the savings account limit.");
        }

        const savingsTransaction = await tx.savingsTransaction.create({
          data: {
            savingsAccountId: account.id,
            type: "ADJUSTMENT",
            amount,
            currency: account.currency,
            balanceBefore,
            balanceAfter,
            reference: `ADJ-${account.id.slice(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
            note: reason,
            metadata: {
              adjustmentDirection: parsed.data.direction,
              adjustmentReason: reason,
              accountType: parsed.data.accountType,
              accountId: account.id,
              actorUserId: admin.userId,
            },
          },
        });

        await tx.savingsAccount.update({
          where: { id: account.id },
          data: {
            balance: balanceAfter,
          },
        });

        await logAuditEvent({
          actorUserId: admin.userId,
          action: "adjustment.created",
          entityType: "SavingsAccount",
          entityId: account.id,
          description: `Adjusted savings account balance for ${account.investorProfile.user.name?.trim() || account.investorProfile.user.email}.`,
          metadata: {
            accountType: parsed.data.accountType,
            accountId: account.id,
            owner: {
              id: account.investorProfile.user.id,
              name: account.investorProfile.user.name,
              email: account.investorProfile.user.email,
            },
            direction: parsed.data.direction,
            amount: decimalToNumber(amount),
              balanceBefore: decimalToNumber(balanceBefore),
              balanceAfter: decimalToNumber(balanceAfter),
              reason,
              currency: account.currency,
              savingsTransactionId: savingsTransaction.id,
              sourceLabel: account.savingsProduct.name,
          },
          db: tx,
        });

        return {
          adjustmentId,
          account: {
            id: account.id,
            type: parsed.data.accountType,
            currency: account.currency,
            balanceBefore: decimalToNumber(balanceBefore),
            balanceAfter: decimalToNumber(balanceAfter),
            ownerId: account.investorProfile.user.id,
            ownerName: account.investorProfile.user.name?.trim() || null,
            ownerEmail: account.investorProfile.user.email,
            sourceLabel: account.savingsProduct.name,
          },
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    const adjustmentDirection = formatMovementLabel(parsed.data.direction);
    const notificationLink =
      parsed.data.accountType === "INVESTMENT_ACCOUNT"
        ? `/account/dashboard/user/investment-accounts/${result.account.id}`
        : "/account/dashboard/user/savings";

    await createRealtimeNotification({
      userId: result.account.ownerId,
      event: "SYSTEM",
      title: "Balance updated",
      message: `Your ${parsed.data.accountType === "INVESTMENT_ACCOUNT" ? "investment" : "savings"} balance was ${adjustmentDirection} by ${amount.toFixed(2)} ${result.account.currency}.`,
      link: notificationLink,
      metadata: {
        kind: "balance_adjustment",
        adjustmentId: result.adjustmentId,
        accountType: parsed.data.accountType,
        accountId: result.account.id,
        direction: parsed.data.direction,
        amount: decimalToNumber(amount),
        balanceBefore: result.account.balanceBefore,
        balanceAfter: result.account.balanceAfter,
        reason,
        currency: result.account.currency,
        sourceLabel: result.account.sourceLabel,
        actionLabel: "View balance",
      },
    }).catch((error) => {
      console.error("Failed to send balance adjustment notification", error);
    });

    revalidatePath("/account/dashboard/admin/adjustments");
    revalidatePath("/account/dashboard/admin/investment-accounts");
    revalidatePath("/account/dashboard/admin/savings-accounts");
    revalidatePath("/account/dashboard/user/investment-accounts");
    revalidatePath("/account/dashboard/user/savings");
    revalidatePath("/account/dashboard/user/transactions");
    if (result.account.type === "INVESTMENT_ACCOUNT") {
      revalidatePath(
        `/account/dashboard/user/investment-accounts/${result.account.id}`,
      );
    }

    return createSuccessFormState("Balance adjustment saved successfully.");
  } catch (error) {
    console.error("Failed to adjust account balance", {
      error,
      adminUserId: admin.userId,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Unable to update this account balance right now.",
      ),
    );
  }
}
