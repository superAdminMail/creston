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

function toneClasses(tone: HealthTone) {
  if (tone === "healthy") {
    return {
      badge: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
      dot: "bg-emerald-400",
      card: "border-emerald-400/10",
      iconWrap: "bg-emerald-500/10 text-emerald-300",
    };
  }

  if (tone === "warning") {
    return {
      badge: "border-amber-400/20 bg-amber-500/10 text-amber-300",
      dot: "bg-amber-400",
      card: "border-amber-400/10",
      iconWrap: "bg-amber-500/10 text-amber-300",
    };
  }

  return {
    badge: "border-rose-400/20 bg-rose-500/10 text-rose-300",
    dot: "bg-rose-400",
    card: "border-rose-400/10",
    iconWrap: "bg-rose-500/10 text-rose-300",
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
      <p className="text-[11px] uppercase tracking-[0.28em] text-sky-300/80">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
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

  return (
    <Card className="h-full rounded-[1.75rem] border-white/10 bg-[#071120] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <CardHeader className="gap-2 px-5 pb-0 pt-5 sm:px-6">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>
        <CardTitle className="text-2xl font-semibold text-white">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
        <p className="text-sm leading-6 text-slate-400">{helper}</p>
        <div
          className={`mt-5 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
          {tone}
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
    <div className="min-h-screen bg-[#020817] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-[#071120] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:p-5 md:p-8">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-sky-200">
                <Siren className="h-3.5 w-3.5 shrink-0" />
                Super admin control
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                System health
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                High-level operational visibility across jobs, payments, KYC,
                infrastructure, queues, and data consistency checks. This page
                is designed to help you detect risk quickly and know where
                intervention is required.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:min-w-[340px] lg:max-w-[420px]">
              <Card className="border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur">
                <CardHeader className="gap-2 px-4 py-3 sm:px-5 sm:py-4">
                  <CardTitle className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Last platform check
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-white">
                    {health.checkedAtLabel}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card
                className={`border shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur ${
                  health.overallState.tone === "healthy"
                    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                    : health.overallState.tone === "critical"
                      ? "border-rose-400/20 bg-rose-500/10 text-rose-200"
                      : "border-amber-400/20 bg-amber-500/10 text-amber-200"
                }`}
              >
                <CardHeader className="gap-2 px-4 py-3 sm:px-5 sm:py-4">
                  <CardTitle className="text-xs uppercase tracking-[0.18em] opacity-80">
                    Overall state
                  </CardTitle>
                  <CardDescription className="text-sm font-semibold text-current">
                    {health.overallState.label}
                  </CardDescription>
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

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {health.overviewCards.map((card) => {
                const styles = toneClasses(card.tone);
                const Icon = ICON_MAP[card.icon];

                return (
                  <Card
                    key={card.title}
                    className={`h-full rounded-[1.5rem] border bg-[#071120] shadow-[0_10px_30px_rgba(0,0,0,0.18)] ${styles.card}`}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 py-4 sm:px-5">
                      <div
                        className={`shrink-0 rounded-2xl p-3 ${styles.iconWrap}`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
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
                    <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
                      <p className="text-sm font-medium text-slate-200">
                        {card.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {card.description}
                      </p>
                      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {card.meta}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-[1.75rem] border border-white/10 bg-[#071120] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:p-5 md:p-6">
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
                      className="rounded-2xl border border-white/10 bg-[#071120] shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                    >
                      <CardHeader className="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <div
                            className={`mt-0.5 shrink-0 rounded-xl p-2.5 ${styles.iconWrap}`}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-white">
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
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-left lg:text-right">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            Owner
                          </p>
                          <p className="mt-1 text-sm text-white">
                            {item.owner}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            {item.time}
                          </p>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-[#071120] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:p-5 md:p-6">
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
                      className="rounded-2xl border border-white/10 bg-[#071120] shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                    >
                      <CardHeader className="px-4 py-4 sm:px-5 sm:py-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 gap-3">
                            <div
                              className={`shrink-0 rounded-xl p-2.5 ${styles.iconWrap}`}
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                            </div>
                            <div className="min-w-0 max-w-2xl pl-1 sm:pl-2">
                              <p className="text-sm font-medium text-white">
                                {service.name}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-slate-400 sm:pr-4">
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
            <div className="rounded-[1.75rem] border border-white/10 bg-[#071120] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:p-5 md:p-6">
              <SectionHeader
                eyebrow="Queues"
                title="Operational backlogs"
                description="Work queues that super admins and operations teams should monitor closely."
              />

              <div className="space-y-3">
                {health.queueMetrics.map((item) => (
                  <Card
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-[#071120] shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                  >
                    <CardHeader className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {item.helper}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                          Count
                        </p>
                        <p className="mt-1 text-xl font-semibold text-white">
                          {item.count}
                        </p>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-[#071120] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:p-5 md:p-6">
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
                      className="rounded-2xl border border-white/10 bg-[#071120] shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                    >
                      <CardHeader className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5 sm:py-5">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-white">
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
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {item.helper}
                          </p>
                        </div>

                        <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                            Alerts
                          </p>
                          <p className="mt-1 text-xl font-semibold text-white">
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
            <div className="rounded-[1.75rem] border border-white/10 bg-[#071120] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:p-5 md:p-6">
              <div className="flex items-center gap-3">
                <div className="shrink-0 rounded-2xl bg-sky-500/10 p-3 text-sky-300">
                  <RefreshCw className="h-5 w-5 shrink-0" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Daily jobs
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
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
                      className="rounded-2xl border border-white/10 bg-[#071120] shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                    >
                      <CardHeader className="flex items-start gap-3 px-4 py-4 sm:px-5 sm:py-5">
                        <div
                          className={`shrink-0 rounded-xl p-2.5 ${styles.iconWrap}`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            {card.label}
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">
                            {card.status}
                          </p>
                          <p className="mt-2 text-sm text-slate-400">
                            {card.time}
                          </p>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-[#071120] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:p-5 md:p-6">
              <div className="flex items-center gap-3">
                <div className="shrink-0 rounded-2xl bg-sky-500/10 p-3 text-sky-300">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    KYC health
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    Verification pipeline
                  </h3>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <StatusCard
                  label="Pending review"
                  value={health.kycSignals.pendingReview.toString()}
                  tone={
                    health.kycSignals.pendingReview > 0 ? "warning" : "healthy"
                  }
                  helper="Verification records currently waiting for compliance review."
                />

                <div className="rounded-2xl border border-amber-400/15 bg-amber-500/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-200/80">
                    Stale sessions
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-amber-100">
                    {health.kycSignals.staleSessions}
                  </p>
                  <p className="mt-2 text-sm text-amber-50/80">
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

            <div className="rounded-[1.75rem] border border-white/10 bg-[#071120] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="shrink-0 rounded-2xl bg-sky-500/10 p-3 text-sky-300">
                  <BadgeCheck className="h-5 w-5 shrink-0" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Security signals
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
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
        </div>
      </div>
    </div>
  );
}
