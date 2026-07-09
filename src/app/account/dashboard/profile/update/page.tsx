import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { getCurrentUserRole } from "@/lib/getCurrentUser";
import { getUserInitials } from "@/lib/User-Initials/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ProfileForm from "@/app/account/_components/ProfileForm";
import { type UserRole } from "@/generated/prisma";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../_components/dashboardSurfaces";
import { cn } from "@/lib/utils";

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

const PROFILE_PANEL_CLASS = cn(
  DASHBOARD_PAGE_PANEL_CLASS,
  "overflow-hidden rounded-[2.5rem] p-5 sm:p-7 lg:p-9",
);

const PROFILE_SURFACE_CLASS = cn(
  DASHBOARD_PAGE_SURFACE_CLASS,
  "rounded-[1.9rem] p-6 sm:p-7 lg:p-8",
);

export default async function Page() {
  const sessionUser = await getCurrentSessionUser();
  const role = await getCurrentUserRole();

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
  const canReviewInvestmentProfile = role === "USER";

  return (
    <div className={PROFILE_SURFACE_CLASS}>
      <div className="flex flex-col gap-5 border-b border-slate-200/70 pb-5 sm:gap-6 sm:pb-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/10">
        <div>
          <div className="flex justify-between">
            <Link
              href="/account/dashboard/profile"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to profile
            </Link>
            <div className="inline-flex md:hidden items-center gap-2 rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-sky-800 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Personal Profile
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl dark:text-white">
            Edit Personal Info
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Update your account name, username, and profile image from one
            focused form.
          </p>
        </div>

        {canReviewInvestmentProfile ? (
          <Button
            asChild
            className="inline-flex w-full items-center justify-center rounded-2xl bg-[#3c9ee0] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.22)] transition hover:bg-[#2f8bd0] sm:w-auto"
          >
            <Link href="/account/dashboard/user/investment-profile">
              Review your investment profile
            </Link>
          </Button>
        ) : null}
      </div>
      <div className="mt-6">
        <ProfileForm userData={profile} />
      </div>
    </div>
  );
}
