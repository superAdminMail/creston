"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { DashboardDirectoryUser } from "@/lib/types/dashboard";

import { DeleteUnverifiedUserDialog } from "./DeleteUnverifiedUserDialog";
import { UserDirectoryAccountActionDialog } from "./UserDirectoryAccountActionDialog";
import { UserDirectoryDetailsDialog } from "./UserDirectoryDetailsDialog";
import {
  getAccountStatusBadge,
  getEmailVerificationBadge,
  getKycBadge,
  getMigrationBadge,
  getRoleBadge,
} from "./UserDirectoryBadges";
import { UserDirectoryHeader } from "./UserDirectoryHeader";
import { UserDirectoryMobileCard } from "./UserDirectoryMobileCard";
import { UserDirectoryTable } from "./UserDirectoryTable";
import { UserMigrationControls } from "./UserMigrationControls";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "./dashboardSurfaces";

const PAGE_SIZE = 10;

const summaryPillClass =
  "inline-flex items-center rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white";

type UserActionMode = "suspend" | "unsuspend";

type UserActionTarget = {
  user: DashboardDirectoryUser;
  mode: UserActionMode;
} | null;

type DashboardUserDirectoryProps = {
  badgeLabel: string;
  title: string;
  description: string;
  cardTitle: string;
  cardDescription: string;
  searchPlaceholder: string;
  siteName?: string;
  users: DashboardDirectoryUser[];
  stats: {
    totalUsers: number;
    verifiedUsers: number;
    activeUsers: number;
    totalManagedFunds: number;
  };
  canSuspendUsers?: boolean;
  showMigrationControls?: boolean;
};

export function DashboardUserDirectory({
  badgeLabel,
  title,
  description,
  cardTitle,
  cardDescription,
  searchPlaceholder,
  siteName,
  users,
  stats,
  canSuspendUsers = false,
  showMigrationControls = false,
}: DashboardUserDirectoryProps) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedUser, setSelectedUser] =
    useState<DashboardDirectoryUser | null>(null);

  const [deleteUserTarget, setDeleteUserTarget] = useState<{
    id: string;
    fullName: string;
    email: string;
  } | null>(null);

  const [userActionTarget, setUserActionTarget] =
    useState<UserActionTarget>(null);

  const filteredUsers = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.fullName.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.country.toLowerCase().includes(value) ||
        user.role.toLowerCase().includes(value) ||
        user.verificationStatus.toLowerCase().includes(value) ||
        user.migrationStatus.toLowerCase().includes(value) ||
        (user.isLegacyUser ? "legacy" : "standard").includes(value) ||
        user.accountStatus.toLowerCase().includes(value) ||
        user.id.toLowerCase().includes(value)
      );
    });
  }, [query, users]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const pageCount = Math.max(1, totalPages);

  
  const safeCurrentPage = Math.min(currentPage, pageCount);

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

    return filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredUsers, safeCurrentPage]);

  const firstVisibleUser =
    filteredUsers.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1;

  const lastVisibleUser = Math.min(
    safeCurrentPage * PAGE_SIZE,
    filteredUsers.length,
  );

  function handleSearchChange(value: string) {
    setQuery(value);
    setCurrentPage(1);
  }

  function openUser(user: DashboardDirectoryUser) {
    setSelectedUser(user);
  }

  function handleMigratedUser(nextUser: DashboardDirectoryUser) {
    setSelectedUser((current) =>
      current?.id === nextUser.id ? nextUser : current,
    );
  }

  function openUserActionDialog(
    user: DashboardDirectoryUser,
    mode: UserActionMode,
  ) {
    setUserActionTarget({ user, mode });
  }

  function openDeleteUserDialog(user: DashboardDirectoryUser) {
    setDeleteUserTarget({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    });
  }

  return (
    <div className="space-y-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <UserDirectoryHeader
          badgeLabel={badgeLabel}
          title={title}
          description={description}
          stats={stats}
        />

        {showMigrationControls ? (
          <UserMigrationControls
            users={users}
            siteName={siteName?.trim() || "Company"}
            onMigrated={handleMigratedUser}
          />
        ) : null}

        <Card className={DASHBOARD_PAGE_SURFACE_CLASS}>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl text-slate-950 dark:text-white">
                  {cardTitle}
                </CardTitle>

                <CardDescription className="text-slate-600 dark:text-slate-400">
                  {cardDescription}
                </CardDescription>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-[260px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

                  <Input
                    value={query}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="super-admin-field pl-9 focus-visible:ring-sky-500"
                  />
                </div>

                <Button variant="outline" className={summaryPillClass} disabled>
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-3 md:hidden">
              {paginatedUsers.map((user) => (
                <UserDirectoryMobileCard
                  key={user.id}
                  user={user}
                  canSuspendUsers={canSuspendUsers}
                  openUser={openUser}
                  openUserActionDialog={openUserActionDialog}
                  openDeleteUserDialog={openDeleteUserDialog}
                />
              ))}

              {filteredUsers.length === 0 ? (
                <div className="rounded-[1.35rem] border border-border/60 bg-white/70 px-4 py-8 text-center text-sm text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                  No records matched your search.
                </div>
              ) : null}
            </div>

            <UserDirectoryTable
              users={paginatedUsers}
              canSuspendUsers={canSuspendUsers}
              onOpenUser={openUser}
              onOpenUserAction={openUserActionDialog}
              onOpenDeleteUser={openDeleteUserDialog}
            />
            <div className="flex flex-col gap-4 border-t border-border/60 pt-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
              <p
                className="text-sm text-slate-500 dark:text-slate-400"
                aria-live="polite"
              >
                Showing{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {firstVisibleUser}–{lastVisibleUser}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {filteredUsers.length}
                </span>{" "}
                users
              </p>

              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent className="gap-2">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      disabled={safeCurrentPage <= 1}
                      aria-label="Go to previous page"
                    />
                  </PaginationItem>

                  <PaginationItem>
                    <span
                      className="whitespace-nowrap px-2 text-sm text-slate-600 dark:text-slate-300"
                      aria-current="page"
                    >
                      Page {safeCurrentPage} of {pageCount}
                    </span>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((page) => Math.min(pageCount, page + 1))
                      }
                      disabled={
                        filteredUsers.length === 0 ||
                        safeCurrentPage >= pageCount
                      }
                      aria-label="Go to next page"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>

      <UserDirectoryAccountActionDialog
        target={userActionTarget}
        selectedUser={selectedUser}
        onOpenChange={(open) => {
          if (!open) setUserActionTarget(null);
        }}
        onUserUpdated={(updatedUser) => {
          setSelectedUser(updatedUser);
        }}
      />

      <UserDirectoryDetailsDialog
        user={selectedUser}
        siteName={siteName}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
        renderRoleBadge={getRoleBadge}
        renderEmailVerificationBadge={getEmailVerificationBadge}
        renderKycBadge={getKycBadge}
        renderMigrationBadge={getMigrationBadge}
        renderAccountStatusBadge={getAccountStatusBadge}
      />

      <DeleteUnverifiedUserDialog
        user={deleteUserTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteUserTarget(null);
        }}
        onDeleted={(deletedUserId) => {
          if (selectedUser?.id === deletedUserId) {
            setSelectedUser(null);
          }
        }}
      />
    </div>
  );
}
