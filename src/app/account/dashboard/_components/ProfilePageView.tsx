"use client";

import Link from "next/link";
import { Mail, ShieldCheck, User2 } from "lucide-react";

import { getUserInitials } from "@/lib/User-Initials/user";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ProfilePageProps = {
  user: {
    name: string;
    email: string;
    username?: string | null;
    image?: string | null;
    role?: string | null;
    isEmailVerified?: boolean | null;
  };
};

export default function ProfilePageView({ user }: ProfilePageProps) {
  const avatarFallback = getUserInitials({
    name: user.name ?? undefined,
    email: user.email ?? "",
    username: user.username ?? undefined,
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050B1F]">
      <div className="absolute inset-0">
        <div className="absolute left-[-8%] top-[-10%] h-72 w-72 rounded-full bg-blue-500/12 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_35%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-blue-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Personal Profile
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Personal Profile
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Manage your account name, username, and profile image here.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] transition hover:opacity-95"
              >
                <Link href="/account/dashboard/profile/update">
                  Edit Profile
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="inline-flex items-center justify-center rounded-2xl border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-100"
              >
                <Link href="/account/dashboard/user/investment-profile">
                  Review your investment profile
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-5">
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

                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
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

              <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-white">
                  Account Information
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Your personal account details from the User model.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.75rem] border border-blue-400/10 bg-blue-500/5 p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-white">Next step</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Keep your investment profile up to date separately so your
                  account records stay clean and easy to review.
                </p>

                <div className="mt-5">
                  <Button
                    asChild
                    className="rounded-2xl bg-blue-600 text-white hover:bg-blue-500"
                  >
                    <Link href="/account/dashboard/user/investment-profile">
                      Review your investment profile
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-white">
                  Security Notice
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Changes to your personal information may affect how the
                  account is displayed across the dashboard.
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
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
