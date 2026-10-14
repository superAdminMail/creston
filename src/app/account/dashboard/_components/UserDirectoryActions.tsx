"use client";

import { Ellipsis, Eye, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DashboardDirectoryUser } from "@/lib/types/dashboard";

type UserActionMode = "suspend" | "unsuspend";

type UserDirectoryActionsProps = {
  user: DashboardDirectoryUser;
  canSuspendUsers: boolean;
  layout?: "mobile" | "desktop";
  onOpenUser: (user: DashboardDirectoryUser) => void;
  onOpenUserAction: (
    user: DashboardDirectoryUser,
    mode: UserActionMode,
  ) => void;
  onOpenDeleteUser: (user: DashboardDirectoryUser) => void;
};

const menuItemClass =
  "gap-2 rounded-md px-2.5 py-2 text-sm text-slate-700 focus:bg-slate-100 focus:text-slate-950 dark:text-slate-200 dark:focus:bg-white/[0.08] dark:focus:text-white";

export function UserDirectoryActions({
  user,
  canSuspendUsers,
  layout = "desktop",
  onOpenUser,
  onOpenUserAction,
  onOpenDeleteUser,
}: UserDirectoryActionsProps) {
  const isSuspended = user.isSuspended || user.accountStatus === "SUSPENDED";

  const canDeleteUnverifiedUser =
    canSuspendUsers &&
    !user.emailVerified &&
    user.role !== "ADMIN" &&
    user.role !== "SUPER_ADMIN" &&
    !user.isDeleted;

  return (
    <div
      className="inline-flex"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          type="button"
          aria-label={`Actions for ${user.fullName}`}
          title="User actions"
          className={`inline-flex items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 dark:border-white/10 dark:bg-zinc-950 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white ${
            layout === "mobile" ? "size-9" : "size-8"
          }`}
        >
          <Ellipsis className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="w-56 !border-slate-200/80 !bg-none !bg-white/95 !p-1.5 !text-slate-950 !shadow-[0_24px_70px_rgba(15,23,42,0.18)] !ring-0 dark:!border-white/10 dark:!bg-zinc-950/95 dark:!text-white dark:!shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
        >
          <DropdownMenuItem
            onSelect={() => onOpenUser(user)}
            className={menuItemClass}
          >
            <Eye className="size-4 text-slate-500 dark:text-slate-400" />
            View record
          </DropdownMenuItem>

          {canSuspendUsers && !user.isDeleted ? (
            <>
              <DropdownMenuSeparator className="!my-1.5 !bg-slate-200 dark:!bg-white/10" />

              <DropdownMenuItem
                onSelect={() =>
                  onOpenUserAction(user, isSuspended ? "unsuspend" : "suspend")
                }
                className={menuItemClass}
              >
                {isSuspended ? (
                  <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ShieldAlert className="size-4 text-rose-600 dark:text-rose-400" />
                )}

                {isSuspended ? "Unsuspend user" : "Suspend user"}
              </DropdownMenuItem>
            </>
          ) : null}

          {canSuspendUsers && user.isDeleted ? (
            <>
              <DropdownMenuSeparator className="!my-1.5 !bg-slate-200 dark:!bg-white/10" />

              <DropdownMenuItem disabled className={menuItemClass}>
                <ShieldAlert className="size-4" />
                Account deleted
              </DropdownMenuItem>
            </>
          ) : null}

          {canDeleteUnverifiedUser ? (
            <>
              <DropdownMenuSeparator className="!my-1.5 !bg-slate-200 dark:!bg-white/10" />

              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onOpenDeleteUser(user)}
                className="gap-2 rounded-md px-2.5 py-2"
              >
                <Trash2 className="size-4" />
                Delete unverified account
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
