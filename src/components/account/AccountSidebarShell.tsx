"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import {
  getBestDashboardMenuMatch,
  getDashboardMenu,
  type DashboardRole,
} from "@/constants/dashboard-menu";
import { getUserInitials } from "@/lib/User-Initials/user";
import { cn } from "@/lib/utils";
import { type ProfileDTO, type UserDTO } from "@/lib/types";
import { useCurrentUserQuery } from "@/stores/useCurrentUserQuery";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { getRoleLabel } from "./DashboardNavbar.client";

type SidebarUser = UserDTO | ProfileDTO | null | undefined;

type SidebarBodyProps = {
  user: SidebarUser;
  siteName: string;
  pathname: string;
  isMobile?: boolean;
  onNavigate?: () => void;
  onLogout?: () => void;
  isSigningOut?: boolean;
};

const sidebarShellClasses =
  "h-full overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/88 text-slate-950 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))] dark:text-slate-100 dark:shadow-[0_28px_60px_rgba(0,0,0,0.34)]";

function getActiveSectionTitle(
  pathname: string,
  role: DashboardRole,
): string | null {
  return getBestDashboardMenuMatch(pathname, role)?.sectionTitle ?? null;
}

function AccountIdentity({ user }: { user: SidebarUser }) {
  if (!user) return null;
  const roleLabel = getRoleLabel(user.role);
  const avatarUrl = user?.profileAvatar?.url || user?.image || null;
  const avatarFallback = getUserInitials(user);

  return (
    <div className="flex items-center gap-3 rounded-[1.35rem] border border-slate-200/80 bg-white/75 px-3 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <Avatar className="h-10 w-10 rounded-2xl ring-1 ring-slate-200/80 dark:ring-white/10">
        <AvatarImage
          src={avatarUrl ?? undefined}
          alt={user?.name ?? "User avatar"}
          className="rounded-2xl object-cover"
        />
        <AvatarFallback className="rounded-2xl bg-sky-100 text-xs font-semibold uppercase text-sky-700 dark:bg-sky-500/12 dark:text-sky-200">
          {avatarFallback}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
          {user?.name || user?.username || "My Account"}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {user?.email}
        </p>
        <div className="mt-2.5 inline-flex rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
          {roleLabel}
        </div>
      </div>
    </div>
  );
}

function SidebarBody({
  user,
  siteName,
  pathname,
  isMobile,
  onNavigate,
  onLogout,
  isSigningOut = false,
}: SidebarBodyProps) {
  const role = (user?.role as DashboardRole | undefined) ?? "USER";
  const sections = useMemo(() => getDashboardMenu(role), [role]);
  const activeSectionTitle = useMemo(
    () => getActiveSectionTitle(pathname, role),
    [pathname, role],
  );
  const defaultOpenTitle = activeSectionTitle ?? sections[0]?.title ?? null;
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => (defaultOpenTitle ? { [defaultOpenTitle]: true } : {}),
  );

  const handleToggle = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !(prev[title] ?? title === defaultOpenTitle),
    }));
  };

  const isLinkActive = (href: string) => {
    const bestMatch = getBestDashboardMenuMatch(pathname, role);
    return bestMatch?.link.href === href;
  };

  return (
    <div
      className={cn(
        sidebarShellClasses,
        isMobile && "rounded-none border-none shadow-none dark:bg-transparent",
      )}
    >
      <Sidebar collapsible="none" className="h-full border-0 bg-transparent">
        <SidebarHeader className="gap-3 p-3 pb-2">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {isMobile ? (
              <AccountIdentity user={user} />
            ) : (
              <div className="rounded-[1.35rem] border border-slate-200/80 bg-white/75 px-3 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  {siteName}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Account Workspace
                </p>
              </div>
            )}
          </motion.div>
        </SidebarHeader>

        <SidebarSeparator className="mx-3 bg-slate-200/80 dark:bg-white/10" />

            <SidebarContent className="px-2 py-3">
              {sections.map((section, index) => {
                const isOpen =
                  openSections[section.title] ??
                  (section.title === defaultOpenTitle ||
                    section.title === activeSectionTitle);

            return (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.22,
                  ease: "easeOut",
                  delay: index * 0.04,
                }}
                className="mb-2"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(section.title)}
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 transition-colors hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-slate-100"
                >
                  <span>{section.title}</span>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <SidebarMenu className="gap-1.5 px-1 pt-1">
                        {section.links.map(({ href, icon: Icon, name }) => {
                          const active = isLinkActive(href);

                          return (
                            <SidebarMenuItem key={`${section.title}-${href}`}>
                              <SidebarMenuButton
                                asChild
                                isActive={active}
                                className={cn(
                                  "h-12 rounded-2xl border px-3 transition-all duration-200",
                                  active
                                    ? "border-sky-200 bg-sky-50 text-slate-950 shadow-[0_12px_28px_rgba(14,165,233,0.10)] dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-white"
                                    : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-950 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/[0.05] dark:hover:text-white",
                                )}
                              >
                                <Link href={href} onClick={onNavigate}>
                                  <span
                                    className={cn(
                                      "flex h-9 w-9 items-center justify-center rounded-2xl ring-1 transition-colors",
                                      active
                                        ? "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-400/12 dark:text-sky-200 dark:ring-sky-400/20"
                                        : "bg-slate-100 text-slate-500 ring-slate-200 dark:bg-white/[0.05] dark:text-slate-400 dark:ring-white/10",
                                    )}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </span>
                                  <span className="truncate">{name}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </SidebarContent>

        <SidebarSeparator className="mx-3 bg-slate-200/80 dark:bg-white/10" />

        <SidebarFooter className="gap-3 p-3 pt-2">
          {!isMobile ? <AccountIdentity user={user} /> : null}

          <Button
            variant="outline"
            type="button"
            disabled={isSigningOut}
            className="h-11 w-full justify-center gap-2 rounded-2xl border-slate-200 bg-white text-red-600 shadow-sm transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-red-300 dark:hover:bg-red-500/10 dark:hover:text-red-200"
            onClick={() => {
              onLogout?.();
              onNavigate?.();
            }}
          >
            <LogOut className="h-4 w-4" />
            {isSigningOut ? "Signing out..." : "Logout"}
          </Button>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}

export const AccountSidebarShell = ({
  initialUser,
  siteName,
  onLogout,
  isSigningOut,
}: {
  initialUser: UserDTO | ProfileDTO | null;
  siteName: string;
  onLogout?: () => void;
  isSigningOut?: boolean;
}) => {
  const { data: user } = useCurrentUserQuery(initialUser);
  const pathname = usePathname();

  return (
    <SidebarBody
      user={user}
      siteName={siteName}
      pathname={pathname}
      onLogout={onLogout}
      isSigningOut={isSigningOut}
    />
  );
};

export const AccountMobileSideNavShell = ({
  initialUser,
  siteName,
  onNavigate,
  onLogout,
  isSigningOut,
}: {
  initialUser: UserDTO | ProfileDTO | null;
  siteName: string;
  onNavigate?: () => void;
  onLogout?: () => void;
  isSigningOut?: boolean;
}) => {
  const { data: user } = useCurrentUserQuery(initialUser);
  const pathname = usePathname();

  return (
    <SidebarBody
      user={user}
      siteName={siteName}
      pathname={pathname}
      isMobile
      onNavigate={onNavigate}
      onLogout={onLogout}
      isSigningOut={isSigningOut}
    />
  );
};
