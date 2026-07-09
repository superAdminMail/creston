"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { DASHBOARD_PAGE_SHELL_CLASS } from "./dashboardSurfaces";

type DashboardRouteShellProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardRouteShell({
  children,
  className,
}: DashboardRouteShellProps) {
  const pathname = usePathname();
  const isSupportDetailRoute =
    pathname.startsWith("/account/dashboard/user/support/") &&
    pathname !== "/account/dashboard/user/support";

  if (isSupportDetailRoute) {
    return <div className={cn("w-full", className)}>{children}</div>;
  }

  return (
    <div
      className={cn(
        DASHBOARD_PAGE_SHELL_CLASS,
        "space-y-5 rounded-[2rem] border border-slate-200/80 px-4 py-6 md:px-6 lg:px-8 dark:border-white/10",
        className,
      )}
    >
      {children}
    </div>
  );
}
