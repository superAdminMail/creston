"use client";

import { CalendarDays, MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { formatDirectoryCurrency } from "@/lib/formatters/directory";
import type { DashboardDirectoryUser } from "@/lib/types/dashboard";

import { UserDirectoryActions } from "./UserDirectoryActions";
import {
  getAccountStatusBadge,
  getEmailVerificationBadge,
  getKycBadge,
  getMigrationBadge,
  getRoleBadge,
  getVerificationBadge,
} from "./UserDirectoryBadges";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "./dashboardSurfaces";

type UserActionMode = "suspend" | "unsuspend";

type UserDirectoryMobileCardProps = {
  user: DashboardDirectoryUser;
  canSuspendUsers: boolean;
  openUser: (user: DashboardDirectoryUser) => void;
  openUserActionDialog: (
    user: DashboardDirectoryUser,
    mode: UserActionMode,
  ) => void;
  openDeleteUserDialog: (user: DashboardDirectoryUser) => void;
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
      {children}
    </p>
  );
}

function StatusItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-2 rounded-lg border border-slate-200/70 bg-slate-50/70 p-3 dark:border-white/[0.07] dark:bg-white/[0.025]">
      <SectionLabel>{label}</SectionLabel>
      <div className="max-w-full min-w-0">{children}</div>
    </div>
  );
}

function FinancialMetric({ label, amount }: { label: string; amount: string }) {
  return (
    <div className="min-w-0 px-2 py-1 sm:px-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 break-words text-sm font-semibold leading-5 tabular-nums text-slate-950 dark:text-white sm:text-base">
        {amount}
      </p>
    </div>
  );
}

export function UserDirectoryMobileCard({
  user,
  canSuspendUsers,
  openUser,
  openUserActionDialog,
  openDeleteUserDialog,
}: UserDirectoryMobileCardProps) {
  return (
    <article
      className={`${DASHBOARD_PAGE_SURFACE_CLASS} overflow-hidden transition-colors hover:border-slate-300/80 dark:hover:border-white/15`}
    >
      {/* Identity and primary actions */}
      <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky-200/70 bg-sky-50 text-sm font-bold text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300"
          >
            {user.fullName.trim().charAt(0).toUpperCase() || "U"}
          </div>

          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => openUser(user)}
              aria-label={`Open ${user.fullName} record`}
              className="block max-w-full text-left text-sm font-semibold text-slate-950 transition-colors hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 dark:text-white dark:hover:text-sky-300 sm:text-base"
            >
              <span className="break-words">{user.fullName}</span>
            </button>

            <p className="mt-1 break-all text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
              {user.email}
            </p>

            <p className="mt-2 break-all font-mono text-[11px] text-slate-500">
              {user.id}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <UserDirectoryActions
            user={user}
            canSuspendUsers={canSuspendUsers}
            layout="mobile"
            onOpenUser={openUser}
            onOpenUserAction={openUserActionDialog}
            onOpenDeleteUser={openDeleteUserDialog}
          />

          {getRoleBadge(user.role)}
        </div>
      </div>

      {/* Account status overview */}
      <div className="border-t border-slate-200/70 px-4 py-4 dark:border-white/[0.07] sm:px-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <SectionLabel>Account overview</SectionLabel>
          <span className="text-[10px] text-slate-400">
            Status & verification
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <StatusItem label="Account">
            {getAccountStatusBadge(user.accountStatus)}
          </StatusItem>

          <StatusItem label="Verification">
            {getVerificationBadge(user.verificationStatus)}
          </StatusItem>

          <StatusItem label="Email">
            {getEmailVerificationBadge(user.emailVerified)}
          </StatusItem>

          <StatusItem label="KYC">{getKycBadge(user.kycStatus)}</StatusItem>

          <StatusItem label="Migration">
            {getMigrationBadge(user.isLegacyUser, user.migrationStatus)}
          </StatusItem>
        </div>
      </div>

      {/* Financial summary */}
      <div className="border-t border-slate-200/70 px-2 py-4 dark:border-white/[0.07] sm:px-3">
        <div className="mb-3 px-2 sm:px-3">
          <SectionLabel>Financial overview</SectionLabel>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-200/70 dark:divide-white/[0.08]">
          <FinancialMetric
            label="Deposits"
            amount={formatDirectoryCurrency(user.totalDeposits)}
          />

          <FinancialMetric
            label="Invested"
            amount={formatDirectoryCurrency(user.totalInvested)}
          />

          <FinancialMetric
            label="Wallet"
            amount={formatDirectoryCurrency(user.walletBalance)}
          />
        </div>
      </div>

      {/* Secondary account metadata */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-slate-200/70 bg-slate-50/60 px-4 py-3 dark:border-white/[0.07] dark:bg-white/[0.02] sm:px-5">
        <div className="flex min-w-0 items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <MapPin className="size-3.5 shrink-0 text-slate-400" />
          <span className="break-words">
            {user.country || "Country unavailable"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <CalendarDays className="size-3.5 shrink-0 text-slate-400" />
          <span>
            Joined{" "}
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {user.joinedAt}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
