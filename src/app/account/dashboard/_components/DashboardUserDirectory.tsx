"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
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
        <Badge className="border border-[#3c9ee0]/30 bg-[#3c9ee0]/10 text-[#8ad0fb] hover:bg-[#3c9ee0]/10">
          Super Admin
        </Badge>
      );
    case "ADMIN":
      return (
        <Badge className="border border-violet-500/20 bg-violet-500/10 text-violet-300 hover:bg-violet-500/10">
          Admin
        </Badge>
      );
    case "MODERATOR":
      return (
        <Badge className="border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300 hover:bg-fuchsia-500/10">
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
    <Card className="border-white/10 bg-[#071120] text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">
              {title}
            </p>
            <h3 className="text-2xl font-semibold tracking-tight">{value}</h3>
            <p className="text-sm text-white/60">{description}</p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3c9ee0]/25 bg-[#3c9ee0]/10 text-[#7cc4f3]">
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

  return (
    <div className="min-h-screen bg-[#020817]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(60,158,224,0.18),transparent_28%),linear-gradient(135deg,#071120_0%,#09182b_45%,#0a1220_100%)] p-6 text-white shadow-[0_18px_60px_rgba(0,0,0,0.28)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge className="border border-[#3c9ee0]/25 bg-[#3c9ee0]/10 px-3 py-1 text-[#8acdfa] hover:bg-[#3c9ee0]/10">
                {badgeLabel}
              </Badge>

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  {title}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/70 md:text-base">
                  {description}
                </p>
              </div>
            </div>

            <div className="grid w-full max-w-xl grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                  Managed Users
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                  Managed Funds
                </p>
                <p className="mt-2 text-2xl font-semibold">
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

        <Card className="border-white/10 bg-[#071120] text-white">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">{cardTitle}</CardTitle>
                <CardDescription className="text-white/60">
                  {cardDescription}
                </CardDescription>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-[260px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/35 focus-visible:ring-[#3c9ee0]"
                  />
                </div>

                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  disabled
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="hidden overflow-hidden rounded-2xl border border-white/10 lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                  <thead className="bg-white/[0.04]">
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white/45">
                        User
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white/45">
                        Role
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white/45">
                        Verification
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white/45">
                        Account
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white/45">
                        Deposits
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white/45">
                        Invested
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white/45">
                        Wallet
                      </th>
                      <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white/45">
                        Joined
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`border-b border-white/10 ${
                          index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="font-medium text-white">
                              {user.fullName}
                            </p>
                            <p className="text-sm text-white/55">
                              {user.email}
                            </p>
                            <p className="text-xs text-white/35">
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
                        <td className="px-4 py-4 text-sm text-white/75">
                          {formatDirectoryCurrency(user.totalDeposits)}
                        </td>
                        <td className="px-4 py-4 text-sm text-white/75">
                          {formatDirectoryCurrency(user.totalInvested)}
                        </td>
                        <td className="px-4 py-4 text-sm text-white/75">
                          {formatDirectoryCurrency(user.walletBalance)}
                        </td>
                        <td className="px-4 py-4 text-sm text-white/55">
                          {user.joinedAt}
                        </td>
                      </tr>
                    ))}

                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-12 text-center text-sm text-white/45"
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
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-white/45">
                  No records matched your search.
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <Card
                    key={user.id}
                    className="border-white/10 bg-white/[0.03] text-white"
                  >
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-semibold">{user.fullName}</p>
                          <p className="text-sm text-white/55">{user.email}</p>
                          <p className="text-xs text-white/35">
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
                        <div className="rounded-2xl border border-white/10 bg-[#081322] p-3">
                          <div className="mb-2 flex items-center gap-2 text-white/55">
                            <CreditCard className="h-4 w-4" />
                            <span className="text-xs uppercase tracking-[0.16em]">
                              Deposits
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white">
                            {formatDirectoryCurrency(user.totalDeposits)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#081322] p-3">
                          <div className="mb-2 flex items-center gap-2 text-white/55">
                            <BriefcaseBusiness className="h-4 w-4" />
                            <span className="text-xs uppercase tracking-[0.16em]">
                              Invested
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white">
                            {formatDirectoryCurrency(user.totalInvested)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#081322] p-3">
                          <div className="mb-2 flex items-center gap-2 text-white/55">
                            <Wallet className="h-4 w-4" />
                            <span className="text-xs uppercase tracking-[0.16em]">
                              Wallet
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white">
                            {formatDirectoryCurrency(user.walletBalance)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 pt-4">
                        <p className="text-xs text-white/40">
                          Joined {user.joinedAt}
                        </p>

                        <span className="inline-flex items-center gap-2 text-sm text-[#8acdfa]">
                          Record loaded
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
