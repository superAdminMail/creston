"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type AccountAvatarProps = {
  avatarUrl?: string | null;
  className?: string;
  email?: string | null;
  fallbackClassName?: string;
  name?: string | null;
};

export function getAccountInitials(name?: string | null, email?: string | null) {
  const source = (name?.trim() || email?.trim() || "Havenstone").trim();
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
}

export function AccountAvatar({
  avatarUrl,
  className,
  email,
  fallbackClassName,
  name,
}: AccountAvatarProps) {
  return (
    <Avatar className={cn("border border-white/15 shadow-sm", className)}>
      <AvatarImage src={avatarUrl ?? undefined} alt={name ?? "User avatar"} />
      <AvatarFallback
        className={cn(
          "bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white",
          fallbackClassName,
        )}
      >
        {getAccountInitials(name, email)}
      </AvatarFallback>
    </Avatar>
  );
}
