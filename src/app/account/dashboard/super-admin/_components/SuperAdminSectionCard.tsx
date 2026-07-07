import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "../../_components/dashboardSurfaces";

type SuperAdminSectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export function SuperAdminSectionCard({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  titleClassName,
  descriptionClassName,
}: SuperAdminSectionCardProps) {
  return (
    <Card
      className={cn(
        DASHBOARD_PAGE_SURFACE_CLASS,
        className,
      )}
    >
      <CardHeader className={cn("space-y-2 p-5 sm:p-6", headerClassName)}>
        <CardTitle
          className={cn(
            "text-lg font-semibold text-slate-950 dark:text-white",
            titleClassName,
          )}
        >
          {title}
        </CardTitle>
        {description ? (
          <CardDescription
            className={cn(
              "text-sm leading-6 text-slate-600 dark:text-slate-400",
              descriptionClassName,
            )}
          >
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className={cn("p-5 pt-0 sm:p-6 sm:pt-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
