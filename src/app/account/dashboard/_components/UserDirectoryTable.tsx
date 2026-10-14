"use client";

import { formatDirectoryCurrency } from "@/lib/formatters/directory";
import type { DashboardDirectoryUser } from "@/lib/types/dashboard";

import { UserDirectoryActions } from "./UserDirectoryActions";
import {
  getAccountStatusBadge,
  getMigrationBadge,
  getRoleBadge,
  getVerificationBadge,
} from "./UserDirectoryBadges";
import { DASHBOARD_TABLE_SHELL_CLASS } from "./dashboardSurfaces";

type UserActionMode = "suspend" | "unsuspend";

type UserDirectoryTableProps = {
  users: DashboardDirectoryUser[];
  canSuspendUsers: boolean;
  onOpenUser: (user: DashboardDirectoryUser) => void;
  onOpenUserAction: (
    user: DashboardDirectoryUser,
    mode: UserActionMode,
  ) => void;
  onOpenDeleteUser: (user: DashboardDirectoryUser) => void;
};

const headerClass =
  "whitespace-nowrap px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400";

const cellClass = "px-4 py-4 align-middle";

function FinancialCell({ amount }: { amount: number }) {
  return (
    <td
      className={`${cellClass} whitespace-nowrap text-right text-sm font-medium tabular-nums text-slate-800 dark:text-slate-200`}
    >
      {formatDirectoryCurrency(amount)}
    </td>
  );
}

export function UserDirectoryTable({
  users,
  canSuspendUsers,
  onOpenUser,
  onOpenUserAction,
  onOpenDeleteUser,
}: UserDirectoryTableProps) {
  return (
    <div
      className={`${DASHBOARD_TABLE_SHELL_CLASS} hidden overflow-hidden md:block`}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/80 dark:border-white/[0.08] dark:bg-white/[0.035]">
              <th scope="col" className={`${headerClass} text-left`}>
                User
              </th>
              <th scope="col" className={headerClass}>
                Role
              </th>
              <th scope="col" className={headerClass}>
                Verification
              </th>
              <th scope="col" className={headerClass}>
                Account
              </th>
              <th scope="col" className={headerClass}>
                Migration
              </th>
              <th scope="col" className={`${headerClass} text-right`}>
                Deposits
              </th>
              <th scope="col" className={`${headerClass} text-right`}>
                Invested
              </th>
              <th scope="col" className={`${headerClass} text-right`}>
                Wallet
              </th>
              <th scope="col" className={headerClass}>
                Joined
              </th>
              <th scope="col" className={`${headerClass} text-right`}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/70 dark:divide-white/[0.06]">
            {users.map((user) => (
              <tr
                key={user.id}
                className="group transition-colors hover:bg-sky-50/50 dark:hover:bg-sky-400/[0.035]"
              >
                {/* User identity */}
                <td className={`${cellClass} min-w-[240px]`}>
                  <button
                    type="button"
                    onClick={() => onOpenUser(user)}
                    aria-label={`Open ${user.fullName} record`}
                    className="group/user block max-w-[280px] rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60"
                  >
                    <span className="block break-words text-sm font-semibold text-slate-900 transition-colors group-hover/user:text-sky-700 dark:text-slate-100 dark:group-hover/user:text-sky-300">
                      {user.fullName}
                    </span>

                    <span className="mt-1 block break-all text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </span>

                    <span className="mt-1.5 block break-all font-mono text-[10px] text-slate-400 dark:text-slate-500">
                      {user.id}
                    </span>

                    {user.country ? (
                      <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">
                        {user.country}
                      </span>
                    ) : null}
                  </button>
                </td>

                {/* Access role */}
                <td className={cellClass}>{getRoleBadge(user.role)}</td>

                {/* Verification status */}
                <td className={cellClass}>
                  {getVerificationBadge(user.verificationStatus)}
                </td>

                {/* Account status */}
                <td className={cellClass}>
                  {getAccountStatusBadge(user.accountStatus)}
                </td>

                {/* Legacy migration status */}
                <td className={cellClass}>
                  {getMigrationBadge(user.isLegacyUser, user.migrationStatus)}
                </td>

                {/* Financial metrics */}
                <FinancialCell amount={user.totalDeposits} />
                <FinancialCell amount={user.totalInvested} />
                <FinancialCell amount={user.walletBalance} />

                {/* Account metadata */}
                <td className={`${cellClass} whitespace-nowrap`}>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {user.joinedAt}
                  </span>
                </td>

                {/* Row actions */}
                <td className={`${cellClass} text-right`}>
                  <div className="flex justify-end">
                    <UserDirectoryActions
                      user={user}
                      canSuspendUsers={canSuspendUsers}
                      layout="desktop"
                      onOpenUser={onOpenUser}
                      onOpenUserAction={onOpenUserAction}
                      onOpenDeleteUser={onOpenDeleteUser}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {users.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-16 text-center">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    No users found
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try adjusting your search or filters.
                  </p>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
