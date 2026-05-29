"use server";

import { revalidatePath } from "next/cache";

import {
  createErrorFormState,
  createSuccessFormState,
  type FormActionState,
} from "@/lib/forms/actionState";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { prisma } from "@/lib/prisma";
import { scanLegacyBankInfoRequestNotifications } from "@/lib/payments/bank/legacyBankInfoRequestNotifications";

const CONFIRMATION_TEXT = "PURGE_LEGACY_BANK_INFO_REQUESTS";

export type CleanupLegacyBankInfoRequestsState = FormActionState<"confirmation"> & {
  deletedCount: number;
  investmentOrderCount: number;
  savingsAccountCount: number;
  revalidatedPathCount: number;
};

function createIdleState(): CleanupLegacyBankInfoRequestsState {
  return {
    status: "idle",
    deletedCount: 0,
    investmentOrderCount: 0,
    savingsAccountCount: 0,
    revalidatedPathCount: 0,
  };
}

function createErrorState(
  message: string,
  fieldErrors?: CleanupLegacyBankInfoRequestsState["fieldErrors"],
): CleanupLegacyBankInfoRequestsState {
  return {
    ...createIdleState(),
    ...createErrorFormState(message, fieldErrors),
  };
}

function createSuccessState(
  message: string,
  result: Pick<
    CleanupLegacyBankInfoRequestsState,
    "deletedCount" | "investmentOrderCount" | "savingsAccountCount" | "revalidatedPathCount"
  >,
): CleanupLegacyBankInfoRequestsState {
  return {
    ...createIdleState(),
    ...createSuccessFormState(message),
    ...result,
  };
}

export async function cleanupLegacyBankInfoRequests(
  _previousState: CleanupLegacyBankInfoRequestsState,
  formData: FormData,
): Promise<CleanupLegacyBankInfoRequestsState> {
  const { userId } = await requireSuperAdminAccess();

  const confirmation = String(formData.get("confirmation") ?? "").trim();

  if (confirmation !== CONFIRMATION_TEXT) {
    return createErrorState(
      "Type the confirmation text to continue.",
      {
        confirmation: [
          `Confirmation must match ${CONFIRMATION_TEXT}.`,
        ],
      },
    );
  }

  const cleanupResult = await prisma.$transaction(async (tx) => {
    const scan = await scanLegacyBankInfoRequestNotifications(tx);
    const orphanAckIds = scan.orphanAckNotifications.map(
      (notification) => notification.id,
    );

    if (orphanAckIds.length > 0) {
      await tx.notification.deleteMany({
        where: {
          id: {
            in: orphanAckIds,
          },
        },
      });
    }

    await logAuditEvent({
      actorUserId: userId,
      action: "legacy-bank-info-request.cleanup",
      entityType: "Notification",
      description: `Purged ${orphanAckIds.length} orphaned legacy bank info request acknowledgement(s).`,
      metadata: {
        deletedCount: orphanAckIds.length,
        investmentOrderIds: scan.affectedInvestmentOrderIds,
        savingsAccountIds: scan.affectedSavingsAccountIds,
        orphanAckIds,
      },
      db: tx,
    });

    return scan;
  });

  for (const path of cleanupResult.revalidatePaths) {
    revalidatePath(path);
  }

  return createSuccessState(
    cleanupResult.orphanAckNotifications.length > 0
      ? `Purged ${cleanupResult.orphanAckNotifications.length} stale legacy bank request acknowledgement(s).`
      : "No stale legacy bank request acknowledgements were found.",
    {
      deletedCount: cleanupResult.orphanAckNotifications.length,
      investmentOrderCount: cleanupResult.affectedInvestmentOrderIds.length,
      savingsAccountCount: cleanupResult.affectedSavingsAccountIds.length,
      revalidatedPathCount: cleanupResult.revalidatePaths.length,
    },
  );
}

export const cleanupLegacyBankInfoRequestNotifications =
  cleanupLegacyBankInfoRequests;
