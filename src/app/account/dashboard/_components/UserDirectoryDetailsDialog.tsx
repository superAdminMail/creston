"use client";

import type { ReactNode } from "react";
import {
  CalendarDays,
  Globe2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDirectoryCurrency } from "@/lib/formatters/directory";
import { formatMigrationTimelineTimestamp } from "@/lib/migration/migrationPresentation";
import type { DashboardDirectoryUser } from "@/lib/types/dashboard";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "./dashboardSurfaces";

type UserDirectoryDetailsDialogProps = {
  user: DashboardDirectoryUser | null;
  siteName?: string;
  onOpenChange: (open: boolean) => void;
  renderRoleBadge: (role: DashboardDirectoryUser["role"]) => ReactNode;
  renderEmailVerificationBadge: (verified: boolean) => ReactNode;
  renderKycBadge: (status: DashboardDirectoryUser["kycStatus"]) => ReactNode;
  renderMigrationBadge: (
    isLegacyUser: boolean,
    migrationStatus: DashboardDirectoryUser["migrationStatus"],
  ) => ReactNode;
  renderAccountStatusBadge: (
    status: DashboardDirectoryUser["accountStatus"],
  ) => ReactNode;
};

export function UserDirectoryDetailsDialog({
  user,
  siteName,
  onOpenChange,
  renderRoleBadge,
  renderEmailVerificationBadge,
  renderKycBadge,
  renderMigrationBadge,
  renderAccountStatusBadge,
}: UserDirectoryDetailsDialogProps) {
  const companyName = siteName?.trim() || "Company";

  const initials =
    user?.fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <Dialog open={Boolean(user)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[min(96vw,46rem)] overflow-hidden !rounded-[1.75rem] !border-slate-200/80 !bg-none !bg-white/95 !p-0 !text-slate-950 !shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:!border-white/10 dark:!bg-zinc-950/95 dark:!text-white dark:!shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
        {user ? (
          <div className="flex max-h-[92dvh] min-h-0 flex-col">
            <DialogHeader className="shrink-0 border-b border-slate-200/80 px-4 py-4 dark:border-white/10 sm:px-6 sm:py-5">
              <div className="flex items-start gap-3 pr-7">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200">
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <DialogTitle className="break-words text-lg font-semibold tracking-tight text-slate-950 dark:text-white sm:text-xl">
                    {user.fullName}
                  </DialogTitle>

                  <DialogDescription className="mt-1 break-all text-sm leading-5 text-slate-600 dark:text-slate-400">
                    {user.email}
                  </DialogDescription>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {renderRoleBadge(user.role)}
                    {renderAccountStatusBadge(user.accountStatus)}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              {/* Account overview */}
              <section className="space-y-3">
                <SectionHeading
                  title="Account overview"
                  description="Verification and account standing"
                  icon={<ShieldCheck className="size-4" />}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <StatusCard label="Email verification">
                    {renderEmailVerificationBadge(user.emailVerified)}
                  </StatusCard>

                  <StatusCard label="KYC verification">
                    {renderKycBadge(user.kycStatus)}
                  </StatusCard>

                  <StatusCard label="Account status">
                    {renderAccountStatusBadge(user.accountStatus)}
                  </StatusCard>

                  <StatusCard label="Migration status">
                    {renderMigrationBadge(
                      user.isLegacyUser,
                      user.migrationStatus,
                    )}
                  </StatusCard>
                </div>
              </section>

              {/* Financial overview */}
              <section className="space-y-3">
                <SectionHeading
                  title="Financial overview"
                  description="Recorded account balances and activity"
                  icon={<Wallet className="size-4" />}
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <FinancialCard
                    label="Total deposits"
                    amount={user.totalDeposits}
                    emphasis="blue"
                  />

                  <FinancialCard
                    label="Total invested"
                    amount={user.totalInvested}
                    emphasis="neutral"
                  />

                  <FinancialCard
                    label="Wallet balance"
                    amount={user.walletBalance}
                    emphasis="neutral"
                  />
                </div>
              </section>

              {/* Contact and profile */}
              <section className="space-y-3">
                <SectionHeading
                  title="Contact details"
                  description="User profile information"
                  icon={<UserRound className="size-4" />}
                />

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
                  <DetailRow
                    icon={<Mail className="size-4" />}
                    label="Email address"
                    value={user.email}
                  />

                  <DetailRow
                    icon={<Phone className="size-4" />}
                    label="Phone number"
                    value={user.phoneNumber?.trim() || "Not set"}
                  />

                  <DetailRow
                    icon={<Globe2 className="size-4" />}
                    label="Country"
                    value={user.country?.trim() || "Not set"}
                  />
                </div>
              </section>

              {/* Account timeline */}
              <section className="space-y-3">
                <SectionHeading
                  title="Account timeline"
                  description="Registration and migration history"
                  icon={<CalendarDays className="size-4" />}
                />

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Date joined
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                    {user.joinedAt}
                  </p>
                </div>

                {user.isLegacyUser ? (
                  user.migratedAt ? (
                    <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 dark:border-sky-400/20 dark:bg-sky-400/[0.08]">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-800 dark:text-sky-200">
                        Migration completed
                      </p>

                      <p className="mt-1.5 text-sm font-semibold text-slate-950 dark:text-white">
                        {formatMigrationTimelineTimestamp(user.migratedAt)}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        This legacy account was successfully migrated to{" "}
                        {companyName}.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-400/20 dark:bg-amber-400/[0.07]">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800 dark:text-amber-200">
                        Migration pending
                      </p>

                      <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        This legacy account has not completed migration yet.
                      </p>
                    </div>
                  )
                ) : null}
              </section>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function SectionHeading({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatusCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} min-w-0 p-3.5`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <div className="mt-2 flex min-h-6 items-center">{children}</div>
    </div>
  );
}

function FinancialCard({
  label,
  amount,
  emphasis = "neutral",
}: {
  label: string;
  amount: number;
  emphasis?: "blue" | "neutral";
}) {
  return (
    <div
      className={`min-w-0 rounded-2xl border p-4 ${
        emphasis === "blue"
          ? "border-blue-200/80 bg-blue-50/70 dark:border-blue-400/20 dark:bg-blue-400/[0.07]"
          : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]"
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-lg font-semibold tracking-tight text-slate-950 dark:text-white sm:text-xl">
        {formatDirectoryCurrency(amount)}
      </p>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-200/80 px-3.5 py-3.5 last:border-b-0 dark:border-white/[0.07] sm:px-4">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/[0.05] dark:text-slate-400">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-slate-900 dark:text-slate-100">
          {value}
        </p>
      </div>
    </div>
  );
}
