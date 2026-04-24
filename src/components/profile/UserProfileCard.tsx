"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarDays, Check, Mail } from "lucide-react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import Link from "next/link";
import DeleteAcountModal from "../modal/DeleteAcountModal";
import { getUserInitials } from "@/lib/User-Initials/user";
import { getRoleLabel } from "../account/DashboardNavbar.client";
import { VerifyEmailRequestInlineForm } from "@/app/auth/_components/VerifyEmailRequestForm";

type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN" | "MODERATOR";

export type CurrentProfileUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  image: string | null;
  emailVerified: boolean;
  createdAt: Date;
};

type UserProfileCardProps = {
  user: CurrentProfileUser;
  siteName: string;
  siteLogoUrl?: string | null;
};

function getFullName(user: CurrentProfileUser) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || "Unnamed User";
}

export function UserProfileCard({
  user,
  siteName,
  siteLogoUrl,
}: UserProfileCardProps) {
  const fullName = getFullName(user);

  const joinedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(user.createdAt));

  const roleLabel = getRoleLabel(user.role);
  const canReviewInvestmentProfile = user.role === "USER";

  const initials = getUserInitials(user);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl space-y-6">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3c9ee0]/10 via-transparent to-blue-400/5" />

      {/* Glow */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#3c9ee0]/20 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4">
        <Avatar className="h-16 w-16 border border-[#3c9ee0]/30 shadow-md">
          <AvatarImage src={user.image ?? ""} alt={fullName} />
          <AvatarFallback className="bg-[#3c9ee0]/10 text-[#3c9ee0] font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="truncate text-xl font-semibold text-white">
            {fullName}
          </h2>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
            <div className="flex min-w-0 items-center gap-2 text-sm text-slate-400">
              <Mail size={14} />
              <span className="truncate">{user.email}</span>
            </div>
            {user.emailVerified ? (
              <Badge
                variant="outline"
                className="h-6 border-blue-400/30 bg-blue-500/10 px-2 text-[11px] font-medium text-blue-200 shadow-[0_0_18px_rgba(59,130,246,0.22)]"
              >
                <Check className="h-3 w-3 text-blue-300" />
                Verified
              </Badge>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-slate-300 shadow-md"
                  >
                    Verify Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl rounded-[1.75rem] border border-white/10 bg-[#050b17] p-0 text-white ring-white/10">
                  <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-xl text-white">
                      Verify your email
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-6 text-slate-400">
                      Request a fresh verification link for your {siteName} account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="px-6 pb-6">
                    <VerifyEmailRequestInlineForm defaultEmail={user.email} />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Badge className="w-fit text-xs bg-[#3c9ee0]/10 text-[#3c9ee0] border border-[#3c9ee0]/20">
            {roleLabel}
          </Badge>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Info Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-slate-500 text-xs uppercase tracking-wide">Role</p>
          <p className="font-medium text-white">{roleLabel}</p>
        </div>

        <div className="space-y-1 flex items-start gap-2">
          <CalendarDays size={16} className="text-slate-500 mt-[2px]" />
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wide">
              Joined
            </p>
            <p className="font-medium text-white">{joinedDate}</p>
          </div>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Actions */}
      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button className="w-full rounded-xl bg-[#3c9ee0] text-white shadow-md hover:bg-[#2f8bd0] sm:w-auto">
          <Link href="/account/dashboard/profile/update">Update Profile</Link>
        </Button>

        <DeleteAcountModal userId={user.id} />
      </div>

      {canReviewInvestmentProfile ? (
        <div className="relative z-10 rounded-[1.5rem] border border-blue-400/10 bg-blue-500/5 p-4 sm:rounded-[1.75rem] sm:p-5">
          <h3 className="text-lg font-semibold text-white">Next step</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Keep your investment profile up to date separately so your account
            records stay clean and easy to review.
          </p>

          <div className="mt-4">
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
      ) : null}
    </section>
  );
}
