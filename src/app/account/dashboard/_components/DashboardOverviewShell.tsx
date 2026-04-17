import type { ReactNode } from "react";
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  DashboardOverviewActivity,
  DashboardOverviewCta,
  DashboardOverviewData,
  DashboardOverviewIconKey,
  DashboardOverviewLinkCard,
  DashboardOverviewMetric,
  DashboardOverviewModuleLink,
  DashboardOverviewSpotlight,
  DashboardOverviewStatusItem,
} from "@/lib/services/dashboard/dashboardOverviewService";

const ICON_MAP: Record<DashboardOverviewIconKey, typeof Users> = {
  users: Users,
  userCheck: UserCheck,
  wallet: Wallet,
  trendingUp: TrendingUp,
  dollarSign: DollarSign,
  briefcaseBusiness: BriefcaseBusiness,
  shieldCheck: ShieldCheck,
  landmark: Landmark,
  creditCard: CreditCard,
  building2: Building2,
  banknote: Banknote,
};

function MetricCard({
  title,
  value,
  description,
  icon,
}: DashboardOverviewMetric) {
  const Icon = ICON_MAP[icon];

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

          <div className="flex h-11 w-11 px-3 py-3 items-center justify-center rounded-2xl border border-[#3c9ee0]/25 bg-[#3c9ee0]/10 text-[#7cc4f3]">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({ title, description, href }: DashboardOverviewLinkCard) {
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

function SpotlightCard({
  title,
  description,
  value,
  icon,
}: DashboardOverviewSpotlight) {
  const Icon = ICON_MAP[icon];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-[#3c9ee0]/20 bg-[#3c9ee0]/10 p-3 text-[#7cc4f3]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="text-sm text-white/60">{description}</p>
        </div>
      </div>
      <p className="mt-5 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function ActivityIcon({
  status,
}: {
  status: DashboardOverviewActivity["status"];
}) {
  if (status === "success") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (status === "pending") {
    return <Clock3 className="h-4 w-4" />;
  }

  return <Bell className="h-4 w-4" />;
}

function ActivityCard({
  title,
  detail,
  time,
  status,
}: DashboardOverviewActivity) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-[#3c9ee0]/12 p-2 text-[#7cc4f3]">
          <ActivityIcon status={status} />
        </div>

        <div className="space-y-1">
          <p className="font-medium text-white">{title}</p>
          <p className="text-sm text-white/60">{detail}</p>
        </div>
      </div>

      <p className="whitespace-nowrap text-xs text-white/45">{time}</p>
    </div>
  );
}

function getStatusBadgeClass(tone: DashboardOverviewStatusItem["tone"]) {
  if (tone === "success") {
    return "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10";
  }

  if (tone === "warning") {
    return "border border-amber-500/20 bg-amber-500/10 text-amber-200 hover:bg-amber-500/10";
  }

  return "border border-slate-500/20 bg-slate-500/10 text-slate-200 hover:bg-slate-500/10";
}

function StatusList({ items }: { items: DashboardOverviewStatusItem[] }) {
  return (
    <CardContent className="space-y-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
        >
          <p className="text-sm text-white/75">{item.label}</p>
          <Badge className={getStatusBadgeClass(item.tone)}>{item.value}</Badge>
        </div>
      ))}
    </CardContent>
  );
}

function ModuleLink({ label, href, icon }: DashboardOverviewModuleLink) {
  const Icon = ICON_MAP[icon];

  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:border-[#3c9ee0]/35 hover:bg-white/[0.05]"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-[#7cc4f3]" />
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-white/40" />
    </Link>
  );
}

function CtaCard({
  eyebrow,
  title,
  description,
  href,
  label,
}: DashboardOverviewCta) {
  return (
    <Card className="overflow-hidden border border-[#3c9ee0]/20 bg-[linear-gradient(180deg,rgba(60,158,224,0.12),rgba(7,17,32,1))] text-white">
      <CardContent className="space-y-4 p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#9fd7fb]">{eyebrow}</p>
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <p className="text-sm leading-6 text-white/70">{description}</p>
        </div>

        <Button
          asChild
          className="w-full bg-[#3c9ee0] text-white hover:bg-[#3692d0]"
        >
          <Link href={href}>{label}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function HeroHighlights({ children }: { children: ReactNode }) {
  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-3">{children}</div>
  );
}

export function DashboardOverviewShell({
  badgeLabel,
  title,
  description,
  heroHighlights,
  metrics,
  quickActions,
  spotlightTitle,
  spotlightDescription,
  spotlights,
  activityTitle,
  activityDescription,
  activities,
  statusTitle,
  statusDescription,
  statusItems,
  modulesTitle,
  modulesDescription,
  moduleLinks,
  cta,
}: DashboardOverviewData) {
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

            <HeroHighlights>
              {heroHighlights.map((highlight) => (
                <div
                  key={highlight.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                    {highlight.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {highlight.value}
                  </p>
                </div>
              ))}
            </HeroHighlights>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <section className="space-y-3">
              <SectionHeader
                title="Quick actions"
                description="Jump into the highest-impact workflows from this dashboard."
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {quickActions.map((action) => (
                  <QuickAction key={action.href} {...action} />
                ))}
              </div>
            </section>

            <section>
              <Card className="border-white/10 bg-[#071120] text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{spotlightTitle}</CardTitle>
                  <CardDescription className="text-white/60">
                    {spotlightDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {spotlights.map((spotlight) => (
                      <SpotlightCard key={spotlight.title} {...spotlight} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <Card className="border-white/10 bg-[#071120] text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{activityTitle}</CardTitle>
                  <CardDescription className="text-white/60">
                    {activityDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activities.map((activity) => (
                    <ActivityCard
                      key={`${activity.title}-${activity.time}`}
                      {...activity}
                    />
                  ))}
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="space-y-6 xl:col-span-4">
            <section>
              <Card className="border-white/10 bg-[#071120] text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{statusTitle}</CardTitle>
                  <CardDescription className="text-white/60">
                    {statusDescription}
                  </CardDescription>
                </CardHeader>
                <StatusList items={statusItems} />
              </Card>
            </section>

            <section>
              <Card className="border-white/10 bg-[#071120] text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{modulesTitle}</CardTitle>
                  <CardDescription className="text-white/60">
                    {modulesDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {moduleLinks.map((link) => (
                    <ModuleLink key={link.href} {...link} />
                  ))}
                </CardContent>
              </Card>
            </section>

            <section>
              <CtaCard {...cta} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
