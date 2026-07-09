"use client";

import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Bell,
  CheckCircle2,
  Clock3,
  CreditCard,
  Database,
  Files,
  HardDrive,
  Mail,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Wallet,
  Waves,
} from "lucide-react";

import type {
  HealthTone,
  SuperAdminSystemHealthData,
  SystemHealthIconKey,
} from "@/actions/super-admin/system-health/getSuperAdminSystemHealth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../../_components/dashboardSurfaces";

import { SystemHealthNotificationCleanup } from "./SystemHealthNotificationCleanup";
import { SystemHealthSubmittedProofCleanup } from "./SystemHealthSubmittedProofCleanup";

const SYSTEM_HEALTH_CARD_CLASS = cn(
  "min-w-0",
  DASHBOARD_PAGE_SURFACE_CLASS,
  "text-slate-950 dark:text-slate-100",
);
const SYSTEM_HEALTH_ICON_BASE =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm";

const ICON_MAP: Record<SystemHealthIconKey, typeof Activity> = {
  activity: Activity,
  database: Database,
  creditCard: CreditCard,
  wallet: Wallet,
  refreshCw: RefreshCw,
  shieldCheck: ShieldCheck,
  bell: Bell,
  hardDrive: HardDrive,
  server: Server,
  mail: Mail,
  files: Files,
  waves: Waves,
  clock3: Clock3,
  checkCircle2: CheckCircle2,
  alertTriangle: AlertTriangle,
  shieldAlert: ShieldAlert,
};

const TONE_ICON_MAP = {
  healthy: CheckCircle2,
  warning: Clock3,
  critical: ShieldAlert,
} as const;

