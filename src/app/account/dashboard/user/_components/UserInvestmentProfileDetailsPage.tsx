import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CircleAlert,
  FileText,
  MapPin,
  PencilLine,
  Phone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import type { CurrentUserInvestmentProfileData } from "@/actions/profile/get-current-user-investment-profile";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../_components/dashboardSurfaces";
import { DashboardSectionCard } from "../../_components/DashboardSectionCard";
import { Progress } from "@/components/ui/progress";

type UserInvestmentProfileDetailsPageProps = {
  profile: CurrentUserInvestmentProfileData;
  siteName: string;
};

function DetailCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-white/75 p-4 transition-colors hover:border-sky-400/30 dark:bg-white/[0.035]">
      <div className="flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10">
          <Icon className="size-4 text-sky-700 dark:text-sky-300" />
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-3 break-words text-sm font-semibold leading-6 text-slate-950 dark:text-white">
        {value || "Not added yet"}
      </p>
    </div>
  );
}

export function UserInvestmentProfileDetailsPage({
  profile,
  siteName,
}: UserInvestmentProfileDetailsPageProps) {
  const isComplete = profile.profileComplete;
  const isKycVerified = profile.kycStatusLabel === "Verified";

  const completionPercent = Math.max(
    0,
    Math.min(profile.completionPercent, 100),
  );

  const readinessItems = [
    {
      title: isComplete
        ? "Investment profile complete"
        : "Investment details still need attention",
      body: isComplete
        ? "Your investment profile is complete and ready for account servicing."
        : "Finish the missing investment fields to keep your account ready for secure servicing.",
      icon: isComplete ? BadgeCheck : CircleAlert,
      tone: isComplete
        ? "border-emerald-400/20 bg-emerald-400/[0.06]"
        : "border-amber-400/20 bg-amber-400/[0.06]",
      iconColor: isComplete
        ? "text-emerald-600 dark:text-emerald-300"
        : "text-amber-600 dark:text-amber-300",
    },
    {
      title: isKycVerified
        ? "KYC verification completed"
        : `KYC ${profile.kycStatusLabel.toLowerCase()}`,
      body: isKycVerified
        ? "Your identity verification is complete for this investment profile."
        : "Verification documents still need to be prepared or reviewed before full account readiness.",
      icon: ShieldCheck,
      tone: isKycVerified
        ? "border-blue-400/20 bg-blue-400/[0.06]"
        : "border-border/60 bg-white/50 dark:bg-white/[0.025]",
      iconColor: "text-blue-600 dark:text-blue-300",
    },
    {
      title: `${profile.completedFieldCount} of ${profile.totalFieldCount} profile fields completed`,
      body: isComplete
        ? "Your investment profile is fully completed and ready for the next financial steps."
        : `Continue updating your investment profile to improve completion and readiness across your ${siteName} account.`,
      icon: FileText,
      tone: "border-border/60 bg-white/50 dark:bg-white/[0.025]",
      iconColor: "text-sky-700 dark:text-sky-300",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          <Link
            href="/account/dashboard/user"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl dark:text-white">
                Investment Profile
              </h1>

              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                  isComplete
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
                    : "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-300",
                )}
              >
                {profile.profileStatusLabel}
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Review your investment profile, verification status and personal
              details for secure account servicing.
            </p>
          </div>
        </div>

        <Link
          href="/account/dashboard/user/investment-profile/edit"
          className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
        >
          <PencilLine className="size-4" />
          Update profile
        </Link>
      </header>

      <section
        className={cn(DASHBOARD_PAGE_PANEL_CLASS, "overflow-hidden p-5 sm:p-7")}
      >
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10">
                <ShieldCheck className="size-5 text-sky-700 dark:text-sky-300" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.13em] text-slate-500 dark:text-slate-400">
                  Investment profile overview
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                  Your profile readiness
                </h2>
              </div>
            </div>

            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Keep your investment information accurate and up to date to
              support secure financial servicing across your {siteName} account.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/75 px-3 py-2 text-xs font-medium text-slate-700 dark:bg-white/[0.04] dark:text-slate-300">
                <FileText className="size-3.5 text-sky-700 dark:text-sky-300" />
                {profile.completedFieldCount}/{profile.totalFieldCount} fields
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/75 px-3 py-2 text-xs font-medium text-slate-700 dark:bg-white/[0.04] dark:text-slate-300">
                <ShieldCheck className="size-3.5 text-sky-700 dark:text-sky-300" />
                KYC: {profile.kycStatusLabel}
              </span>
            </div>
          </div>

          <div className="w-full shrink-0 rounded-2xl border border-border/60 bg-white/75 p-5 shadow-sm lg:max-w-[19rem] dark:bg-white/[0.035]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.13em] text-slate-500 dark:text-slate-400">
                  Completion
                </p>
                <p className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white">
                  {completionPercent}%
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Profile status
                </p>
                <p
                  className={cn(
                    "mt-1 text-sm font-semibold",
                    isComplete
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-amber-700 dark:text-amber-300",
                  )}
                >
                  {isComplete ? "Ready" : "Incomplete"}
                </p>
              </div>
            </div>

            <Progress
              value={completionPercent}
              className="mt-5 h-2.5 rounded-full bg-slate-200/80 dark:bg-white/[0.07]"
              indicatorClassName="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 shadow-[0_0_18px_rgba(59,130,246,0.35)]"
            />

            <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {isComplete
                ? "Your investment profile is fully completed."
                : "Complete your remaining investment profile fields to improve your account readiness."}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
              Personal investment information
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              The personal details associated with your investment profile.
            </p>
          </div>

          <Link
            href="/account/dashboard/user/investment-profile/edit"
            className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 transition hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
          >
            Edit details
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <DashboardSectionCard className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailCard
              label="Phone number"
              value={profile.details.phoneNumber}
              icon={Phone}
            />

            <DetailCard
              label="Date of birth"
              value={profile.details.dateOfBirth}
              icon={CalendarDays}
            />

            <DetailCard
              label="Country"
              value={profile.details.country}
              icon={MapPin}
            />

            <DetailCard
              label="State"
              value={profile.details.state}
              icon={MapPin}
            />

            <DetailCard
              label="City"
              value={profile.details.city}
              icon={MapPin}
            />

            <DetailCard
              label="Address"
              value={profile.details.addressLine1}
              icon={MapPin}
            />
          </div>
        </DashboardSectionCard>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
            Profile readiness
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Review the current completion and verification status of your
            investment profile.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {readinessItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={cn("rounded-2xl border p-4 sm:p-5", item.tone)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/70 dark:bg-white/[0.05]">
                    <Icon className={cn("size-4.5", item.iconColor)} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-5 text-slate-950 dark:text-white">
                      {item.title}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                      {item.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
            Quick actions
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage your investment information and personal account details.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/account/dashboard/user/investment-profile/edit"
            className={cn(
              DASHBOARD_PAGE_SURFACE_CLASS,
              "group flex items-center justify-between gap-4 p-4 transition-colors hover:border-sky-400/40 hover:bg-sky-50/60 dark:hover:bg-white/[0.06]",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10">
                <PencilLine className="size-4 text-sky-700 dark:text-sky-300" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  Update investment profile
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Edit your investment information
                </p>
              </div>
            </div>

            <ArrowRight className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-sky-600 dark:group-hover:text-sky-300" />
          </Link>

          <Link
            href="/account/dashboard/profile"
            className={cn(
              DASHBOARD_PAGE_SURFACE_CLASS,
              "group flex items-center justify-between gap-4 p-4 transition-colors hover:border-sky-400/40 hover:bg-sky-50/60 dark:hover:bg-white/[0.06]",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10">
                <ShieldCheck className="size-4 text-sky-700 dark:text-sky-300" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  Personal profile
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Review your personal account information
                </p>
              </div>
            </div>

            <ArrowRight className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-sky-600 dark:group-hover:text-sky-300" />
          </Link>
        </div>
      </section>
    </div>
  );
}
