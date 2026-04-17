"use client";

import { ChevronDown, ChevronRight, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserDTO } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  getBestDashboardMenuMatch,
  getDashboardMenu,
  type DashboardRole,
} from "@/constants/dashboard-menu";

type AccountSidebarContentProps = {
  user?: UserDTO | null;
  siteName: string;
  pathname: string;
  isMobile?: boolean;
  onNavigate?: () => void;
  onLogout?: () => void;
};

export function AccountSidebarContent({
  user,
  siteName,
  pathname,
  isMobile,
  onNavigate,
  onLogout,
}: AccountSidebarContentProps) {
  const role = (user?.role as DashboardRole | undefined) ?? "USER";
  const sections = getDashboardMenu(role);
  const activeMatch = getBestDashboardMenuMatch(pathname, role);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => (activeMatch?.sectionTitle ? { [activeMatch.sectionTitle]: true } : {}),
  );

  const toggle = (title: string) =>
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));

  const isActive = (href: string) => {
    return activeMatch?.link.href === href;
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full",
        isMobile && "dark:bg-neutral-950",
      )}
    >
      <div className="flex-1 overflow-y-auto py-3 space-y-4">
        <p className="font-semibold text-gray-800 uppercase text-[13px] tracking-wide px-6 pb-2">
          {siteName} Account
        </p>
        <Separator />

        <div className="px-4">
          {sections.map((section) => (
            <div key={section.title}>
              <button
                onClick={() => toggle(section.title)}
                className="flex justify-between items-center w-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-black dark:hover:text-gray-600"
              >
                {section.title}
                {openSections[section.title] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              <div
                className={cn(
                  "mx-1 mt-1 space-y-1 overflow-hidden transition-all",
                  (openSections[section.title] ||
                    section.title === activeMatch?.sectionTitle)
                    ? "max-h-96"
                    : "max-h-0",
                )}
              >
                {section.links.map(({ href, icon: Icon, name }) => (
                  <Link
                    key={`${section.title}-${href}`}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 py-3 px-4 rounded-md text-sm font-medium transition",
                      isActive(href)
                        ? "bg-[#3c9ee0]/15 text-[#3c9ee0] border-l-4 border-[#3c9ee0] font-semibold"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => onNavigate?.()}
                  >
                    <Icon className="w-5 h-5" />
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="px-4 mt-2 pb-6">
        {user ? (
          <Button
            variant="secondary"
            className="w-full flex gap-2 text-red-500"
            onClick={() => {
              onLogout?.();
              onNavigate?.();
            }}
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        ) : (
          <Button asChild className="w-full" onClick={() => onNavigate?.()}>
            <Link href="/auth/login">Get Started</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
