import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCompactUsd } from "@/lib/formatters/formatters";
import type {
  DashboardOverviewActivity,
  DashboardOverviewAlert,
  DashboardOverviewCta,
  DashboardOverviewData,
  DashboardOverviewIconKey,
  DashboardOverviewLinkCard,
  DashboardOverviewMetric,
  DashboardOverviewModuleLink,
  DashboardOverviewSpotlight,
  DashboardOverviewStatusItem,
} from "@/lib/services/dashboard/dashboardOverviewService";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
  DASHBOARD_SECTION_INSET_CLASS,
} from "./dashboardSurfaces";

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
  alertTriangle: AlertTriangle,
};

function MetricCard({
  title,
  value,
  description,
  icon,
}: DashboardOverviewMetric) {
  const Icon = ICON_MAP[icon];

  return (
    <Card className={DASHBOARD_PAGE_SURFACE_CLASS}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-sky-700/90 dark:text-sky-300/80">
              {title}
            </p>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {value}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {description}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 px-3 py-3 text-sky-700 dark:text-sky-200">
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
      <Card className="group h-full border-border/60 bg-white/75 text-slate-950 transition hover:border-sky-400/30 hover:bg-white/90 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.06]">
        <CardContent className="flex h-full items-center justify-between gap-4 p-5">
          <div className="space-y-1">
            <p className="font-medium text-slate-950 dark:text-white">
              {title}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {description}
            </p>
          </div>

          <div className="rounded-full border border-sky-400/20 bg-sky-500/10 p-2 text-sky-700 transition group-hover:translate-x-0.5 dark:text-sky-200">
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
      <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
        {title}
      </h2>
      {description ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
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
    <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-5"}>
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-3 text-sky-700 dark:text-sky-200">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-950 dark:text-white">
            {title}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
      <p className="mt-5 text-3xl font-semibold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function ReviewAlert({ alert }: { alert: DashboardOverviewAlert }) {
  const Icon = ICON_MAP[alert.icon];

  return (
    <Alert
      variant="default"
      className={`relative flex flex-col gap-4 overflow-hidden px-4 py-4 !text-slate-950 shadow-sm sm:flex-row sm:items-start sm:pr-32 dark:!text-white ${
        alert.tone === "critical"
          ? "!border-rose-500/20 !bg-rose-500/10"
          : "!border-border/60 !bg-white/75 dark:!bg-white/[0.04]"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border p-0 ${
          alert.tone === "critical"
            ? "border-rose-500/20 bg-rose-500/10 text-rose-200"
            : "border-sky-400/20 bg-sky-500/10 text-sky-700 dark:text-sky-200"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <AlertTitle className="text-sm font-semibold !text-slate-950 dark:!text-white">
            {alert.title}
          </AlertTitle>
          <Badge
            className={`border ${
              alert.tone === "critical"
                ? "border-rose-500/25 bg-rose-500/10 text-rose-200"
                : "border-amber-500/25 bg-amber-500/10 text-amber-900 dark:text-amber-100"
            }`}
          >
            {alert.countLabel}
          </Badge>
        </div>

        <AlertDescription className="text-sm leading-6 !text-slate-600 dark:!text-slate-300">
          {alert.description}
        </AlertDescription>
      </div>

      <div className="sm:absolute sm:right-4 sm:top-4">
        <Button
          asChild
          size="sm"
          variant="outline"
          className={
            alert.tone === "critical"
              ? "border-rose-500/25 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15"
              : "border-border/60 bg-white text-slate-950 hover:bg-white/90 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
          }
        >
          <Link href={alert.href}>{alert.actionLabel}</Link>
        </Button>
      </div>
    </Alert>
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
    <div
      className={
        DASHBOARD_PAGE_SURFACE_CLASS +
        " flex items-start justify-between gap-4 p-4"
      }
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-sky-500/10 p-2 text-sky-700 dark:text-sky-200">
          <ActivityIcon status={status} />
        </div>

        <div className="space-y-1">
          <p className="font-medium text-slate-950 dark:text-white">{title}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{detail}</p>
        </div>
      </div>

      <p className="whitespace-nowrap text-xs text-slate-500">{time}</p>
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
          className="flex items-center justify-between rounded-2xl border border-border/60 bg-white/75 px-4 py-3 shadow-sm dark:bg-white/[0.04]"
        >
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {item.label}
          </p>
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
      className="flex items-center justify-between rounded-2xl border border-border/60 bg-white/75 px-4 py-3 text-sm text-slate-700 transition hover:border-sky-400/30 hover:bg-white/90 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.06]"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-sky-700 dark:text-sky-200" />
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
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
    <Card className={DASHBOARD_SECTION_INSET_CLASS + " overflow-hidden"}>
      <CardContent className="space-y-4 p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-sky-700 dark:text-sky-300">
            {eyebrow}
          </p>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {title}
          </h3>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>

        <Button
          asChild
          className="w-full bg-sky-700 text-white hover:bg-sky-800"
        >
          <Link href={href}>{label}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function HeroHighlights({ children }: { children: ReactNode }) {
  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:max-w-2xl">
      {children}
    </div>
  );
}

export function DashboardOverviewShell({
  badgeLabel,
  title,
  description,
  alertsTitle,
  alertsDescription,
  alerts,
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
    <div className="space-y-8">
      <section
        className={DASHBOARD_PAGE_PANEL_CLASS + " overflow-hidden p-6 md:p-8"}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge className="border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-sky-700 hover:bg-sky-500/10 dark:text-sky-200">
              {badgeLabel}
            </Badge>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 md:text-base">
                {description}
              </p>
            </div>
          </div>

          <HeroHighlights>
            {heroHighlights.map((highlight) => (
              <div
                key={highlight.label}
                className="min-w-0 rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm dark:bg-white/[0.04] sm:p-5"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-sky-700/90 dark:text-sky-300/80">
                  {highlight.label}
                </p>
                <p className="mt-2 break-words text-xl font-semibold leading-tight text-slate-950 dark:text-white sm:text-2xl">
                  {highlight.kind === "currency"
                    ? formatCompactUsd(highlight.value)
                    : new Intl.NumberFormat("en-US").format(highlight.value)}
                </p>
              </div>
            ))}
          </HeroHighlights>
        </div>
      </section>

      {alerts.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader title={alertsTitle} description={alertsDescription} />
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {alerts.map((alert) => (
              <ReviewAlert key={alert.title} alert={alert} />
            ))}
          </div>
        </section>
      ) : null}

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
              description="Move directly into the highest-impact workflows from this workspace."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {quickActions.map((action) => (
                <QuickAction key={action.href} {...action} />
              ))}
            </div>
          </section>

          <section>
            <Card className={DASHBOARD_PAGE_SURFACE_CLASS}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-950 dark:text-white">
                  {spotlightTitle}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
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
            <Card className={DASHBOARD_PAGE_SURFACE_CLASS}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-950 dark:text-white">
                  {activityTitle}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
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
            <Card className={DASHBOARD_PAGE_SURFACE_CLASS}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-950 dark:text-white">
                  {statusTitle}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  {statusDescription}
                </CardDescription>
              </CardHeader>
              <StatusList items={statusItems} />
            </Card>
          </section>

          <section>
            <Card className={DASHBOARD_PAGE_SURFACE_CLASS}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-950 dark:text-white">
                  {modulesTitle}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
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
  );
}
