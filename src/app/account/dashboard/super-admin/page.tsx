import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Bell,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  Landmark,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export default async function SuperAdminDashboardPage() {
  // Replace with real server-side queries later
  const stats = {
    totalUsers: "12,480",
    activeInvestors: "4,132",
    totalDeposits: "$842,500",
    totalInvested: "$610,340",
    pendingWithdrawals: "28",
    approvedKyc: "1,284",
    activePlans: "18",
    monthlyGrowth: "+12.4%",
  };

  const recentActivities = [
    {
      title: "New investment plan created",
      detail: "Premium Real Estate Growth was added by super admin",
      time: "12 mins ago",
      status: "success",
    },
    {
      title: "Withdrawal request awaiting review",
      detail: "A user requested withdrawal of $2,500",
      time: "28 mins ago",
      status: "pending",
    },
    {
      title: "KYC batch approved",
      detail: "16 investor profiles were approved successfully",
      time: "1 hour ago",
      status: "success",
    },
    {
      title: "Payment method updated",
      detail: "Global bank transfer settings were edited",
      time: "2 hours ago",
      status: "info",
    },
  ];

  const systemStatus = [
    { label: "Investment Engine", value: "Operational" },
    { label: "Withdrawal Queue", value: "Stable" },
    { label: "KYC Review Pipeline", value: "Healthy" },
    { label: "Notifications", value: "Online" },
    { label: "Payment Config", value: "Configured" },
  ];

  return (
    <div className="min-h-screen bg-[#020817]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 lg:px-8">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(60,158,224,0.18),transparent_28%),linear-gradient(135deg,#071120_0%,#09182b_45%,#0a1220_100%)] p-6 text-white shadow-[0_18px_60px_rgba(0,0,0,0.28)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge className="border border-[#3c9ee0]/25 bg-[#3c9ee0]/10 px-3 py-1 text-[#8acdfa] hover:bg-[#3c9ee0]/10">
                Havenstone Super Admin
              </Badge>

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Platform control center
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/70 md:text-base">
                  Monitor investments, user growth, operational health, KYC
                  activity, deposits, withdrawals, and platform-wide performance
                  from one place.
                </p>
              </div>
            </div>

            <div className="grid w-full max-w-xl grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                  Total Deposits
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {stats.totalDeposits}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                  Total Invested
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {stats.totalInvested}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Users"
            value={stats.totalUsers}
            description="Registered accounts across the platform"
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard
            title="Active Investors"
            value={stats.activeInvestors}
            description="Users currently holding active investments"
            icon={<UserCheck className="h-5 w-5" />}
          />
          <MetricCard
            title="Pending Withdrawals"
            value={stats.pendingWithdrawals}
            description="Requests waiting for administrative action"
            icon={<Wallet className="h-5 w-5" />}
          />
          <MetricCard
            title="Monthly Growth"
            value={stats.monthlyGrowth}
            description="Net platform growth against previous month"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Left */}
          <div className="space-y-6 xl:col-span-8">
            {/* Quick actions */}
            <section className="space-y-3">
              <SectionHeader
                title="Quick actions"
                description="Jump into the most important platform controls."
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <QuickAction
                  title="Manage Investment Plans"
                  description="Create, update, or disable platform investment offerings."
                  href="/account/dashboard/super-admin/investment-products"
                />
                <QuickAction
                  title="Review Withdrawals"
                  description="Approve or reject pending withdrawal requests."
                  href="/account/dashboard/super-admin/withdrawals"
                />
                <QuickAction
                  title="Moderate KYC Requests"
                  description="Review submitted identity and compliance records."
                  href="/account/dashboard/super-admin/kyc"
                />
                <QuickAction
                  title="Payment Configuration"
                  description="Manage payment channels and payout details."
                  href="/account/dashboard/super-admin/payment-info"
                />
              </div>
            </section>

            {/* Performance overview */}
            <section>
              <Card className="border-white/10 bg-[#071120] text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Platform performance overview
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    A high-level snapshot of Havenstone administrative
                    operations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-[#3c9ee0]/20 bg-[#3c9ee0]/10 p-3 text-[#7cc4f3]">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            Capital Inflow
                          </p>
                          <p className="text-sm text-white/60">
                            Monitor incoming deposits and funding volume.
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
                            Assets Under Management
                          </p>
                          <p className="text-sm text-white/60">
                            Track currently invested capital across plans.
                          </p>
                        </div>
                      </div>
                      <p className="mt-5 text-3xl font-semibold">
                        {stats.totalInvested}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-[#3c9ee0]/20 bg-[#3c9ee0]/10 p-3 text-[#7cc4f3]">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            Approved KYC
                          </p>
                          <p className="text-sm text-white/60">
                            Verified investor accounts approved by the
                            compliance team.
                          </p>
                        </div>
                      </div>
                      <p className="mt-5 text-3xl font-semibold">
                        {stats.approvedKyc}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-[#3c9ee0]/20 bg-[#3c9ee0]/10 p-3 text-[#7cc4f3]">
                          <Landmark className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            Active Plans
                          </p>
                          <p className="text-sm text-white/60">
                            Investment products currently available to users.
                          </p>
                        </div>
                      </div>
                      <p className="mt-5 text-3xl font-semibold">
                        {stats.activePlans}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Recent activity */}
            <section>
              <Card className="border-white/10 bg-[#071120] text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Recent administrative activity
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Important operational updates across the platform.
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

          {/* Right */}
          <div className="space-y-6 xl:col-span-4">
            {/* System status */}
            <section>
              <Card className="border-white/10 bg-[#071120] text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">System status</CardTitle>
                  <CardDescription className="text-white/60">
                    Operational visibility across critical admin modules.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {systemStatus.map((item) => (
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

            {/* Admin modules */}
            <section>
              <Card className="border-white/10 bg-[#071120] text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Administrative modules
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Fast access to core Havenstone management areas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link
                    href="/account/dashboard/super-admin/users"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:border-[#3c9ee0]/35 hover:bg-white/[0.05]"
                  >
                    <span className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-[#7cc4f3]" />
                      User Management
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </Link>

                  <Link
                    href="/account/dashboard/super-admin/deposits"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:border-[#3c9ee0]/35 hover:bg-white/[0.05]"
                  >
                    <span className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-[#7cc4f3]" />
                      Deposits
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </Link>

                  <Link
                    href="/account/dashboard/super-admin/investments"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:border-[#3c9ee0]/35 hover:bg-white/[0.05]"
                  >
                    <span className="flex items-center gap-3">
                      <Banknote className="h-4 w-4 text-[#7cc4f3]" />
                      Investments
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </Link>

                  <Link
                    href="/account/dashboard/super-admin/site-settings"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:border-[#3c9ee0]/35 hover:bg-white/[0.05]"
                  >
                    <span className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-[#7cc4f3]" />
                      Site Configuration
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </Link>
                </CardContent>
              </Card>
            </section>

            {/* CTA */}
            <section>
              <Card className="overflow-hidden border border-[#3c9ee0]/20 bg-[linear-gradient(180deg,rgba(60,158,224,0.12),rgba(7,17,32,1))] text-white">
                <CardContent className="space-y-4 p-5">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#9fd7fb]">
                      Platform readiness
                    </p>
                    <h3 className="text-xl font-semibold tracking-tight">
                      Keep operations efficient and compliant
                    </h3>
                    <p className="text-sm leading-6 text-white/70">
                      Review pending withdrawals, verify KYC records, maintain
                      payment methods, and oversee product performance from a
                      unified control layer.
                    </p>
                  </div>

                  <Button
                    asChild
                    className="w-full bg-[#3c9ee0] text-white hover:bg-[#3692d0]"
                  >
                    <Link href="/account/dashboard/super-admin/kyc">
                      Review pending actions
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
