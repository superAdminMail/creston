"use client";

import type * as React from "react";

import { DrawerContent } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

export type DrawerSurfaceTone = "light" | "dark" | "ghost";

const drawerSurfaceToneClassNames: Record<DrawerSurfaceTone, string> = {
  light:
    "z-[70] border-border/60 bg-white/96 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-950/96 dark:text-white",
  dark:
    "z-[70] border-white/10 bg-slate-950/96 text-white shadow-[0_24px_70px_rgba(15,23,42,0.36)]",
  ghost:
    "z-[70] border-transparent bg-transparent p-0 text-slate-950 shadow-none dark:text-white",
};

type DrawerSurfaceProps = React.ComponentProps<typeof DrawerContent> & {
  tone?: DrawerSurfaceTone;
};

export function DrawerSurface({
  tone = "light",
  className,
  ...props
}: DrawerSurfaceProps) {
  return (
    <DrawerContent
      className={cn(drawerSurfaceToneClassNames[tone], className)}
      {...props}
    />
  );
}
