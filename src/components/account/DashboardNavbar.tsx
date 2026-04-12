"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, Menu, Settings, User2 } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";

import {
  getDashboardMenu,
  type DashboardRole,
} from "@/constants/dashboard-menu";
import type { ProfileImage } from "@/lib/types";
import { getDashboardHomeByRole } from "@/lib/auth/dashboard-home";
import { cn } from "@/lib/utils";
import NotificationMenu from "../notifications/NotificationMenu";

type DashboardNavbarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  profileAvatar?: ProfileImage | null;
  role: DashboardRole;
};

type DashboardNavbarProps = {
  user: DashboardNavbarUser;
  siteName: string;
  siteLogoUrl?: string | null;
  onMenuClick?: () => void;
  onLogout?: () => void;
  isSigningOut?: boolean;
};

export function getRoleLabel(role: DashboardRole) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "ADMIN":
      return "Admin";
    case "MODERATOR":
      return "Moderator";
    default:
      return "Client";
  }
}

function getPageTitle(pathname: string, role: DashboardRole) {
  const base = getDashboardHomeByRole(role);

  if (pathname === base) return "Dashboard";

  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "dashboard";

  return last
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function DashboardNavbar({
  user,
  siteName,
  siteLogoUrl,
  onMenuClick,
  onLogout,
  isSigningOut = false,
}: DashboardNavbarProps) {
  const pathname = usePathname();
  const avatarFallback =
    user.name?.trim()?.charAt(0) || user.email?.trim()?.charAt(0) || "H";
  const roleLabel = getRoleLabel(user.role);
  const pageTitle = getPageTitle(pathname, user.role);
  const dashboardHome = getDashboardHomeByRole(user.role);
  const avatarUrl = user.profileAvatar?.url || user.image || null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/78 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-[#08111d]/76"
    >
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="rounded-2xl border border-slate-200 bg-white/80 text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 md:hidden dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white"
            aria-label="Open account navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link
            href={dashboardHome}
            className="flex min-w-0 items-center gap-3 rounded-[1.35rem] px-1.5 py-1 transition-colors hover:bg-slate-100/80 dark:hover:bg-white/[0.04]"
          >
            {/* <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-[linear-gradient(135deg,rgba(14,165,233,0.16),rgba(96,165,250,0.08))] text-sky-700 shadow-[0_12px_28px_rgba(14,165,233,0.12)] dark:border-sky-400/20 dark:bg-[linear-gradient(135deg,rgba(56,189,248,0.18),rgba(96,165,250,0.08))] dark:text-sky-200 dark:shadow-[0_14px_28px_rgba(14,165,233,0.16)]">
              <span className="text-sm font-semibold tracking-[0.18em]">
             C
              </span>
            </span> */}
            <div className="flex h-10 w-10 items-center justify-center rounded-[1.35rem] border border-white/12 bg-[linear-gradient(145deg,rgba(37,99,235,0.2),rgba(59,130,246,0.06))] shadow-[0_14px_40px_rgba(37,99,235,0.18)]">
              {siteLogoUrl ? (
                <img
                  src={siteLogoUrl}
                  alt={`${siteName} logo`}
                  className="h-9 w-9 rounded-2xl object-cover"
                />
              ) : (
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-900 dark:text-white">
                  {siteName.slice(0, 1)}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-wide text-slate-950 dark:text-white">
                {siteName}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {pageTitle}
                </p>
                <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block dark:bg-slate-600" />
                <span className="hidden rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700 sm:inline-flex dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
                  {roleLabel}
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-2xl border border-slate-200 bg-white/80 text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-white/15 dark:hover:bg-white/[0.08] dark:hover:text-white dark:hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Button> */}

          <NotificationMenu />

          <Menubar className="h-auto border-0 bg-transparent p-0 shadow-none">
            <MenubarMenu>
              <MenubarTrigger
                className={cn(
                  "rounded-2xl bg-transparent p-0 text-slate-700 transition-all duration-200 hover:bg-transparent hover:text-slate-950 data-[state=open]:bg-transparent data-[state=open]:text-slate-950 dark:text-slate-200 dark:hover:bg-transparent dark:hover:text-white dark:data-[state=open]:bg-transparent dark:data-[state=open]:text-white",
                )}
                aria-label="Open account menu"
              >
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={user.name ?? "User avatar"}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-white/10"
                    />
                  ) : (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sm font-semibold uppercase text-sky-700 ring-1 ring-sky-200 dark:bg-sky-400/12 dark:text-sky-200 dark:ring-sky-400/20">
                      {avatarFallback}
                    </span>
                  )}
                </div>
              </MenubarTrigger>

              <MenubarContent
                align="end"
                sideOffset={14}
                className="w-[min(20rem,calc(100vw-1.5rem))] min-w-[15.5rem] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200/80 bg-white/96 p-2 text-slate-950 shadow-[0_22px_54px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1728]/96 dark:text-white dark:shadow-[0_22px_54px_rgba(0,0,0,0.32)] sm:w-[18rem]"
              >
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <MenubarLabel className="px-3 py-3 font-normal">
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={user.name ?? "User avatar"}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-white/10"
                        />
                      ) : (
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sm font-semibold uppercase text-sky-700 ring-1 ring-sky-200 dark:bg-sky-400/12 dark:text-sky-200 dark:ring-sky-400/20">
                          {avatarFallback}
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">
                          {user.name || "Unnamed User"}
                        </p>
                        <p className="mt-1 break-all text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                          {user.email}
                        </p>
                        <div className="mt-2.5 inline-flex rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
                          {roleLabel}
                        </div>
                      </div>
                    </div>
                  </MenubarLabel>

                  <MenubarSeparator className="my-1.5 bg-slate-200 dark:bg-white/10" />

                  <MenubarItem
                    asChild
                    className="rounded-xl px-3 py-3 text-slate-700 dark:text-slate-200"
                  >
                    <Link
                      href={`${dashboardHome}/profile`}
                      className="flex items-center gap-3"
                    >
                      <User2 className="h-4 w-4" />
                      Profile
                    </Link>
                  </MenubarItem>

                  <MenubarItem
                    asChild
                    className="rounded-xl px-3 py-3 text-slate-700 dark:text-slate-200"
                  >
                    <Link
                      href={`${dashboardHome}/settings`}
                      className="flex items-center gap-3"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </MenubarItem>

                  <MenubarSeparator className="my-1.5 bg-slate-200 dark:bg-white/10" />

                  <MenubarItem
                    onClick={onLogout}
                    disabled={isSigningOut}
                    variant="destructive"
                    className="rounded-xl px-3 py-3 disabled:pointer-events-none disabled:opacity-60"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    {isSigningOut ? "Signing out..." : "Logout"}
                  </MenubarItem>
                </motion.div>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </div>
    </motion.nav>
  );
}