function toneClasses(tone: HealthTone) {
  if (tone === "healthy") {
    return {
      badge: "border-emerald-400/20 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300",
      dot: "bg-emerald-400",
      card: "border-emerald-400/10",
      iconWrap: `${SYSTEM_HEALTH_ICON_BASE} border-emerald-400/20 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300`,
    };
  }

  if (tone === "warning") {
    return {
      badge: "border-amber-400/20 bg-amber-500/10 text-amber-900 dark:text-amber-300",
      dot: "bg-amber-400",
      card: "border-amber-400/10",
      iconWrap: `${SYSTEM_HEALTH_ICON_BASE} border-amber-400/20 bg-amber-500/10 text-amber-900 dark:text-amber-300`,
    };
  }

  return {
    badge: "border-rose-400/20 bg-rose-500/10 text-rose-900 dark:text-rose-300",
    dot: "bg-rose-400",
    card: "border-rose-400/10",
    iconWrap: `${SYSTEM_HEALTH_ICON_BASE} border-rose-400/20 bg-rose-500/10 text-rose-900 dark:text-rose-300`,
  };
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-[10px] uppercase tracking-[0.32em] text-sky-700/90 sm:text-[11px] dark:text-sky-300/80">
        {eyebrow}
      </p>
      <h2 className="text-balance mt-2 text-xl font-semibold tracking-tight text-sky-950 dark:text-sky-100">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function StatusCard({
  label,
  value,
  tone,
  helper,
}: {
  label: string;
  value: string;
  tone: HealthTone;
  helper: string;
}) {
  const styles = toneClasses(tone);
  const Icon = TONE_ICON_MAP[tone];

  return (
    <Card
      className={cn(
        "h-full overflow-hidden",
        SYSTEM_HEALTH_CARD_CLASS,
        styles.card,
      )}
    >
      <CardHeader className="gap-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-[10px] uppercase tracking-[0.22em] text-sky-700/90 sm:text-[11px] dark:text-sky-300/80">
              {label}
            </p>
            <CardTitle className="text-balance break-words text-xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
              {value}
            </CardTitle>
          </div>

          <div className={styles.iconWrap}>
            <Icon className="h-5 w-5 shrink-0" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
        <p className="break-words text-[15px] leading-7 text-slate-400">
          {helper}
        </p>
        <div
          className={`mt-5 inline-flex max-w-full items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
          <span className="truncate">{tone}</span>
        </div>
      </CardContent>
    </Card>
  );
}

type SystemHealthClientProps = {
  health: SuperAdminSystemHealthData;
};

export function SystemHealthClient({ health }: SystemHealthClientProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl p-5 sm:p-6 md:p-8",
        DASHBOARD_PAGE_PANEL_CLASS,
      )}
    >
      <div className="flex flex-col gap-6 border-b border-slate-200/80 pb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8 dark:border-white/10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-950/20 bg-blue-950 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.32em] text-white shadow-sm sm:text-[11px] dark:border-white/10 dark:bg-white/[0.04] dark:text-sky-300">
            <Siren className="h-3.5 w-3.5 shrink-0 text-white dark:text-sky-300" />
            Super admin control
          </div>
          <h1 className="text-balance mt-4 text-3xl font-semibold leading-tight tracking-tight text-sky-950 sm:text-4xl dark:text-sky-100">
            System health
          </h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600 dark:text-slate-400">
            High-level operational visibility across jobs, payments, KYC,
            infrastructure, queues, and data consistency checks. This page is
            designed to help you detect risk quickly and know where intervention
            is required.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 sm:gap-4 lg:max-w-[420px]">
          <Card className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-white/75 shadow-sm dark:bg-white/[0.04]">
            <CardHeader className="flex flex-col items-start gap-4 px-4 py-4 sm:flex-row sm:justify-between sm:px-5 sm:py-5">
              <div className="min-w-0 space-y-1">
                <CardTitle className="text-[10px] uppercase tracking-[0.22em] text-sky-700/90 sm:text-[11px] dark:text-sky-300/80">
                  Last check
                </CardTitle>
                <CardDescription className="break-words text-[15px] font-medium leading-6 text-slate-950 dark:text-white">
                  {health.checkedAtLabel}
                </CardDescription>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-700 shadow-sm">
                <Clock3 className="h-5 w-5" />
              </div>
            </CardHeader>
          </Card>

          <Card
            className={cn(
              "overflow-hidden rounded-[1.5rem] border bg-white/75 shadow-sm dark:bg-white/[0.04]",
              health.overallState.tone === "healthy"
                ? "border-emerald-400/20 text-emerald-900 dark:text-emerald-200"
                : health.overallState.tone === "critical"
                  ? "border-rose-400/20 text-rose-900 dark:text-rose-200"
                  : "border-amber-400/20 text-amber-900 dark:text-amber-200",
            )}
          >
            <CardHeader className="flex flex-col items-start gap-4 px-4 py-4 sm:flex-row sm:justify-between sm:px-5 sm:py-5">
              <div className="min-w-0 space-y-1">
                <CardTitle className="text-[10px] uppercase tracking-[0.22em] text-sky-700/90 opacity-80 sm:text-[11px] dark:text-sky-300/80">
                  Overall state
                </CardTitle>
                <CardDescription className="break-words text-[15px] font-semibold leading-6 text-current">
                  {health.overallState.label}
                </CardDescription>
              </div>

              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
                  health.overallState.tone === "healthy"
                    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                    : health.overallState.tone === "critical"
                      ? "border-rose-400/20 bg-rose-500/10 text-rose-900 dark:text-rose-200"
                      : "border-amber-400/20 bg-amber-500/10 text-amber-900 dark:text-amber-200",
                )}
              >
                {health.overallState.tone === "healthy" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : health.overallState.tone === "critical" ? (
                  <ShieldAlert className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <SectionHeader
          eyebrow="Overview"
          title="Core system health snapshot"
          description="A fast operational summary of the most important platform areas. Healthy means no immediate intervention is needed, warning means attention is recommended, and critical means manual action should happen soon."
        />

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {health.overviewCards.map((card) => {
            const styles = toneClasses(card.tone);
            const Icon = ICON_MAP[card.icon];

            return (
              <Card
                key={card.title}
                className={cn(
                  "h-full overflow-hidden",
                  SYSTEM_HEALTH_CARD_CLASS,
                  styles.card,
                )}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-4 px-5 py-5 sm:px-6 sm:py-6">
                  <div
                    className={cn(styles.iconWrap, "h-11 w-11 sm:h-12 sm:w-12")}
                  >
                    <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                  </div>
                  <div
                    className={`inline-flex max-w-full items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles.badge}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                    />
                    <span className="truncate">{card.value}</span>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                  <p className="text-balance break-words text-[15px] font-medium leading-6 text-slate-950 dark:text-slate-100">
                    {card.title}
                  </p>
                  <p className="mt-2 break-words text-[15px] leading-7 text-slate-400">
                    {card.description}
                  </p>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-sky-700/90 sm:text-[11px] dark:text-sky-300/80">
                    {card.meta}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <div className="min-w-0 rounded-[1.75rem] border border-border/60 bg-white/75 dark:bg-white/[0.04] p-4 shadow-sm sm:p-5 md:p-6 lg:p-7">
          <SectionHeader
            eyebrow="Operations"
            title="Live incidents and warnings"
            description="Recent issues, degraded subsystems, and successful operational milestones."
          />

          <div className="space-y-4">
            {health.incidents.map((item) => {
              const styles = toneClasses(item.severity);
              const Icon =
                item.severity === "healthy"
                  ? CheckCircle2
                  : item.severity === "warning"
                    ? AlertTriangle
                    : ShieldAlert;

              return (
                <Card
                  key={`${item.title}-${item.time}`}
                  className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-white/75 dark:bg-white/[0.04] shadow-sm"
                >
                  <CardHeader className="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div className={styles.iconWrap}>
                        <Icon className="h-4 w-4 shrink-0" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-balance break-words text-[15px] font-semibold leading-6 text-slate-950 dark:text-white">
                            {item.title}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles.badge}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                            />
                            {item.severity}
                          </span>
                        </div>
                        <p className="mt-2 break-words text-[15px] leading-7 text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-left lg:text-right">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 sm:text-[11px]">
                        Owner
                      </p>
                      <p className="mt-1 break-words text-[15px] font-medium leading-6 text-slate-950 dark:text-white">
                        {item.owner}
                      </p>
                      <p className="mt-2 text-[13px] leading-6 text-slate-500">
                        {item.time}
                      </p>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 rounded-[1.75rem] border border-border/60 bg-white/75 dark:bg-white/[0.04] p-4 shadow-sm sm:p-5 md:p-6 lg:p-7">
          <SectionHeader
            eyebrow="Service map"
            title="Subsystem status"
            description="High-level availability of key platform dependencies and internal services."
          />

          <div className="space-y-3">
            {health.services.map((service) => {
              const styles = toneClasses(service.tone);
              const Icon = ICON_MAP[service.icon];

              return (
                <Card
                  key={service.name}
                  className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-white/75 dark:bg-white/[0.04] shadow-sm"
                >
                  <CardHeader className="px-4 py-4 sm:px-5 sm:py-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className={styles.iconWrap}>
                          <Icon className="h-4 w-4 shrink-0" />
                        </div>
                        <div className="min-w-0 max-w-2xl pl-1 sm:pl-2">
                          <p className="text-balance break-words text-[15px] font-medium leading-6 text-slate-950 dark:text-white">
                            {service.name}
                          </p>
                          <p className="mt-1 break-words text-[15px] leading-7 text-slate-400 sm:pr-4">
                            {service.detail}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex self-start items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:self-auto ${styles.badge}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                        />
                        {service.status}
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <div className="min-w-0 rounded-[1.75rem] border border-border/60 bg-white/75 dark:bg-white/[0.04] p-4 shadow-sm sm:p-5 md:p-6 lg:p-7">
          <SectionHeader
            eyebrow="Queues"
            title="Operational backlogs"
            description="Work queues that super admins and operations teams should monitor closely."
          />

          <div className="space-y-3">
            {health.queueMetrics.map((item) => (
              <Card
                key={item.label}
                className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-white/75 dark:bg-white/[0.04] shadow-sm"
              >
                <CardHeader className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5">
                  <div className="min-w-0">
                    <p className="break-words text-[15px] font-medium leading-6 text-slate-950 dark:text-white">
                      {item.label}
                    </p>
                    <p className="mt-1 break-words text-[15px] leading-7 text-slate-400">
                      {item.helper}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-2xl border border-border/60 bg-white/75 dark:bg-white/[0.04] px-4 py-3 text-center shadow-sm sm:min-w-[120px]">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      Count
                    </p>
                    <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                      {item.count}
                    </p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-[1.75rem] border border-border/60 bg-white/75 dark:bg-white/[0.04] p-4 shadow-sm sm:p-5 md:p-6 lg:p-7">
          <SectionHeader
            eyebrow="Integrity"
            title="Data consistency checks"
            description="Cross-record checks that help detect silent failures or broken workflows before users notice."
          />

          <div className="space-y-3">
            {health.integrityChecks.map((item) => {
              const styles = toneClasses(item.tone);

              return (
                <Card
                  key={item.label}
                  className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-white/75 dark:bg-white/[0.04] shadow-sm"
                >
                  <CardHeader className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5 sm:py-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="break-words text-[15px] font-medium leading-6 text-slate-950 dark:text-white">
                          {item.label}
                        </p>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles.badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                          />
                          {item.tone}
                        </span>
                      </div>
                      <p className="mt-2 break-words text-[15px] leading-7 text-slate-400">
                        {item.helper}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-2xl border border-border/60 bg-white/75 dark:bg-white/[0.04] px-4 py-3 text-center shadow-sm sm:min-w-[120px]">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                        Alerts
                      </p>
                      <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                        {item.count}
                      </p>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 rounded-[1.75rem] border border-border/60 bg-white/75 dark:bg-white/[0.04] p-4 shadow-sm sm:p-5 md:p-6 lg:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-300 shadow-sm">
              <RefreshCw className="h-5 w-5 shrink-0" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-sky-700/90 sm:text-[11px] dark:text-sky-300/80">
                Daily jobs
              </p>
              <h3 className="text-balance mt-1 break-words text-lg font-semibold text-slate-950 dark:text-white">
                Cron execution
              </h3>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {health.cronCards.map((card) => {
              const styles = toneClasses(card.tone);
              const Icon = ICON_MAP[card.icon];

              return (
                <Card
                  key={card.label}
                  className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-white/75 dark:bg-white/[0.04] shadow-sm"
                >
                  <CardHeader className="flex flex-col items-start gap-4 px-4 py-4 sm:flex-row sm:px-5 sm:py-5">
                    <div className={styles.iconWrap}>
                      <Icon className="h-4 w-4 shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-sky-700/90 sm:text-[11px] dark:text-sky-300/80">
                        {card.label}
                      </p>
                      <p className="text-balance mt-2 break-words text-[15px] font-medium leading-6 text-slate-950 dark:text-white">
                        {card.status}
                      </p>
                      <p className="mt-2 break-words text-[15px] leading-7 text-slate-400">
                        {card.time}
                      </p>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 rounded-[1.75rem] border border-border/60 bg-white/75 dark:bg-white/[0.04] p-4 shadow-sm sm:p-5 md:p-6 lg:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-300 shadow-sm">
              <ShieldCheck className="h-5 w-5 shrink-0" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-sky-700/90 sm:text-[11px] dark:text-sky-300/80">
                KYC health
              </p>
              <h3 className="text-balance mt-1 break-words text-lg font-semibold text-slate-950 dark:text-white">
                Verification pipeline
              </h3>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <StatusCard
              label="Pending review"
              value={health.kycSignals.pendingReview.toString()}
              tone={health.kycSignals.pendingReview > 0 ? "warning" : "healthy"}
              helper="Verification records currently waiting for compliance review."
            />

            <div className="rounded-2xl border border-amber-400/15 bg-white/75 dark:bg-white/[0.04] p-4 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700/90 sm:text-[11px] dark:text-sky-300/80">
                Stale sessions
              </p>
              <p className="text-balance mt-2 text-2xl font-semibold tracking-tight text-amber-900 dark:text-amber-200 sm:text-3xl">
                {health.kycSignals.staleSessions}
              </p>
              <p className="mt-2 break-words text-[15px] leading-7 text-slate-700 dark:text-amber-50/80">
                Sessions have not synced back recently and may need manual
                reconciliation.
              </p>
            </div>

            <StatusCard
              label="Failed last 24h"
              value={health.kycSignals.failedLast24h.toString()}
              tone={
                health.kycSignals.failedLast24h > 0 ? "critical" : "healthy"
              }
              helper="Verification records that failed during the last day."
            />
          </div>
        </div>

        <div className="min-w-0 rounded-[1.75rem] border border-border/60 bg-white/75 dark:bg-white/[0.04] p-4 shadow-sm sm:p-5 md:p-6 lg:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-300 shadow-sm">
              <BadgeCheck className="h-5 w-5 shrink-0" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700/90 sm:text-[11px] dark:text-sky-300/80">
                Security signals
              </p>
              <h3 className="mt-1 break-words text-lg font-semibold text-slate-950 dark:text-white">
                Auth and audit overview
              </h3>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <StatusCard
              label="Suspended users"
              value={health.securitySignals.suspendedUsers.toString()}
              tone={
                health.securitySignals.suspendedUsers > 0
                  ? "warning"
                  : "healthy"
              }
              helper="Accounts currently suspended in the user directory."
            />

            <StatusCard
              label="Pending email verification"
              value={health.securitySignals.pendingEmailVerification.toString()}
              tone={
                health.securitySignals.pendingEmailVerification > 20
                  ? "warning"
                  : "healthy"
              }
              helper="Users that still need to verify their email address."
            />

            <StatusCard
              label="Recent admin actions"
              value={health.securitySignals.recentAdminAuditActions.toString()}
              tone={
                health.securitySignals.recentAdminAuditActions > 0
                  ? "healthy"
                  : "warning"
              }
              helper="Admin audit log entries recorded in the last 24 hours."
            />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <SystemHealthNotificationCleanup cleanup={health.notificationCleanup} />
      </div>

      <div className="mt-10">
        <SystemHealthSubmittedProofCleanup
          cleanup={health.submittedProofCleanup}
        />
      </div>
    </div>
  );
}

