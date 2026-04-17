import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { getUserInitials } from "@/lib/User-Initials/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ProfileForm from "@/app/account/_components/ProfileForm";
import { type UserRole } from "@/generated/prisma";

type ProfileEditUser = {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  image: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  profileAvatar: { url: string; key: string } | null;
};

export default async function Page() {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id || !sessionUser.email) return null;

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      image: true,
      role: true,
      emailVerified: true,
      profileAvatarFileAsset: {
        select: {
          storageKey: true,
          url: true,
        },
      },
    },
  });

  if (!user) return null;

  const profile: ProfileEditUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    image: user.image,
    role: user.role,
    isEmailVerified: user.emailVerified,
    profileAvatar: user.profileAvatarFileAsset
      ? {
          url: user.profileAvatarFileAsset.url ?? "",
          key: user.profileAvatarFileAsset.storageKey,
        }
      : null,
  };

  const initials = getUserInitials({
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
              <Link
                href="/account/dashboard/profile"
                className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to profile
              </Link>

              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-blue-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Personal Profile
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Edit Personal Info
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Update your account name, username, and profile image from one
                focused form.
              </p>
            </div>

            <Button
              asChild
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] transition hover:opacity-95"
            >
              <Link href="/account/dashboard/user/investment-profile">
                Review your investment profile
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-3xl rounded-[1.75rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-5 sm:p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-white/[0.05] sm:h-28 sm:w-28">
                  <AvatarImage
                    src={profile.profileAvatar?.url ?? profile.image ?? undefined}
                    alt={profile.name ?? "Profile avatar"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-transparent text-2xl font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <h2 className="mt-4 text-xl font-semibold text-white">
                  {profile.name}
                </h2>

                <p className="mt-1 text-sm text-blue-200">
                  {profile.username ?? "No username yet"}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
                  {profile.isEmailVerified ? "Email verified" : "Email not verified"}
                </div>
              </div>

              <div className="mt-6">
                <ProfileForm userData={profile} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
