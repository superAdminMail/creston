"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Filter,
  Search,
  ShieldCheck,
  TrendingUp,
  ShieldAlert,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import type { UserRole } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { suspendUserAction } from "@/actions/super-admin/users/suspendUserAction";
import { formatDirectoryCurrency } from "@/lib/formatters/directory";
import type { DashboardDirectoryUser } from "@/lib/types/dashboard";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
  DASHBOARD_TABLE_SHELL_CLASS,
} from "./dashboardSurfaces";

const heroPillClass =
  "inline-flex items-center rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-700 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300";

const statTitleClass =
  "text-xs font-medium uppercase tracking-[0.22em] text-sky-700/90 dark:text-sky-300/80";

const statusBadgeClass =
  "rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition";

const summaryPillClass =
  "inline-flex items-center rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white";

const initialSuspendUserState = { status: "idle" as const };

type VerificationStatus = DashboardDirectoryUser["verificationStatus"];
type AccountStatus = DashboardDirectoryUser["accountStatus"];

type DashboardUserDirectoryProps = {
  badgeLabel: string;
  title: string;
  description: string;
  cardTitle: string;
  cardDescription: string;
  searchPlaceholder: string;
  users: DashboardDirectoryUser[];
  stats: {
    totalUsers: number;
    verifiedUsers: number;
    activeUsers: number;
    totalManagedFunds: number;
  };
  canSuspendUsers?: boolean;
};

