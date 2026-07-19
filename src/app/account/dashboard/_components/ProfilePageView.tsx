"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Mail,
  Share2,
  ShieldCheck,
  User2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getUserInitials } from "@/lib/User-Initials/user";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "./dashboardSurfaces";

type ProfilePageProps = {
  siteName?: string;
  user: {
    name: string;
    email: string;
    username?: string | null;
    image?: string | null;
    role?: string | null;
    isEmailVerified?: boolean | null;
    referralCode?: string | null;
  };
  referrals?: ReferralActivityItem[];
};

type ReferralActivityItem = {
  id: string;
  code: string;
  status: "PENDING" | "ACTIVE" | "REWARDED" | "CANCELLED";
  activatedBy?: "SAVINGS_ACCOUNT_CREATED" | "INVESTMENT_ORDER_CONFIRMED" | null;
  activatedAt?: string | null;
  rewardedAt?: string | null;
  referredUser: {
    id: string;
    name: string;
    email: string;
    username?: string | null;
    image?: string | null;
  };
};

const PROFILE_PANEL_CLASS = cn(
  DASHBOARD_PAGE_PANEL_CLASS,
  "overflow-hidden rounded-[2.5rem] p-5 sm:p-7 lg:p-9",
);

const PROFILE_SURFACE_CLASS = cn(
  DASHBOARD_PAGE_SURFACE_CLASS,
  "rounded-[1.9rem] p-5 sm:p-6 lg:p-7",
);

