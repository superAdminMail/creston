import type { Prisma } from "@/generated/prisma";

import { prisma } from "@/lib/prisma";

type AuditJsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: AuditJsonValue }
  | AuditJsonValue[];

type LogAuditEventInput = {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  description?: string | null;
  metadata?: Prisma.InputJsonObject | AuditJsonValue | null;
};

export async function logAuditEvent({
  actorUserId,
  action,
  entityType,
  entityId,
  description,
  metadata,
}: LogAuditEventInput) {
  await prisma.auditLog.create({
    data: {
      actorUserId: actorUserId ?? null,
      action,
      entityType,
      entityId: entityId ?? null,
      description: description?.trim() || null,
      metadata: metadata ?? undefined,
    },
  });
}
