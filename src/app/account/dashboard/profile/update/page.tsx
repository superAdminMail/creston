import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserRound } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { getCurrentUserRole } from "@/lib/getCurrentUser";
import { Button } from "@/components/ui/button";
import ProfileForm from "@/app/account/_components/ProfileForm";
import { type UserRole } from "@/generated/prisma";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "../../_components/dashboardSurfaces";
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

const PROFILE_SURFACE_CLASS = cn(
  DASHBOARD_PAGE_SURFACE_CLASS,
  "overflow-hidden rounded-[2.5rem] p-5 sm:p-7 lg:p-9",
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

  const canReviewInvestmentProfile = role === "USER";

  return (
    <div className={PROFILE_SURFACE_CLASS}>
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex flex-col gap-5 border-b border-slate-200/70 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <div className="min-w-0">
            <Link
              href="/account/dashboard/profile"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to profile
            </Link>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Personal Profile
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl dark:text-white">
              Edit Personal Information
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Update your account name, username, and profile image. Your
              changes will be reflected across your {user.role.toLowerCase()}{" "}
              account.
            </p>
          </div>

          {canReviewInvestmentProfile ? (
            <Button
              asChild
              variant="outline"
              className="w-full shrink-0 rounded-2xl border-slate-200/80 bg-white/80 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 sm:w-auto dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white"
            >
              <Link href="/account/dashboard/user/investment-profile">
                <UserRound className="mr-2 h-4 w-4" />
                Investment profile
              </Link>
            </Button>
          ) : null}
        </header>

        <div className="mt-6">
          <ProfileForm userData={profile} />
        </div>
      </div>
    </div>
  );
}
