"use client";

import type { UserRole } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import {
  getLegacyAccountBadgeMeta,
  getMigrationStatusMeta,
} from "@/lib/migration/migrationPresentation";
import type { DashboardDirectoryUser } from "@/lib/types/dashboard";

const statusBadgeClass =
  "rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition";

type VerificationStatus = DashboardDirectoryUser["verificationStatus"];
type AccountStatus = DashboardDirectoryUser["accountStatus"];

export function getRoleBadge(role: UserRole) {
  switch (role) {
    case "SUPER_ADMIN":
      return (
        <Badge
          className={`${statusBadgeClass} border-sky-200/70 bg-sky-50 text-sky-700 hover:bg-sky-50 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300 dark:hover:bg-sky-400/10`}
        >
          Super Admin
        </Badge>
      );

    case "ADMIN":
      return (
        <Badge
          className={`${statusBadgeClass} border-violet-200/70 bg-violet-50 text-violet-700 hover:bg-violet-50 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300 dark:hover:bg-violet-400/10`}
        >
          Admin
        </Badge>
      );

    case "MODERATOR":
      return (
        <Badge
          className={`${statusBadgeClass} border-fuchsia-200/70 bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-50 dark:border-fuchsia-400/20 dark:bg-fuchsia-400/10 dark:text-fuchsia-300 dark:hover:bg-fuchsia-400/10`}
        >
          Moderator
        </Badge>
      );

    default:
      return (
        <Badge
          className={`${statusBadgeClass} border-slate-200/80 bg-white/80 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]`}
        >
          User
        </Badge>
      );
  }
}

export function getVerificationBadge(status: VerificationStatus) {
  switch (status) {
    case "VERIFIED":
      return (
        <Badge
          className={`${statusBadgeClass} border-emerald-200/70 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/10`}
        >
          Verified
        </Badge>
      );

    case "PENDING":
      return (
        <Badge
          className={`${statusBadgeClass} border-amber-200/70 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/10`}
        >
          Pending
        </Badge>
      );

    default:
      return (
        <Badge
          className={`${statusBadgeClass} border-rose-200/70 bg-rose-50 text-rose-700 hover:bg-rose-50 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300 dark:hover:bg-rose-400/10`}
        >
          Rejected
        </Badge>
      );
  }
}

export function getEmailVerificationBadge(isVerified: boolean) {
  return isVerified ? (
    <Badge
      className={`${statusBadgeClass} border-emerald-200/70 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/10`}
    >
      Verified
    </Badge>
  ) : (
    <Badge
      className={`${statusBadgeClass} border-amber-200/70 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/10`}
    >
      Not verified
    </Badge>
  );
}

export function getKycBadge(status: DashboardDirectoryUser["kycStatus"]) {
  switch (status) {
    case "VERIFIED":
      return (
        <Badge
          className={`${statusBadgeClass} border-emerald-200/70 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/10`}
        >
          KYC verified
        </Badge>
      );

    case "PENDING_REVIEW":
      return (
        <Badge
          className={`${statusBadgeClass} border-amber-200/70 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/10`}
        >
          KYC pending
        </Badge>
      );

    case "REJECTED":
      return (
        <Badge
          className={`${statusBadgeClass} border-rose-200/70 bg-rose-50 text-rose-700 hover:bg-rose-50 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300 dark:hover:bg-rose-400/10`}
        >
          KYC rejected
        </Badge>
      );

    default:
      return (
        <Badge
          className={`${statusBadgeClass} border-slate-200/80 bg-white/80 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]`}
        >
          KYC not started
        </Badge>
      );
  }
}

export function getAccountStatusBadge(status: AccountStatus) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge
          className={`${statusBadgeClass} border-emerald-200/70 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/10`}
        >
          Active
        </Badge>
      );

    case "DELETED":
      return (
        <Badge
          className={`${statusBadgeClass} border-rose-200/70 bg-rose-50 text-rose-700 hover:bg-rose-50 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300 dark:hover:bg-rose-400/10`}
        >
          Deleted
        </Badge>
      );

    case "REVIEW":
      return (
        <Badge
          className={`${statusBadgeClass} border-amber-200/70 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/10`}
        >
          Under Review
        </Badge>
      );

    default:
      return (
        <Badge
          className={`${statusBadgeClass} border-rose-200/70 bg-rose-50 text-rose-700 hover:bg-rose-50 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300 dark:hover:bg-rose-400/10`}
        >
          Suspended
        </Badge>
      );
  }
}

export function getMigrationBadge(
  isLegacyUser: boolean,
  migrationStatus: DashboardDirectoryUser["migrationStatus"],
) {
  const legacyBadge = getLegacyAccountBadgeMeta(isLegacyUser);
  const migrationMeta = getMigrationStatusMeta(migrationStatus);

  return (
    <div className="flex flex-wrap gap-2">
      {legacyBadge ? (
        <Badge
          className={`${statusBadgeClass} ${legacyBadge.className} hover:bg-transparent`}
        >
          {legacyBadge.label}
        </Badge>
      ) : (
        <Badge
          className={`${statusBadgeClass} border-slate-200/80 bg-white/80 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300`}
        >
          New User
        </Badge>
      )}

      {legacyBadge && (
        <Badge
          className={`${statusBadgeClass} ${migrationMeta.className} hover:bg-transparent`}
        >
          <span
            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${migrationMeta.dotClassName}`}
          />
          {migrationMeta.label}
        </Badge>
      )}
    </div>
  );
}
