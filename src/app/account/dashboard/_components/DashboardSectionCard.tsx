import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "./dashboardSurfaces";

type DashboardSectionCardProps = HTMLAttributes<HTMLElement>;

export function DashboardSectionCard({
  className,
  ...props
}: DashboardSectionCardProps) {
  return (
    <section
      className={cn(
        DASHBOARD_PAGE_SURFACE_CLASS,
        "p-6 sm:p-8",
        className,
      )}
      {...props}
    />
  );
}
