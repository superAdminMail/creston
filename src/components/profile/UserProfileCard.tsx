"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Mail } from "lucide-react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import Link from "next/link";
import DeleteAcountModal from "../modal/DeleteAcountModal";

type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN" | "MODERATOR";

export type CurrentProfileUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  image: string | null;
  createdAt: Date;
};

type UserProfileCardProps = {
  user: CurrentProfileUser;
};

const ROLE_LABELS: Record<UserRole, string> = {
  USER: "User",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
  MODERATOR: "Moderator",
};

function getFullName(user: CurrentProfileUser) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || "Unnamed User";
}

function getInitials(user: CurrentProfileUser) {
  const fullName = getFullName(user);
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const fullName = getFullName(user);

  const joinedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(user.createdAt));

  const initials = getInitials(user);

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

        <div className="min-w-0 space-y-1">
          <h2 className="truncate text-xl font-semibold text-white">
            {fullName}
          </h2>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Mail size={14} />
            <span className="truncate">{user.email}</span>
          </div>

          <Badge className="w-fit text-xs bg-[#3c9ee0]/10 text-[#3c9ee0] border border-[#3c9ee0]/20">
            {ROLE_LABELS[user.role] ?? user.role}
          </Badge>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Info Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-slate-500 text-xs uppercase tracking-wide">Role</p>
          <p className="font-medium text-white">{ROLE_LABELS[user.role]}</p>
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
        <Button className="w-full sm:w-auto rounded-xl bg-[#3c9ee0] hover:bg-[#2f8bd0] text-white shadow-md">
          <Link href="/account/dashboard/profile/update">Update Profile</Link>
        </Button>

        <DeleteAcountModal userId={user.id} />
      </div>
    </section>
  );
}
