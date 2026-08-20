"use server";

import { revalidatePath } from "next/cache";

import type { MigrationStatus } from "@/generated/prisma";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";
import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  getFriendlyServerError,
  type FormActionState,
} from "@/lib/forms/actionState";
import { createNotification } from "@/lib/notifications/createNotification";
import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import {
  getMigrationCompletedMessage,
  getMigrationTimelineTitle,
} from "@/lib/migration/migrationPresentation";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

type UpdateUserMigrationFieldName =
  | "userId"
  | "isLegacyUser"
  | "migrationStatus";

export type UpdateUserMigrationState =
  FormActionState<UpdateUserMigrationFieldName> & {
    userId?: string;
    isLegacyUser?: boolean;
    migrationStatus?: MigrationStatus;
    migratedAt?: string | null;
  };

const LEGACY_STATUSES: MigrationStatus[] = ["MIGRATION_PENDING", "MIGRATED"];

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "true" || value === "on" || value === "1";
}

export async function updateUserMigrationAction(
  _prevState: UpdateUserMigrationState,
  formData: FormData,
): Promise<UpdateUserMigrationState> {
  try {
    const { userId: actorUserId } = await requireDashboardRoleAccess([
      "ADMIN",
      "SUPER_ADMIN",
    ]);

    const userId = String(formData.get("userId") ?? "").trim();

    if (!userId) {
      return createValidationErrorState(
        { userId: ["Choose a user to update."] },
        "Please review the highlighted fields.",
      ) as UpdateUserMigrationState;
    }

    const isLegacyUser = parseBoolean(formData.get("isLegacyUser"));
    const migrationStatusValue = String(
      formData.get("migrationStatus") ?? "",
    ).trim() as MigrationStatus | "";

    if (
      isLegacyUser &&
      !LEGACY_STATUSES.includes(migrationStatusValue as MigrationStatus)
    ) {
      return createValidationErrorState(
        {
          migrationStatus: ["Select a migration status."],
        },
        "Please review the highlighted fields.",
      ) as UpdateUserMigrationState;
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isLegacyUser: true,
        migrationStatus: true,
        migratedAt: true,
      },
    });

    if (!target) {
      return createErrorFormState(
        "User not found.",
      ) as UpdateUserMigrationState;
    }

    const nextMigrationStatus: MigrationStatus = isLegacyUser
      ? (migrationStatusValue as MigrationStatus)
      : "NEW_USER";

    const nextMigratedAt =
      isLegacyUser && nextMigrationStatus === "MIGRATED"
        ? (target.migratedAt ?? new Date())
        : null;

    const hasChanges =
      target.isLegacyUser !== isLegacyUser ||
      target.migrationStatus !== nextMigrationStatus ||
      (target.migratedAt?.toISOString() ?? null) !==
        (nextMigratedAt?.toISOString() ?? null);

    if (!hasChanges) {
      return createSuccessFormState(
        "Migration state already matches this user.",
      ) as UpdateUserMigrationState;
    }

    const site = await getSiteConfigurationCached();
    const siteName = site?.siteName?.trim() || "Company";

    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: target.id },
        data: {
          isLegacyUser,
          migrationStatus: nextMigrationStatus,
          migratedAt: nextMigratedAt,
        },
        select: {
          id: true,
          email: true,
          isLegacyUser: true,
          migrationStatus: true,
          migratedAt: true,
        },
      });

      await logAuditEvent({
        actorUserId,
        action:
          nextMigrationStatus === "MIGRATED"
            ? "USER_MIGRATION_COMPLETED"
            : "USER_MIGRATION_UPDATED",
        entityType: "User",
        entityId: user.id,
        description: isLegacyUser
          ? `Updated legacy migration state for ${user.email}.`
          : `Cleared legacy migration state for ${user.email}.`,
        metadata: {
          userId: user.id,
          email: user.email,
          isLegacyUser: user.isLegacyUser,
          migrationStatus: user.migrationStatus,
          migratedAt: user.migratedAt?.toISOString() ?? null,
        },
        db: tx,
      });

      if (user.isLegacyUser && user.migrationStatus === "MIGRATED") {
        const title = getMigrationTimelineTitle();
        const message = getMigrationCompletedMessage(siteName);

        await createNotification({
          db: tx,
          userId: user.id,
          event: "SYSTEM",
          title,
          message,
          link: "/account/dashboard/profile",
          key: `migration:${user.id}`,
          metadata: {
            kind: "account_migration",
            migrationStatus: user.migrationStatus,
            migratedAt: user.migratedAt?.toISOString() ?? null,
            siteName,
          },
        });

        await createNotification({
          db: tx,
          userId: actorUserId,
          event: "SYSTEM",
          title,
          message: `Legacy account migration completed for ${user.email}.`,
          link: "/account/dashboard/admin/users",
          key: `migration:${user.id}:actor:${actorUserId}`,
          metadata: {
            kind: "account_migration",
            actorUserId,
            migratedUserId: user.id,
            migratedUserEmail: user.email,
            migrationStatus: user.migrationStatus,
            migratedAt: user.migratedAt?.toISOString() ?? null,
            siteName,
          },
        });
      }

      return user;
    });

    revalidatePath("/account/dashboard/admin/users");
    revalidatePath("/account/dashboard/super-admin/users");
    revalidatePath("/account/dashboard/profile");
    revalidatePath("/account/dashboard");

    return {
      ...createSuccessFormState("Migration state updated successfully."),
      userId: updated.id,
      isLegacyUser: updated.isLegacyUser,
      migrationStatus: updated.migrationStatus,
      migratedAt: updated.migratedAt?.toISOString() ?? null,
    } as UpdateUserMigrationState;
  } catch (error) {
    console.error("updateUserMigrationAction error:", error);

    return createErrorFormState(
      getFriendlyServerError(
        error,
        "We could not update this migration state right now.",
      ),
    ) as UpdateUserMigrationState;
  }
}
