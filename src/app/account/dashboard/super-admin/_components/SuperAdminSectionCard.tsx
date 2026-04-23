import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
        "rounded-[1.75rem] border-slate-200/80 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]",
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
