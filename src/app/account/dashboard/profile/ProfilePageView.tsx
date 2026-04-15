"use client";

import Image from "next/image";
import { Camera, Mail, MapPin, Phone, ShieldCheck, User2 } from "lucide-react";
import { getUserInitials } from "@/lib/User-Initials/user";

type ProfilePageProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
    role?: string | null;
  };
  profile?: {
    phoneNumber?: string | null;
    country?: string | null;
    state?: string | null;
    city?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    isVerified?: boolean | null;
  } | null;
};

export default function ProfilePageView({ user, profile }: ProfilePageProps) {
  const location = [profile?.city, profile?.state, profile?.country]
    .filter(Boolean)
    .join(", ");

  const avatarFallback = getUserInitials({
    name: user.name ?? undefined,
    email: user.email ?? "",
    username: undefined,
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
                Account Profile
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Your Profile
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Manage your identity, contact details, and account information
                in one secure place.
              </p>
            </div>

            <button className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] transition hover:opacity-95">
              Edit Profile
            </button>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-5">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-white/[0.05] sm:h-28 sm:w-28">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white">
                          {avatarFallback}
                        </div>
                      )}
                    </div>

                    <button className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-blue-600 text-white shadow-lg">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>

                  <h2 className="mt-4 text-xl font-semibold text-white">
                    {user.name}
                  </h2>

                  <p className="mt-1 text-sm text-blue-200">
                    {user.role ?? "Investor"}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        profile?.isVerified ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    {profile?.isVerified
                      ? "Verified Account"
                      : "Verification Pending"}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Profile Status
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {profile?.isVerified ? "Verified" : "Pending"}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Identity and account information status.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Contact Readiness
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {profile?.phoneNumber ? "Complete" : "Incomplete"}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Keep your contact details current for smooth support.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-white">
                  Personal Information
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Your primary account and contact details.
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
                    icon={<Phone className="h-4 w-4 text-blue-300" />}
                    label="Phone Number"
                    value={profile?.phoneNumber || "Not provided"}
                  />
                  <InfoCard
                    icon={<MapPin className="h-4 w-4 text-blue-300" />}
                    label="Location"
                    value={location || "Not provided"}
                  />
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-white">
                  Address Details
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Your registered address information.
                </p>

                <div className="mt-5 grid gap-4">
                  <InfoRow
                    label="Address Line 1"
                    value={profile?.addressLine1 || "Not provided"}
                  />
                  <InfoRow
                    label="Address Line 2"
                    value={profile?.addressLine2 || "Not provided"}
                  />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <InfoRow
                      label="City"
                      value={profile?.city || "—"}
                      compact
                    />
                    <InfoRow
                      label="State"
                      value={profile?.state || "—"}
                      compact
                    />
                    <InfoRow
                      label="Country"
                      value={profile?.country || "—"}
                      compact
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-blue-400/10 bg-blue-500/5 p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-white">
                  Security Notice
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Changes to personal information may affect verification,
                  withdrawal processing, and account review timelines.
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
      <p className="mt-3 text-sm font-medium text-white break-words">{value}</p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.04] ${
        compact ? "p-4" : "p-4 sm:p-5"
      }`}
    >
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white break-words">{value}</p>
    </div>
  );
}