export default function ProfilePageView({
  siteName,
  user,
  referrals = [],
}: ProfilePageProps) {
  const resolvedSiteName = siteName?.trim() || "Company";
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
  const avatarFallback = getUserInitials({
    name: user.name ?? undefined,
    email: user.email ?? "",
    username: user.username ?? undefined,
  });
  const canReviewInvestmentProfile = user.role === "USER";
  const referralSummary = referrals.reduce(
    (acc, referral) => {
      acc.total += 1;

      if (referral.status === "PENDING") {
        acc.pending += 1;
      } else if (referral.status === "ACTIVE") {
        acc.active += 1;
      } else if (referral.status === "REWARDED") {
        acc.rewarded += 1;
      }

      return acc;
    },
    {
      total: 0,
      pending: 0,
      active: 0,
      rewarded: 0,
    },
  );

  async function handleCopyReferralCode() {
    if (!user.referralCode) return;

    try {
      await navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleShareReferralLink() {
    if (!user.referralCode) return;

    const referralUrl = new URL("/auth/login", window.location.origin);
    referralUrl.searchParams.set("ref", user.referralCode);

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Join me on ${resolvedSiteName}`,
          text: "Use my referral link to sign up.",
          url: referralUrl.toString(),
        });
      } else {
        await navigator.clipboard.writeText(referralUrl.toString());
        setShared(true);
        window.setTimeout(() => setShared(false), 2000);
      }
    } catch {
      setShared(false);
    }
  }

  return (
    <div className={PROFILE_PANEL_CLASS}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 border-b border-slate-200/70 pb-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:pb-6 dark:border-white/10">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-sky-800 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Personal Profile
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl dark:text-white">
            Personal Profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400">
            Manage your account name, username, and profile image here.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 lg:max-w-sm">
          <Button
            asChild
            className="inline-flex w-full items-center justify-center rounded-2xl bg-[#3c9ee0] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.22)] transition hover:bg-[#2f8bd0] sm:px-5"
          >
            <Link href="/account/dashboard/profile/update">Edit Profile</Link>
          </Button>

          {canReviewInvestmentProfile ? (
            <Button
              asChild
              variant="outline"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 sm:px-5 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white"
            >
              <Link href="/account/dashboard/user/investment-profile">
                Review investment profile
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex justify-center lg:mt-6">
        <div className="w-full max-w-5xl space-y-4 sm:space-y-6">
          <section className={PROFILE_SURFACE_CLASS}>
            <div className="flex flex-col items-center text-center">
              <button
                type="button"
                onClick={() => setAvatarPreviewOpen(true)}
                className="group relative h-24 w-24 overflow-hidden rounded-full border border-slate-200/80 bg-white/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/25 sm:h-28 sm:w-28 dark:border-white/10 dark:bg-white/[0.04]"
                aria-label="Preview profile image"
              >
                <Avatar className="h-full w-full">
                  <AvatarImage
                    src={user.image ?? undefined}
                    alt={user.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-transparent text-2xl font-semibold text-slate-950 dark:text-white">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>

                <span className="absolute inset-x-0 bottom-0 bg-slate-950/55 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white opacity-0 transition group-hover:opacity-100 dark:bg-black/50">
                  Preview
                </span>
              </button>

              {user.isEmailVerified ? (
                <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Email verified
                </div>
              ) : (
                <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">
                  Email not verified
                </div>
              )}

              <h2 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">
                {user.name}
              </h2>

              <p className="mt-1 text-sm text-sky-700 dark:text-sky-200">
                {user.role ?? "Investor"}
              </p>
            </div>
          </section>

          <section className={PROFILE_SURFACE_CLASS}>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
              Account Information
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Manage your personal account details here.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <InfoCard
                icon={
                  <User2 className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                }
                label="Full Name"
                value={user.name}
              />
              <InfoCard
                icon={
                  <Mail className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                }
                label="Email Address"
                value={user.email}
              />
              <InfoCard
                icon={
                  <User2 className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                }
                label="Username"
                value={user.username ?? "Not set"}
              />
            </div>
          </section>

          {canReviewInvestmentProfile ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <section className={cn(PROFILE_SURFACE_CLASS, "p-4 sm:p-5")}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-950 dark:text-white">
                  Next step
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Keep your investment profile up to date separately so your
                  account records stay clean and easy to review.
                </p>

                <div className="mt-4">
                  <Button
                    asChild
                    className="w-full rounded-2xl bg-[#3c9ee0] text-white hover:bg-[#2f8bd0]"
                  >
                    <Link href="/account/dashboard/user/investment-profile">
                      Open investment profile
                    </Link>
                  </Button>
                </div>
              </section>

              <section className={cn(PROFILE_SURFACE_CLASS, "p-4 sm:p-5")}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-950 dark:text-white">
                  Security Notice
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Your account is protected by a password and you can change it
                  at any time.
                </p>
              </section>
            </div>
          ) : (
            <section className={PROFILE_SURFACE_CLASS}>
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                Security Notice
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Your account is protected by a password and you can change it at
                any time.
              </p>
            </section>
          )}

          {canReviewInvestmentProfile ? (
            <section className={PROFILE_SURFACE_CLASS}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                    Referral Code
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Share this code so your referral reward can be tracked.
                  </p>
                </div>

                <div className="rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100">
                  Ready
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Your code
                </p>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="break-all font-mono text-lg font-semibold tracking-[0.2em] text-slate-950 dark:text-white">
                    {user.referralCode ?? "Generating..."}
                  </p>

                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button
                      type="button"
                      onClick={handleCopyReferralCode}
                      disabled={!user.referralCode}
                      variant="outline"
                      className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 text-slate-700 hover:bg-slate-50 hover:text-slate-950 sm:w-auto dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copied ? "Copied" : "Copy code"}
                    </Button>

                    <Button
                      type="button"
                      onClick={handleShareReferralLink}
                      disabled={!user.referralCode}
                      className="w-full rounded-2xl bg-[#3c9ee0] text-white hover:bg-[#2f8bd0] sm:w-auto"
                    >
                      {shared ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                      {shared ? "Shared" : "Share link"}
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {canReviewInvestmentProfile ? (
            <section className={PROFILE_SURFACE_CLASS}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                    Referral Activity
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    View your referral activity.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <ReferralSummaryCard
                  label="Total"
                  value={referralSummary.total}
                />
                <ReferralSummaryCard
                  label="Pending"
                  value={referralSummary.pending}
                  tone="amber"
                />
                <ReferralSummaryCard
                  label="Activated"
                  value={referralSummary.active}
                  tone="blue"
                />
                <ReferralSummaryCard
                  label="Rewarded"
                  value={referralSummary.rewarded}
                  tone="emerald"
                />
              </div>

              <div className="mt-5 space-y-3">
                {referrals.length > 0 ? (
                  referrals.map((referral) => (
                    <ReferralActivityRow
                      key={referral.id}
                      referral={referral}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white/80 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                    No one has used your referral code yet. Once someone signs
                    up with your link, their status will appear here.
                  </div>
                )}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <Dialog open={avatarPreviewOpen} onOpenChange={setAvatarPreviewOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-[1.5rem] border border-slate-200/80 bg-white/[0.96] p-4 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-950/[0.96] dark:text-white sm:max-w-sm">
          <DialogHeader className="space-y-1 pr-10">
            <DialogTitle className="text-base font-semibold">
              Profile image preview
            </DialogTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {user.name}
            </p>
          </DialogHeader>

          <div className="mx-auto flex w-full max-w-[18rem] items-center justify-center rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            {user.image ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem]">
                <Image
                  src={user.image}
                  alt={user.name}
                  fill
                  sizes="(max-width: 640px) 80vw, 18rem"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white text-4xl font-semibold text-slate-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-white">
                {avatarFallback}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReferralActivityRow({ referral }: { referral: ReferralActivityItem }) {
  const avatarFallback = getUserInitials({
    name: referral.referredUser.name ?? undefined,
    email: referral.referredUser.email,
    username: referral.referredUser.username ?? undefined,
  });

  const statusMeta = getReferralStatusMeta(referral.status);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-11 w-11 shrink-0 border border-slate-200/80 bg-white dark:border-white/10 dark:bg-white/[0.04]">
            <AvatarImage
              src={referral.referredUser.image ?? undefined}
              alt={referral.referredUser.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-transparent text-sm font-semibold text-slate-950 dark:text-white">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
              {referral.referredUser.name}
            </p>
            <p className="truncate text-xs text-slate-600 dark:text-slate-400">
              {referral.referredUser.username
                ? `@${referral.referredUser.username}`
                : referral.referredUser.email}
            </p>
          </div>
        </div>

        <div>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em]",
              statusMeta.className,
            )}
          >
            {statusMeta.label}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/70 pt-3 text-sm text-slate-600 dark:border-white/10 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span className="leading-6">{getReferralActivationNote(referral)}</span>
        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
          Referral code used
        </span>
      </div>
    </div>
  );
}

function ReferralSummaryCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "slate" | "amber" | "blue" | "emerald";
}) {
  const toneClasses = {
    slate:
      "border-slate-200/80 bg-white/80 text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white",
    amber:
      "border-amber-200/80 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100",
    blue: "border-blue-200/80 bg-blue-50 text-blue-800 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-100",
    emerald:
      "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100",
  } as const;

  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", toneClasses[tone])}>
      <p className="text-[11px] uppercase tracking-[0.2em] text-current/70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function getReferralStatusMeta(status: ReferralActivityItem["status"]) {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending",
        className:
          "border-amber-200/80 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100",
      };
    case "ACTIVE":
      return {
        label: "Activated",
        className:
          "border-blue-200/80 bg-blue-50 text-blue-800 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-100",
      };
    case "REWARDED":
      return {
        label: "Rewarded",
        className:
          "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100",
      };
    case "CANCELLED":
    default:
      return {
        label: "Cancelled",
        className:
          "border-slate-200/80 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300",
      };
  }
}

function getReferralActivationNote(referral: ReferralActivityItem) {
  if (referral.status === "PENDING") {
    return "This referral has not been activated yet.";
  }

  if (referral.status === "ACTIVE") {
    if (referral.activatedBy === "INVESTMENT_ORDER_CONFIRMED") {
      return "Activated after the referred user completed their first successful investment order.";
    }

    if (referral.activatedBy === "SAVINGS_ACCOUNT_CREATED") {
      return "Activated after the referred user completed their first successful savings activity.";
    }

    return "Activated after the referred user completed their first successful qualifying activity.";
  }

  if (referral.status === "REWARDED") {
    return "This referral has already been activated and fully rewarded.";
  }

  return "This referral has been cancelled and will not proceed further.";
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "min-w-0 p-4")}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
      <p className="mt-3 break-words text-sm font-medium text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}
