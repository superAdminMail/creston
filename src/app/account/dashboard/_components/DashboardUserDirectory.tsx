"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  BriefcaseBusiness,
  CreditCard,
  Filter,
  Search,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

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
import { formatDirectoryCurrency } from "@/lib/formatters/directory";
import type { DashboardDirectoryUser } from "@/lib/types/dashboard";

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
};

function getRoleBadge(role: UserRole) {
  switch (role) {
    case "SUPER_ADMIN":
      return (
        <Badge className="border border-amber-500/20 bg-amber-500/10 text-amber-200 hover:bg-amber-500/10">
          Super Admin
        </Badge>
      );
    case "ADMIN":
      return (
        <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">
          Admin
        </Badge>
      );
    case "MODERATOR":
      return (
        <Badge className="border border-orange-500/20 bg-orange-500/10 text-orange-300 hover:bg-orange-500/10">
          Moderator
        </Badge>
      );
    default:
      return (
        <Badge className="border border-white/10 bg-white/5 text-white/75 hover:bg-white/5">
          User
        </Badge>
      );
  }
}

function getVerificationBadge(status: VerificationStatus) {
  switch (status) {
    case "VERIFIED":
      return (
        <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">
          Verified
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/10">
          Pending
        </Badge>
      );
    default:
      return (
        <Badge className="border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/10">
          Rejected
        </Badge>
      );
  }
}

function getEmailVerificationBadge(isVerified: boolean) {
  return isVerified ? (
    <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">
      Verified
    </Badge>
  ) : (
    <Badge className="border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/10">
      Not verified
    </Badge>
  );
}

function getKycBadge(status: DashboardDirectoryUser["kycStatus"]) {
  switch (status) {
    case "VERIFIED":
      return (
        <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">
          KYC verified
        </Badge>
      );
    case "PENDING_REVIEW":
      return (
        <Badge className="border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/10">
          KYC pending
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge className="border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/10">
          KYC rejected
        </Badge>
      );
    default:
      return (
        <Badge className="border border-slate-500/20 bg-slate-500/10 text-slate-300 hover:bg-slate-500/10">
          KYC not started
        </Badge>
      );
  }
}

