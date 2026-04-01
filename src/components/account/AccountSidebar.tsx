"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { DashboardNavSection } from "@/constants/dashboard-menu";
import { cn } from "@/lib/utils";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AccountAvatar } from "./AccountAvatar";

type AccountSidebarProps = {
  basePath: string;
  navSections: DashboardNavSection[];
  onNavigate?: () => void;
  showAccountIdentity?: boolean;
  userEmail?: string | null;
  userImage?: string | null;
  userName?: string | null;
  variant: "user" | "staff";
};

export function AccountSidebar({
  basePath,
  navSections,
  onNavigate,
  showAccountIdentity = false,
  userEmail,
  userImage,
  userName,
  variant,
}: AccountSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/account/dashboard") {
      return pathname === basePath || pathname.startsWith(`${basePath}/`);
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      aria-label="Dashboard navigation"
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden border p-4",
        variant === "user"
          ? "rounded-[1.6rem] border-white/12 bg-[linear-gradient(180deg,rgba(14,24,45,0.86),rgba(9,17,34,0.96))] shadow-[0_22px_50px_rgba(0,0,0,0.22)]"
          : "rounded-[1.5rem] border-white/10 bg-[linear-gradient(180deg,rgba(8,17,37,0.94),rgba(5,11,31,0.98))]",
      )}
    >
      <SidebarHeader className="shrink-0 gap-4 px-3 pb-5">
        <div>
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-slate-500 uppercase">
            Havenstone
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {variant === "user"
              ? "Client account navigation"
              : "Internal operations navigation"}
          </p>
        </div>

        {showAccountIdentity ? (
          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-3.5 shadow-[0_16px_34px_rgba(0,0,0,0.18)]">
            <div className="flex items-center gap-3">
              <AccountAvatar
                avatarUrl={userImage}
                className="h-11 w-11"
                email={userEmail}
                name={userName}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {userName ?? "Havenstone Client"}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {userEmail ?? "Secure session"}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </SidebarHeader>

      <SidebarContent className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
        {navSections.map((section) => (
          <SidebarGroup key={section.title} className="p-0">
            <SidebarGroupLabel className="px-3 text-[0.68rem] font-semibold tracking-[0.2em] text-slate-500 uppercase">
              {section.title}
            </SidebarGroupLabel>

            <SidebarGroupContent className="mt-2">
              <SidebarMenu className="space-y-1.5">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);

                  return (
                    <SidebarMenuItem key={link.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={cn(
                          "h-auto rounded-2xl px-3 py-2.5 text-sm transition",
                          active
                            ? "border border-blue-400/18 bg-blue-500/10 text-white shadow-[0_8px_24px_rgba(37,99,235,0.14)]"
                            : "border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100",
                        )}
                      >
                        <Link
                          href={link.href}
                          onClick={onNavigate}
                          aria-current={active ? "page" : undefined}
                          className="flex items-center gap-3"
                        >
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition",
                              active
                                ? "border-blue-400/20 bg-blue-500/12 text-blue-200"
                                : "border-white/8 bg-white/[0.03] text-slate-500",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1 truncate">
                            {link.name}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </nav>
  );
}