function getRoleBadge(role: UserRole) {
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

function getVerificationBadge(status: VerificationStatus) {
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

function getEmailVerificationBadge(isVerified: boolean) {
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

function getKycBadge(status: DashboardDirectoryUser["kycStatus"]) {
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

function getAccountStatusBadge(status: AccountStatus) {
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

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Card className={DASHBOARD_PAGE_SURFACE_CLASS}>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-sky-700/90 dark:text-sky-300/80">
              {title}
            </p>
            <h3 className="break-words text-2xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-white">
              {value}
            </h3>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              {description}
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 px-3 py-3 text-sky-700 dark:text-sky-200">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardUserDirectory({
  badgeLabel,
  title,
  description,
  cardTitle,
  cardDescription,
  searchPlaceholder,
  users,
  stats,
  canSuspendUsers = false,
}: DashboardUserDirectoryProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] =
    useState<DashboardDirectoryUser | null>(null);
  const [suspendTargetUser, setSuspendTargetUser] =
    useState<DashboardDirectoryUser | null>(null);
  const [isSuspendPending, startSuspendTransition] = useTransition();

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
        user.accountStatus.toLowerCase().includes(value) ||
        user.id.toLowerCase().includes(value)
      );
    });
  }, [query, users]);

  function openUser(user: DashboardDirectoryUser) {
    setSelectedUser(user);
  }

  function openSuspendDialog(user: DashboardDirectoryUser) {
    setSuspendTargetUser(user);
  }

  function handleSuspendUser() {
    if (!suspendTargetUser) return;

    startSuspendTransition(async () => {
      const formData = new FormData();
      formData.set("userId", suspendTargetUser.id);

      const result = await suspendUserAction(initialSuspendUserState, formData);

      if (result.status === "error") {
        toast.error(result.message ?? "Unable to suspend this user.");
        return;
      }

      toast.success(result.message ?? "User suspended successfully.");

      if (selectedUser?.id === suspendTargetUser.id) {
        setSelectedUser({
          ...selectedUser,
          isSuspended: true,
          accountStatus: "SUSPENDED",
        });
      }

      setSuspendTargetUser(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section
          className={DASHBOARD_PAGE_PANEL_CLASS + " overflow-hidden p-6 md:p-8"}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge className={heroPillClass}>{badgeLabel}</Badge>

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">
                  {title}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 md:text-base">
                  {description}
                </p>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
              <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4"}>
                <p className={statTitleClass}>Managed accounts</p>
                <p className="mt-2 break-words text-2xl font-semibold leading-tight text-slate-950 dark:text-white">
                  {stats.totalUsers}
                </p>
              </div>
              <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4"}>
                <p className={statTitleClass}>Managed capital</p>
                <p className="mt-2 break-words text-2xl font-semibold leading-tight text-slate-950 dark:text-white">
                  {formatDirectoryCurrency(stats.totalManagedFunds)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total accounts"
            value={String(stats.totalUsers)}
            description="Accounts included in this directory"
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            title="Verified Accounts"
            value={String(stats.verifiedUsers)}
            description="Profiles with verified identity or account status"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <StatCard
            title="Active Accounts"
            value={String(stats.activeUsers)}
            description="Accounts currently active on the platform"
            icon={<UserCheck className="h-5 w-5" />}
          />
          <StatCard
            title="Invested Capital"
            value={formatDirectoryCurrency(stats.totalManagedFunds)}
            description="Total capital tracked across all listed records"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </section>

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
                    onChange={(event) => setQuery(event.target.value)}
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
            <div className={DASHBOARD_TABLE_SHELL_CLASS + " overflow-hidden"}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left">
                  <thead className="bg-white/80 dark:bg-white/[0.04]">
                    <tr className="border-b border-border/60 dark:border-white/10">
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                        User
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                        Role
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                        Verification
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                        Account
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                        Deposits
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                        Invested
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                        Wallet
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                        Joined
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Open ${user.fullName} record`}
                        onClick={() => openUser(user)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openUser(user);
                          }
                        }}
                        className={`border-b border-white/10 transition hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c9ee0]/40 ${
                          index % 2 === 0
                            ? "bg-white/60 dark:bg-white/[0.02]"
                            : "bg-transparent"
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="font-medium text-slate-950 dark:text-white">
                              {user.fullName}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {user.email}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user.id} | {user.country}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                        <td className="px-4 py-4">
                          {getVerificationBadge(user.verificationStatus)}
                        </td>
                        <td className="px-4 py-4">
                          {getAccountStatusBadge(user.accountStatus)}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                          {formatDirectoryCurrency(user.totalDeposits)}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                          {formatDirectoryCurrency(user.totalInvested)}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                          {formatDirectoryCurrency(user.walletBalance)}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500">
                          {user.joinedAt}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                openUser(user);
                              }}
                              className="inline-flex items-center rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 shadow-sm transition hover:bg-sky-100 hover:text-sky-900 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300 dark:hover:bg-sky-400/10 dark:hover:text-sky-100"
                              aria-label={`Open ${user.fullName} record`}
                            >
                              Record loaded
                              <span aria-hidden="true">-&gt;</span>
                            </button>

                            {canSuspendUsers ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  if (user.isDeleted || user.isSuspended) {
                                    return;
                                  }
                                  openSuspendDialog(user);
                                }}
                                disabled={user.isDeleted || user.isSuspended}
                                className="inline-flex items-center justify-center rounded-full border border-rose-200/70 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-100 hover:text-rose-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300 dark:hover:bg-rose-400/10 dark:hover:text-rose-100"
                                aria-label={
                                  user.isDeleted
                                    ? `${user.fullName} is deleted`
                                    : user.isSuspended
                                      ? `${user.fullName} is already suspended`
                                      : `Suspend ${user.fullName}`
                                }
                              >
                                <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
                                {user.isDeleted
                                  ? "Deleted"
                                  : user.isSuspended
                                    ? "Suspended"
                                    : "Suspend"}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-12 text-center text-sm text-slate-500"
                        >
                          No records matched your search.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(suspendTargetUser)}
        onOpenChange={(open) => {
          if (!open) {
            setSuspendTargetUser(null);
          }
        }}
      >
        <DialogContent className="!rounded-[1.75rem] !border-slate-200 !bg-white !bg-none !p-0 !text-slate-950 !shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:!border-white/10 dark:!bg-zinc-950 dark:!text-white">
          {suspendTargetUser ? (
            <div className="space-y-5 p-5 sm:p-6">
              <DialogHeader className="space-y-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200/70 bg-rose-50 text-rose-700 shadow-sm dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <DialogTitle className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                  Suspend user
                </DialogTitle>
                <DialogDescription className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {suspendTargetUser.fullName} will be suspended immediately and
                  prevented from signing in until support reactivates the
                  account.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 rounded-[1.35rem] border border-slate-200/80 bg-slate-50 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                <div className="flex items-center justify-between gap-4">
                  <span>Email</span>
                  <span className="font-medium text-slate-950 dark:text-white">
                    {suspendTargetUser.email}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Account status</span>
                  <span className="font-medium text-slate-950 dark:text-white">
                    {getAccountStatusBadge(suspendTargetUser.accountStatus)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-4 sm:flex-row sm:justify-end dark:border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSuspendTargetUser(null)}
                  className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
                  disabled={isSuspendPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSuspendUser}
                  disabled={isSuspendPending}
                  className="rounded-full bg-rose-600 text-white hover:bg-rose-700"
                >
                  {isSuspendPending ? "Suspending..." : "Suspend user"}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedUser)}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent className="max-h-[92dvh] w-[min(96vw,46rem)] overflow-hidden rounded-[1.75rem] border border-border/60 bg-white/95 p-0 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-zinc-950/95 dark:text-white dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
          {selectedUser ? (
            <div className="flex max-h-[92dvh] flex-col">
              <DialogHeader className="border-b border-border/60 px-4 py-4 sm:px-6 sm:py-5 dark:border-white/10">
                <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl dark:text-white">
                  {selectedUser.fullName}
                </DialogTitle>
                <DialogDescription className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                  User record loaded from the directory. Review the account
                  profile, balances, and verification state in one place.
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4"}>
                    <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                      Role
                    </p>
                    <div className="mt-3">
                      {getRoleBadge(selectedUser.role)}
                    </div>
                  </div>
                  <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4"}>
                    <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                      Email verification
                    </p>
                    <div className="mt-3">
                      {getEmailVerificationBadge(selectedUser.emailVerified)}
                    </div>
                  </div>
                  <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4"}>
                    <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                      KYC
                    </p>
                    <div className="mt-3">
                      {getKycBadge(selectedUser.kycStatus)}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4"}>
                    <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                      Phone
                    </p>
                    <p className="mt-2 truncate text-sm font-medium text-slate-950 dark:text-white">
                      {selectedUser.phoneNumber?.trim() || "Not set"}
                    </p>
                  </div>
                  <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4"}>
                    <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                      Email
                    </p>
                    <p className="mt-2 truncate text-sm font-medium text-slate-950 dark:text-white">
                      {selectedUser.email}
                    </p>
                  </div>
                  <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4"}>
                    <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                      Account
                    </p>
                    <div className="mt-3">
                      {getAccountStatusBadge(selectedUser.accountStatus)}
                    </div>
                  </div>
                </div>

                <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4"}>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                    Country
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                    {selectedUser.country}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4"}>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                      Deposits
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                      {formatDirectoryCurrency(selectedUser.totalDeposits)}
                    </p>
                  </div>
                  <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4"}>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                      Invested
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                      {formatDirectoryCurrency(selectedUser.totalInvested)}
                    </p>
                  </div>
                  <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4"}>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                      Wallet
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                      {formatDirectoryCurrency(selectedUser.walletBalance)}
                    </p>
                  </div>
                </div>

                <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4"}>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                    Joined
                  </p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                    {selectedUser.joinedAt}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