function getAccountStatusBadge(status: AccountStatus) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">
          Active
        </Badge>
      );
    case "REVIEW":
      return (
        <Badge className="border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/10">
          Under Review
        </Badge>
      );
    default:
      return (
        <Badge className="border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/10">
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
    <Card className="border-amber-200/20 bg-[#120f0b] text-stone-50 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-stone-400">
              {title}
            </p>
            <h3 className="break-words text-2xl font-semibold leading-tight tracking-tight">
              {value}
            </h3>
            <p className="text-sm leading-6 text-stone-300">{description}</p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-3 text-amber-300">
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
}: DashboardUserDirectoryProps) {
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] =
    useState<DashboardDirectoryUser | null>(null);

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

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-amber-200/20 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_28%),linear-gradient(135deg,#0e130f_0%,#11140d_45%,#181009_100%)] p-6 text-stone-50 shadow-[0_18px_60px_rgba(0,0,0,0.28)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge className="border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-200 hover:bg-amber-500/10">
                {badgeLabel}
              </Badge>

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  {title}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-stone-300 md:text-base">
                  {description}
                </p>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
              <div className="min-w-0 rounded-2xl border border-amber-200/15 bg-white/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                  Managed Users
                </p>
                <p className="mt-2 break-words text-2xl font-semibold leading-tight">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="min-w-0 rounded-2xl border border-amber-200/15 bg-white/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                  Managed Funds
                </p>
                <p className="mt-2 break-words text-2xl font-semibold leading-tight">
                  {formatDirectoryCurrency(stats.totalManagedFunds)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
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
            description="Total capital invested by listed records"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </section>

        <Card className="border-amber-200/20 bg-[#11130d] text-stone-50">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">{cardTitle}</CardTitle>
                <CardDescription className="text-stone-300">
                  {cardDescription}
                </CardDescription>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-[260px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="border-amber-200/15 bg-white/[0.05] pl-9 text-stone-50 placeholder:text-stone-400 focus-visible:ring-amber-500/40"
                  />
                </div>

                <Button
                  variant="outline"
                  className="border-amber-200/15 bg-white/[0.05] text-stone-50 hover:bg-amber-500/10 hover:text-stone-50"
                  disabled
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="hidden overflow-hidden rounded-2xl border border-amber-200/15 lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                  <thead className="bg-amber-500/5">
                    <tr className="border-b border-amber-200/15">
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                        User
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                        Role
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                        Verification
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                        Account
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                        Deposits
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                        Invested
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                        Wallet
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                        Joined
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openUser(user)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openUser(user);
                          }
                        }}
                        className={`cursor-pointer border-b border-amber-200/15 outline-none transition-colors hover:bg-amber-500/5 focus-visible:bg-amber-500/5 ${
                          index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="font-medium text-stone-50">
                              {user.fullName}
                            </p>
                            <p className="text-sm text-stone-300">
                              {user.email}
                            </p>
                            <p className="text-xs text-stone-500">
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
                        <td className="px-4 py-4 text-sm text-stone-200">
                          {formatDirectoryCurrency(user.totalDeposits)}
                        </td>
                        <td className="px-4 py-4 text-sm text-stone-200">
                          {formatDirectoryCurrency(user.totalInvested)}
                        </td>
                        <td className="px-4 py-4 text-sm text-stone-200">
                          {formatDirectoryCurrency(user.walletBalance)}
                        </td>
                        <td className="px-4 py-4 text-sm text-stone-400">
                          {user.joinedAt}
                        </td>
                      </tr>
                    ))}

                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-12 text-center text-sm text-stone-400"
                        >
                          No records matched your search.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {filteredUsers.length === 0 ? (
                <div className="rounded-2xl border border-amber-200/15 bg-white/[0.03] px-4 py-10 text-center text-sm text-stone-400">
                  No records matched your search.
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <Card
                    key={user.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openUser(user)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openUser(user);
                      }
                    }}
                    className="border-amber-200/15 bg-white/[0.03] text-stone-50"
                  >
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-semibold">{user.fullName}</p>
                          <p className="text-sm text-stone-300">{user.email}</p>
                          <p className="text-xs text-stone-500">
                            {user.id} | {user.country}
                          </p>
                        </div>

                        <div>{getRoleBadge(user.role)}</div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {getVerificationBadge(user.verificationStatus)}
                        {getAccountStatusBadge(user.accountStatus)}
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-amber-200/15 bg-white/[0.04] p-3">
                          <div className="mb-2 flex items-center gap-2 text-stone-400">
                            <CreditCard className="h-4 w-4" />
                            <span className="text-xs uppercase tracking-[0.16em]">
                              Deposits
                            </span>
                          </div>
                          <p className="text-sm font-medium text-stone-50">
                            {formatDirectoryCurrency(user.totalDeposits)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-amber-200/15 bg-white/[0.04] p-3">
                          <div className="mb-2 flex items-center gap-2 text-stone-400">
                            <BriefcaseBusiness className="h-4 w-4" />
                            <span className="text-xs uppercase tracking-[0.16em]">
                              Invested
                            </span>
                          </div>
                          <p className="text-sm font-medium text-stone-50">
                            {formatDirectoryCurrency(user.totalInvested)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-amber-200/15 bg-white/[0.04] p-3">
                          <div className="mb-2 flex items-center gap-2 text-stone-400">
                            <Wallet className="h-4 w-4" />
                            <span className="text-xs uppercase tracking-[0.16em]">
                              Wallet
                            </span>
                          </div>
                          <p className="text-sm font-medium text-stone-50">
                            {formatDirectoryCurrency(user.walletBalance)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-amber-200/15 pt-4">
                        <p className="text-xs text-stone-500">
                          Joined {user.joinedAt}
                        </p>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openUser(user);
                          }}
                          className="inline-flex items-center text-sm font-medium text-amber-300 transition-colors hover:text-amber-200 hover:underline"
                        >
                          Record loaded -&gt;
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(selectedUser)}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent className="max-h-[92dvh] w-[min(96vw,46rem)] overflow-hidden rounded-[1.75rem] border border-amber-200/20 bg-[#0f120d] p-0 text-stone-50 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
          {selectedUser ? (
            <div className="flex max-h-[92dvh] flex-col">
              <DialogHeader className="border-b border-amber-200/15 px-4 py-4 sm:px-6 sm:py-5">
                <DialogTitle className="text-xl font-semibold tracking-tight text-stone-50 sm:text-2xl">
                  {selectedUser.fullName}
                </DialogTitle>
                <DialogDescription className="text-sm leading-6 text-stone-400">
                  User record loaded from the directory. Review the account
                  profile, balances, and verification state in one place.
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-[1.25rem] border border-amber-200/15 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                      Role
                    </p>
                    <div className="mt-3">
                      {getRoleBadge(selectedUser.role)}
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] border border-amber-200/15 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                      Email verification
                    </p>
                    <div className="mt-3">
                      {getEmailVerificationBadge(selectedUser.emailVerified)}
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] border border-amber-200/15 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                      KYC
                    </p>
                    <div className="mt-3">
                      {getKycBadge(selectedUser.kycStatus)}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-amber-200/15 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                      Phone
                    </p>
                    <p className="mt-2 truncate text-sm font-medium text-stone-50">
                      {selectedUser.phoneNumber?.trim() || "Not set"}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-amber-200/15 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                      Email
                    </p>
                    <p className="mt-2 truncate text-sm font-medium text-stone-50">
                      {selectedUser.email}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-amber-200/15 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                      Account
                    </p>
                    <div className="mt-3">
                      {getAccountStatusBadge(selectedUser.accountStatus)}
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-amber-200/15 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                    Country
                  </p>
                  <p className="mt-2 text-sm font-medium text-stone-50">
                    {selectedUser.country}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.25rem] border border-amber-200/15 bg-white/[0.03] p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400">
                      Deposits
                    </p>
                    <p className="mt-2 text-lg font-semibold text-stone-50">
                      {formatDirectoryCurrency(selectedUser.totalDeposits)}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-amber-200/15 bg-white/[0.03] p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400">
                      Invested
                    </p>
                    <p className="mt-2 text-lg font-semibold text-stone-50">
                      {formatDirectoryCurrency(selectedUser.totalInvested)}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-amber-200/15 bg-white/[0.03] p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400">
                      Wallet
                    </p>
                    <p className="mt-2 text-lg font-semibold text-stone-50">
                      {formatDirectoryCurrency(selectedUser.walletBalance)}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-amber-200/15 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                    Joined
                  </p>
                  <p className="mt-2 text-sm text-stone-300">
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
