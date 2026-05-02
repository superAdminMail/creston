"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, Mail, Share2, ShieldCheck, User2 } from "lucide-react";

import { getUserInitials } from "@/lib/User-Initials/user";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
};

export default function ProfilePageView({
  siteName,
  user,
}: ProfilePageProps) {
  const resolvedSiteName = siteName?.trim() || "Company";
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const avatarFallback = getUserInitials({
    name: user.name ?? undefined,
    email: user.email ?? "",
    username: user.username ?? undefined,
  });
  const canReviewInvestmentProfile = user.role === "USER";

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

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("ref", user.referralCode);
    const referralUrl = currentUrl.toString();

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Join me on ${resolvedSiteName}`,
          text: "Use my referral link to sign up.",
          url: referralUrl,
        });
      } else {
        await navigator.clipboard.writeText(referralUrl);
        setShared(true);
        window.setTimeout(() => setShared(false), 2000);
      }
    } catch {
      setShared(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050B1F]">
      <div className="absolute inset-0">
        <div className="absolute left-[-8%] top-[-10%] h-72 w-72 rounded-full bg-blue-500/12 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_35%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-6 lg:p-8">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:pb-6">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-blue-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Personal Profile
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Personal Profile
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-[15px]">
                Manage your account name, username, and profile image here.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-end">
              <Button
                asChild
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] transition hover:opacity-95 sm:px-5"
              >
                <Link href="/account/dashboard/profile/update">
                  Edit Profile
                </Link>
              </Button>

              {canReviewInvestmentProfile ? (
                <Button
                  asChild
                  variant="outline"
                  className="inline-flex w-full items-center justify-center rounded-2xl border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-100 sm:px-5"
                >
                  <Link href="/account/dashboard/user/investment-profile">
                    Review your investment profile
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:mt-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:gap-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-4 sm:rounded-[1.75rem] sm:p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-white/[0.05] sm:h-28 sm:w-28">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-transparent text-2xl font-semibold text-white">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>

                  <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
                    {user.isEmailVerified
                      ? "Email verified"
                      : "Email not verified"}
                  </div>

                  <h2 className="mt-4 text-xl font-semibold text-white">
                    {user.name}
                  </h2>

                  <p className="mt-1 text-sm text-blue-200">
                    {user.role ?? "Investor"}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-4 sm:rounded-[1.75rem] sm:p-6">
                <h3 className="text-lg font-semibold text-white">
                  Account Information
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Manage your personal account details here.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <InfoCard
                    icon={<User2 className="h-4 w-4 text-blue-300" />}
                    label="Full Name"
                    value={user.name}
                  />
                  <InfoCard
                    icon={<Mail className="h-4 w-4 text-blue-300" />}
                    label="Email Address"
                    value={user.email}
                  />
                  <InfoCard
                    icon={<User2 className="h-4 w-4 text-blue-300" />}
                    label="Username"
                    value={user.username ?? "Not set"}
                  />
                </div>
              </div>

              {canReviewInvestmentProfile ? (
                <div className="rounded-[1.5rem] border border-blue-400/10 bg-[rgba(15,23,42,0.72)] p-4 sm:rounded-[1.75rem] sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Referral Code
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Share this code so your referral reward can be tracked.
                      </p>
                    </div>

                    <div className="rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-blue-200">
                      Ready
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                      Your code
                    </p>

                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="break-all font-mono text-lg font-semibold tracking-[0.2em] text-white">
                        {user.referralCode ?? "Generating..."}
                      </p>

                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <Button
                          type="button"
                          onClick={handleCopyReferralCode}
                          disabled={!user.referralCode}
                          variant="outline"
                          className="w-full rounded-2xl border-white/10 bg-white/[0.04] px-4 text-slate-100 sm:w-auto"
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
                          className="w-full rounded-2xl bg-blue-600 text-white hover:bg-blue-500 sm:w-auto"
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
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:gap-6">
              {canReviewInvestmentProfile ? (
                <div className="rounded-[1.5rem] border border-blue-400/10 bg-blue-500/5 p-4 sm:rounded-[1.75rem] sm:p-6">
                  <h3 className="text-lg font-semibold text-white">
                    Next step
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Keep your investment profile up to date separately so your
                    account records stay clean and easy to review.
                  </p>

                  <div className="mt-5">
                    <Button
                      asChild
                      className="w-full rounded-2xl bg-blue-600 text-white hover:bg-blue-500 sm:w-auto"
                    >
                      <Link href="/account/dashboard/user/investment-profile">
                        Review your investment profile
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <></>
              )}

              <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-4 sm:rounded-[1.75rem] sm:p-6">
                <h3 className="text-lg font-semibold text-white">
                  Security Notice
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Your account is protected by a password and you can change it
                  at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
          {label}
        </p>
      </div>
      <p className="mt-3 break-words text-sm font-medium text-white">{value}</p>
    </div>
  );
}
