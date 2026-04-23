"use server";

import { Prisma } from "@/generated/prisma";

import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { prisma } from "@/lib/prisma";

export type AuditLogSeverity = "info" | "warning" | "critical" | "success";

export type SuperAdminAuditLogItem = {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  createdAtLabel: string;
  severity: AuditLogSeverity;
  metadataPreview: string[];
};

export type SuperAdminAuditLogsData = {
  checkedAtLabel: string;
  windowLabel: string;
  totalEvents: number;
  auditItems: SuperAdminAuditLogItem[];
};

const AUDIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_AUDIT_ITEMS = 8;

function formatUtcTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(value);
}

function isSameUtcDay(left: Date, right: Date) {
  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  );
}

function formatAuditTimestamp(value: Date, now: Date) {
  const time = formatUtcTime(value);

  if (isSameUtcDay(value, now)) {
    return `Today, ${time} UTC`;
  }

  const date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);

  return `${date}, ${time} UTC`;
}

function clip(value: string, maxLength = 72) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function formatMetadataValue(value: Prisma.JsonValue): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return clip(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }

    return `[${value
      .slice(0, 3)
      .map((entry) => formatMetadataValue(entry))
      .join(", ")}${value.length > 3 ? ", …" : ""}]`;
  }

  if (typeof value === "object") {
    return clip(JSON.stringify(value));
  }

  return String(value);
}

function previewMetadata(metadata: Prisma.JsonValue | null | undefined) {
  if (metadata === null || metadata === undefined) {
    return ["No metadata captured"];
  }

  if (Array.isArray(metadata)) {
    if (metadata.length === 0) {
      return ["No metadata captured"];
    }

    return metadata.slice(0, 3).map((entry, index) => {
      return `item ${index + 1}: ${formatMetadataValue(entry)}`;
    });
  }

  if (typeof metadata === "object") {
    const entries = Object.entries(metadata as Record<string, Prisma.JsonValue>);

    if (entries.length === 0) {
      return ["No metadata captured"];
    }

    return entries.slice(0, 3).map(([key, value]) => `${key}: ${formatMetadataValue(value)}`);
  }

  return [`value: ${formatMetadataValue(metadata)}`];
}

function deriveSeverity({
  action,
  entityType,
  description,
  metadata,
}: {
  action: string;
  entityType: string;
  description: string | null;
  metadata: Prisma.JsonValue | null;
}): AuditLogSeverity {
  const haystack = [
    action,
    entityType,
    description ?? "",
    ...previewMetadata(metadata),
  ]
    .join(" ")
    .toLowerCase();

  if (
    /(\breject|\bsuspend|\berror|\bfail|\bfailure|\bcritical|\bblocked|\bdeny|\bdenied)/.test(
      haystack,
    )
  ) {
    return "critical";
  }

  if (
    /(\bpending|\breview|\bstale|\bwarning|\bmismatch|\boverdue|\bunprocessed|\brequires action|\brequires_action)/.test(
      haystack,
    )
  ) {
    return "warning";
  }

  if (
    /(\bapprove|\bapproved|\bverified|\bsuccess|\bcomplete|\bcompleted|\bcredited|\bsettled|\bprocessed|\bconfirmed|\bcreated|\brun\b|\bexecuted|\bpaid)/.test(
      haystack,
    )
  ) {
    return "success";
  }

  return "info";
}

export async function getSuperAdminAuditLogs(): Promise<SuperAdminAuditLogsData> {
  await requireSuperAdminAccess();

  const now = new Date();
  const windowStart = new Date(now.getTime() - AUDIT_WINDOW_MS);

  const [totalEvents, auditLogs] = await prisma.$transaction([
    prisma.auditLog.count({
      where: {
        createdAt: {
          gte: windowStart,
        },
      },
    }),
    prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: windowStart,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: MAX_AUDIT_ITEMS,
      include: {
        actorUser: {
          select: {
            name: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return {
    checkedAtLabel: formatAuditTimestamp(now, now),
    windowLabel: "Last 24 hours",
    totalEvents,
    auditItems: auditLogs.map((log) => {
      const actorUser = log.actorUser;
      const actor =
        actorUser?.name?.trim() ||
        actorUser?.username?.trim() ||
        actorUser?.email?.trim() ||
        "System";

      return {
        id: log.id,
        actor,
        actorRole: actorUser?.role ?? "SYSTEM",
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId ?? "—",
        description: log.description ?? "No description provided.",
        ipAddress: log.ipAddress ?? "Internal",
        userAgent: log.userAgent ?? "System process",
        createdAtLabel: formatAuditTimestamp(log.createdAt, now),
        severity: deriveSeverity({
          action: log.action,
          entityType: log.entityType,
          description: log.description,
          metadata: log.metadata,
        }),
        metadataPreview: previewMetadata(log.metadata),
      };
    }),
  };
}
