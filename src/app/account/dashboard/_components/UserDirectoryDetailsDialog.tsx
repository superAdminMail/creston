"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDirectoryCurrency } from "@/lib/formatters/directory";
import { formatMigrationTimelineTimestamp } from "@/lib/migration/migrationPresentation";
import type { DashboardDirectoryUser } from "@/lib/types/dashboard";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "./dashboardSurfaces";

type UserDirectoryDetailsDialogProps = {
  user: DashboardDirectoryUser | null;
  siteName?: string;
  onOpenChange: (open: boolean) => void;
  renderRoleBadge: (role: DashboardDirectoryUser["role"]) => ReactNode;
  renderEmailVerificationBadge: (verified: boolean) => ReactNode;
  renderKycBadge: (status: DashboardDirectoryUser["kycStatus"]) => ReactNode;
  renderMigrationBadge: (
    isLegacyUser: boolean,
    migrationStatus: DashboardDirectoryUser["migrationStatus"],
  ) => ReactNode;
  renderAccountStatusBadge: (
    status: DashboardDirectoryUser["accountStatus"],
  ) => ReactNode;
};

export function UserDirectoryDetailsDialog({
  user,
  siteName,
  onOpenChange,
  renderRoleBadge,
  renderEmailVerificationBadge,
  renderKycBadge,
  renderMigrationBadge,
  renderAccountStatusBadge,
}: UserDirectoryDetailsDialogProps) {
  const companyName = siteName?.trim() || "Company";

  return (
    <Dialog
      open={Boolean(user)}
      onOpenChange={(open) => {
        onOpenChange(open);
      }}
    >
      <DialogContent className="max-h-[92dvh] w-[min(96vw,46rem)] overflow-hidden rounded-[1.75rem] border border-border/60 bg-white/95 p-0 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-zinc-950/95 dark:text-white dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
        {user ? (
          <div className="flex max-h-[92dvh] flex-col">
            <DialogHeader className="border-b border-border/60 px-4 py-4 sm:px-6 sm:py-5 dark:border-white/10">
              <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl dark:text-white">
                {user.fullName}
              </DialogTitle>

              <DialogDescription className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                User record loaded from the directory. Review the account
                profile, balances, and verification state in one place.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-4`}>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                    Role
                  </p>
                  <div className="mt-3">{renderRoleBadge(user.role)}</div>
                </div>

                <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-4`}>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                    Email verification
                  </p>
                  <div className="mt-3">
                    {renderEmailVerificationBadge(user.emailVerified)}
                  </div>
                </div>

                <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-4`}>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                    KYC
                  </p>
                  <div className="mt-3">{renderKycBadge(user.kycStatus)}</div>
                </div>

                <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-4`}>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                    Migration status
                  </p>
                  <div className="mt-3">
                    {renderMigrationBadge(
                      user.isLegacyUser,
                      user.migrationStatus,
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-4`}>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                    Phone
                  </p>
                  <p className="mt-2 truncate text-sm font-medium text-slate-950 dark:text-white">
                    {user.phoneNumber?.trim() || "Not set"}
                  </p>
                </div>

                <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-4`}>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                    Email
                  </p>
                  <p className="mt-2 truncate text-sm font-medium text-slate-950 dark:text-white">
                    {user.email}
                  </p>
                </div>

                <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-4`}>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                    Account
                  </p>
                  <div className="mt-3">
                    {renderAccountStatusBadge(user.accountStatus)}
                  </div>
                </div>
              </div>

              <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-4`}>
                <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                  Country
                </p>
                <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                  {user.country}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-4`}>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                    Deposits
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    {formatDirectoryCurrency(user.totalDeposits)}
                  </p>
                </div>

                <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-4`}>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                    Invested
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    {formatDirectoryCurrency(user.totalInvested)}
                  </p>
                </div>

                <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-4`}>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                    Wallet
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    {formatDirectoryCurrency(user.walletBalance)}
                  </p>
                </div>
              </div>

              <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-4`}>
                <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                  Joined
                </p>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  {user.joinedAt}
                </p>
              </div>

              {user.isLegacyUser ? (
                user.migratedAt ? (
                  <div className="rounded-[1.35rem] border border-sky-200/70 bg-[linear-gradient(135deg,rgba(239,246,255,0.95),rgba(236,253,245,0.92))] p-4 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-800 dark:text-sky-200">
                      Account Migration Completed
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                      {formatMigrationTimelineTimestamp(user.migratedAt)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                      Your legacy account information was successfully migrated
                      to {companyName}.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-[1.35rem] border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      Migration timeline
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                      Migration pending
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Migration has not been completed yet.
                    </p>
                  </div>
                )
              ) : null}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
