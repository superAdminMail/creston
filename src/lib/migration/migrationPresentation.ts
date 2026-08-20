import type { MigrationStatus } from "@/generated/prisma";

type MigrationStatusMeta = {
  label: string;
  className: string;
  dotClassName: string;
};

function resolveSiteName(siteName?: string | null) {
  return siteName?.trim() || "Company";
}

export function getMigrationStatusMeta(
  status?: MigrationStatus | null,
): MigrationStatusMeta {
  switch (status) {
    case "MIGRATED":
      return {
        label: "Migrated",
        className:
          "border-emerald-200/80 bg-emerald-50 text-emerald-800 shadow-[0_10px_24px_rgba(16,185,129,0.12)] dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100",
        dotClassName: "bg-emerald-500 dark:bg-emerald-300",
      };
    case "MIGRATION_PENDING":
      return {
        label: "Migration pending",
        className:
          "border-amber-200/80 bg-amber-50 text-amber-800 shadow-[0_10px_24px_rgba(245,158,11,0.12)] dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100",
        dotClassName: "bg-amber-500 dark:bg-amber-300",
      };
    default:
      return {
        label: "Migration pending",
        className:
          "border-amber-200/80 bg-amber-50 text-amber-800 shadow-[0_10px_24px_rgba(245,158,11,0.12)] dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100",
        dotClassName: "bg-amber-500 dark:bg-amber-300",
      };
  }
}

export function getLegacyAccountBadgeMeta(isLegacyUser: boolean) {
  if (!isLegacyUser) {
    return null;
  }

  return {
    label: "Legacy account",
    className:
      "border-sky-200/80 bg-[linear-gradient(135deg,rgba(219,234,254,0.95),rgba(236,253,245,0.9))] text-sky-800 shadow-[0_12px_30px_rgba(56,189,248,0.14)] dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100",
  };
}

export function formatMigrationTimelineTimestamp(
  value: Date | string | null | undefined,
) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);

  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${dateLabel} · ${timeLabel}`;
}

export function getMigrationCompletedMessage(siteName?: string | null) {
  return `Your legacy account information was successfully migrated to ${resolveSiteName(siteName)}.`;
}

export function getMigrationTimelineTitle() {
  return "Account Migration Completed";
}
