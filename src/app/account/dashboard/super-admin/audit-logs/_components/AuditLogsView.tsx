import {
  BadgeCheck,
  BellRing,
  CreditCard,
  FileCheck2,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
  Wallet,
} from "lucide-react";

import type {
  AuditLogSeverity,
  SuperAdminAuditLogsData,
} from "@/actions/super-admin/audit-logs/getSuperAdminAuditLogs";
import { SuperAdminPageHeader } from "../../_components/SuperAdminPageHeader";
import { SuperAdminStatCard } from "../../_components/SuperAdminStatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuditLogsViewProps = {
  data: SuperAdminAuditLogsData;
};

function severityStyles(severity: AuditLogSeverity) {
  if (severity === "success") {
    return {
      badge: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
      dot: "bg-emerald-400",
      card: "border-emerald-400/10",
      iconWrap: "bg-emerald-500/10 text-emerald-300",
      metaIcon: "text-emerald-300",
      label: "Successful event",
    };
  }

  if (severity === "warning") {
    return {
      badge: "border-amber-400/20 bg-amber-500/10 text-amber-300",
      dot: "bg-amber-400",
      card: "border-amber-400/10",
      iconWrap: "bg-amber-500/10 text-amber-300",
      metaIcon: "text-amber-300",
      label: "Warning event",
    };
  }

  if (severity === "critical") {
    return {
      badge: "border-rose-400/20 bg-rose-500/10 text-rose-300",
      dot: "bg-rose-400",
      card: "border-rose-400/10",
      iconWrap: "bg-rose-500/10 text-rose-300",
      metaIcon: "text-rose-300",
      label: "Critical event",
    };
  }

  return {
    badge: "border-sky-400/20 bg-sky-500/10 text-sky-300",
    dot: "bg-sky-400",
    card: "border-sky-400/10",
    iconWrap: "bg-sky-500/10 text-sky-300",
    metaIcon: "text-sky-300",
    label: "Informational event",
  };
}

function actionIcon(action: string) {
  const normalizedAction = action.toUpperCase();

  if (normalizedAction.includes("PAYMENT")) return CreditCard;
  if (normalizedAction.includes("WEBHOOK")) return Wallet;
  if (normalizedAction.includes("KYC")) return FileCheck2;
  if (normalizedAction.includes("CRON")) return RefreshCw;
  if (normalizedAction.includes("USER") || normalizedAction.includes("PROFILE")) {
    return UserCog;
  }
  if (normalizedAction.includes("NOTIFICATION")) return BellRing;

  return BellRing;
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function AuditLogsView({ data }: AuditLogsViewProps) {
  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-[#071120] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:p-5 md:p-8">
          <SuperAdminPageHeader
            backHref="/account/dashboard/super-admin"
            backLabel="Back to super admin"
            title="Audit logs"
            description="Review security-sensitive actions, payment reviews, compliance decisions, webhook events, and system jobs across the platform."
          />

          <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">
            Snapshot refreshed {data.checkedAtLabel}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <SuperAdminStatCard
              label="Window"
              value={data.windowLabel}
              description="Live audit records in the selected time window."
            />
            <SuperAdminStatCard
              label="Total events"
              value={formatCount(data.totalEvents)}
              description="Captured directly from the audit_log table."
            />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="rounded-[1.75rem] border-white/10 bg-[#071120] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
              <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
                <div className="shrink-0 rounded-2xl bg-white/[0.05] p-3 text-slate-300">
                  <Search className="h-5 w-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                    Search
                  </CardTitle>
                  <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    Search by actor, action, entity type, entity id, or IP
                    address.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 sm:px-5">
                <div className="rounded-2xl border border-white/10 bg-[#091327] px-4 py-3 text-sm text-slate-400">
                  Live audit records are indexed by actor, action, entity, and
                  time, so future filtering can stay fast without changing the
                  layout.
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem] border-white/10 bg-[#071120] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
              <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
                <div className="shrink-0 rounded-2xl bg-white/[0.05] p-3 text-slate-300">
                  <Filter className="h-5 w-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                    Filters
                  </CardTitle>
                  <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    Severity, actor role, action type, entity type, and date
                    range.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 sm:px-5">
                <div className="rounded-2xl border border-white/10 bg-[#091327] px-4 py-3 text-sm text-slate-400">
                  The current list is driven directly from the database and can
                  be extended into an interactive filter set without changing
                  the surrounding shell.
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 space-y-4">
            {data.auditItems.length === 0 ? (
              <Card className="rounded-[1.75rem] border-white/10 bg-[#071120] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                <CardContent className="p-5 sm:p-6">
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center sm:p-8">
                    <ShieldCheck className="mx-auto h-10 w-10 text-slate-400" />
                    <p className="mt-4 text-base font-medium text-white">
                      No audit events found
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      There are no audit log records in the current window.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              data.auditItems.map((item) => {
                const styles = severityStyles(item.severity);
                const ActionIcon = actionIcon(item.action);

                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "rounded-[1.75rem] border bg-[#071120] shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
                      styles.card,
                    )}
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div
                            className={cn(
                              "mt-0.5 shrink-0 rounded-2xl p-3",
                              styles.iconWrap,
                            )}
                          >
                            <ActionIcon className="h-5 w-5 shrink-0" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-white">
                                {item.action}
                              </p>

                              <span
                                className={cn(
                                  "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize",
                                  styles.badge,
                                )}
                              >
                                <span
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    styles.dot,
                                  )}
                                />
                                {styles.label}
                              </span>

                              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-300">
                                {item.id}
                              </span>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-slate-400">
                              {item.description}
                            </p>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              <div className="rounded-2xl border border-white/10 bg-[#091327] px-4 py-3">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                  Actor
                                </p>
                                <p className="mt-2 text-sm font-medium text-white">
                                  {item.actor}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {item.actorRole}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-[#091327] px-4 py-3">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                  Entity
                                </p>
                                <p className="mt-2 text-sm font-medium text-white">
                                  {item.entityType}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {item.entityId}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-[#091327] px-4 py-3">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                  Origin
                                </p>
                                <p className="mt-2 text-sm font-medium text-white">
                                  {item.ipAddress}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {item.userAgent}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-[#091327] px-4 py-3">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                  Time
                                </p>
                                <p className="mt-2 text-sm font-medium text-white">
                                  {item.createdAtLabel}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="w-full xl:w-[300px]">
                          <div className="rounded-2xl border border-white/10 bg-[#091327] p-4">
                            <div className="flex items-center gap-2">
                              <BadgeCheck
                                className={cn("h-4 w-4 shrink-0", styles.metaIcon)}
                              />
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Metadata preview
                              </p>
                            </div>

                            <div className="mt-3 space-y-2">
                              {item.metadataPreview.map((line) => (
                                <div
                                  key={line}
                                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 break-words"
                                >
                                  {line}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
