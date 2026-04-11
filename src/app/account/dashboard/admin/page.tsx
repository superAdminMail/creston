import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Bell,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
};

function MetricCard({ title, value, description, icon }: MetricCardProps) {
  return (
    <Card className="border-white/10 bg-[#071120] text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/55">
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

type QuickActionProps = {
  title: string;
  description: string;
  href: string;
};

function QuickAction({ title, description, href }: QuickActionProps) {
  return (
    <Link href={href}>
      <Card className="group h-full border-white/10 bg-[#071120] text-white transition hover:border-[#3c9ee0]/40 hover:bg-[#0a1628]">
        <CardContent className="flex h-full items-center justify-between gap-4 p-5">
          <div className="space-y-1">
            <p className="font-medium text-white">{title}</p>
            <p className="text-sm text-white/60">{description}</p>
          </div>

          <div className="rounded-full border border-[#3c9ee0]/25 bg-[#3c9ee0]/10 p-2 text-[#7cc4f3] transition group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold tracking-tight text-white">
        {title}
      </h2>
      {description ? (
        <p className="text-sm text-white/60">{description}</p>
      ) : null}
    </div>
  );
}

export default async function AdminDashboardPage() {
  // Replace with real server-side values later
  const stats = {
    totalUsers: "8,420",
    activeInvestors: "2,184",
    pendingKyc: "34",
    pendingWithdrawals: "12",
    totalDeposits: "$214,500",
    activeInvestments: "640",
    approvalRate: "94.8%",
    monthlyGrowth: "+8.6%",
  };

  const recentActivities = [
    {
      title: "KYC document approved",
      detail: "Investor profile verification was approved successfully",
      time: "14 mins ago",
      status: "success",
    },
    {
      title: "Withdrawal request pending",
      detail: "A withdrawal request is waiting for admin review",
      time: "31 mins ago",
      status: "pending",
    },
    {
      title: "Deposit confirmed",
      detail: "A new user deposit was marked as successful",
      time: "52 mins ago",
      status: "success",
    },
    {
      title: "New investment created",
      detail: "A user subscribed to an active investment plan",
      time: "1 hour ago",
      status: "info",
    },
  ];

  const adminStatus = [
    { label: "KYC Review Queue", value: "Active" },
    { label: "Deposits Monitoring", value: "Online" },
    { label: "Withdrawals Desk", value: "Stable" },
    { label: "Investment Operations", value: "Healthy" },
  ];

  return (
    <div className="min-h-screen bg-[#020817]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(60,158,224,0.18),transparent_28%),linear-gradient(135deg,#071120_0%,#09182b_45%,#0a1220_100%)] p-6 text-white shadow-[0_18px_60px_rgba(0,0,0,0.28)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge className="border border-[#3c9ee0]/25 bg-[#3c9ee0]/10 px-3 py-1 text-[#8acdfa] hover:bg-[#3c9ee0]/10">
                Havenstone Admin
              </Badge>

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Administrative operations dashboard
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/70 md:text-base">
                  Oversee platform activity, review KYC submissions, manage
                  withdrawals, track deposits, and monitor investment
                  operations.
                </p>
              </div>
            </div>

            <div className="grid w-full max-w-xl grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                  Pending KYC
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {stats.pendingKyc}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                  Pending Withdrawals
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {stats.pendingWithdrawals}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Users"
            value={stats.totalUsers}
            description="Registered platform users"
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard
            title="Active Investors"
            value={stats.activeInvestors}
            description="Users with active investment participation"
            icon={<UserCheck className="h-5 w-5" />}
          />
          <MetricCard
            title="Total Deposits"
            value={stats.totalDeposits}
            description="Confirmed deposit volume"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <MetricCard
            title="Monthly Growth"
            value={stats.monthlyGrowth}
            description="Growth compared with prior month"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <section className="space-y-3">
              <SectionHeader
                title="Quick actions"
                description="Access the most important admin workflows."
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <QuickAction
                  title="Review KYC Requests"
                  description="Approve or reject pending identity verification submissions."
                  href="/account/dashboard/admin/kyc-reviews"
                />
                <QuickAction
                  title="Manage Withdrawals"
                  description="Review pending withdrawal requests from investors."
                  href="/account/dashboard/admin/withdrawals"
                />
                <QuickAction
                  title="Monitor Deposits"
                  description="Track user funding activity and payment confirmations."
                  href="/account/dashboard/admin/deposits"
                />
                <QuickAction
                  title="View Investments"
                  description="Monitor active user investments and related activity."
                  href="/account/dashboard/admin/investments"
                />
              </div>
            </section>

            <section>
              <Card className="border-white/10 bg-[#071120] text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Operations overview</CardTitle>
                  <CardDescription className="text-white/60">
                    Key activity areas for the Havenstone admin team.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-[#3c9ee0]/20 bg-[#3c9ee0]/10 p-3 text-[#7cc4f3]">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            KYC Approval Rate
                          </p>
                          <p className="text-sm text-white/60">
                            Efficiency across verification workflows.
                          </p>
                        </div>
                      </div>
                      <p className="mt-5 text-3xl font-semibold">
                        {stats.approvalRate}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-[#3c9ee0]/20 bg-[#3c9ee0]/10 p-3 text-[#7cc4f3]">
                          <Wallet className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            Pending Withdrawals
                          </p>
                          <p className="text-sm text-white/60">
                            Requests currently waiting for review.
                          </p>
                        </div>
                      </div>
                      <p className="mt-5 text-3xl font-semibold">
                        {stats.pendingWithdrawals}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-[#3c9ee0]/20 bg-[#3c9ee0]/10 p-3 text-[#7cc4f3]">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            Deposit Monitoring
                          </p>
                          <p className="text-sm text-white/60">
                            Confirm and review funding activities.
                          </p>
                        </div>
                      </div>
                      <p className="mt-5 text-3xl font-semibold">
                        {stats.totalDeposits}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-[#3c9ee0]/20 bg-[#3c9ee0]/10 p-3 text-[#7cc4f3]">
                          <BriefcaseBusiness className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            Active Investments
                          </p>
                          <p className="text-sm text-white/60">
                            Ongoing user investments under administration.
                          </p>
                        </div>
                      </div>
                      <p className="mt-5 text-3xl font-semibold">
                        {stats.activeInvestments}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <Card className="border-white/10 bg-[#071120] text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Recent activity</CardTitle>
                  <CardDescription className="text-white/60">
                    Latest actions and operational events across the admin area.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-[#3c9ee0]/12 p-2 text-[#7cc4f3]">
                          {activity.status === "success" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : activity.status === "pending" ? (
                            <Clock3 className="h-4 w-4" />
                          ) : (
                            <Bell className="h-4 w-4" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <p className="font-medium text-white">
                            {activity.title}
                          </p>
                          <p className="text-sm text-white/60">
                            {activity.detail}
                          </p>
                        </div>
                      </div>

                      <p className="whitespace-nowrap text-xs text-white/45">
                        {activity.time}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="space-y-6 xl:col-span-4">
            <section>
              <Card className="border-white/10 bg-[#071120] text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Admin status</CardTitle>
                  <CardDescription className="text-white/60">
                    Live visibility into important admin operations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {adminStatus.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                    >
                      <p className="text-sm text-white/75">{item.label}</p>
                      <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">
                        {item.value}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section>
              <Card className="border-white/10 bg-[#071120] text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Admin modules</CardTitle>
                  <CardDescription className="text-white/60">
                    Navigate key admin management pages.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link
                    href="/account/dashboard/admin/users"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:border-[#3c9ee0]/35 hover:bg-white/[0.05]"
                  >
                    <span className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-[#7cc4f3]" />
                      Users
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </Link>

                  <Link
                    href="/account/dashboard/admin/kyc-reviews"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:border-[#3c9ee0]/35 hover:bg-white/[0.05]"
                  >
                    <span className="flex items-center gap-3">
                      <ShieldCheck className="h-4 w-4 text-[#7cc4f3]" />
                      KYC Reviews
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </Link>

                  <Link
                    href="/account/dashboard/admin/deposits"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:border-[#3c9ee0]/35 hover:bg-white/[0.05]"
                  >
                    <span className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-[#7cc4f3]" />
                      Deposits
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </Link>

                  <Link
                    href="/account/dashboard/admin/withdrawals"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:border-[#3c9ee0]/35 hover:bg-white/[0.05]"
                  >
                    <span className="flex items-center gap-3">
                      <Wallet className="h-4 w-4 text-[#7cc4f3]" />
                      Withdrawals
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </Link>
                </CardContent>
              </Card>
            </section>

            <section>
              <Card className="overflow-hidden border border-[#3c9ee0]/20 bg-[linear-gradient(180deg,rgba(60,158,224,0.12),rgba(7,17,32,1))] text-white">
                <CardContent className="space-y-4 p-5">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#9fd7fb]">
                      Admin workflow
                    </p>
                    <h3 className="text-xl font-semibold tracking-tight">
                      Stay ahead of operational tasks
                    </h3>
                    <p className="text-sm leading-6 text-white/70">
                      Keep reviews moving, monitor platform funding activity,
                      and maintain reliable investment operations with a clean
                      admin flow.
                    </p>
                  </div>

                  <Button
                    asChild
                    className="w-full bg-[#3c9ee0] text-white hover:bg-[#3692d0]"
                  >
                    <Link href="/account/dashboard/admin/withdrawals">
                      Open pending tasks
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
