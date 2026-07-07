"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardActionSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  variant?: ComponentProps<typeof Button>["variant"];
  className?: string;
  disabled?: boolean;
  pendingIcon?: ReactNode;
};

export function DashboardActionSubmitButton({
  idleLabel,
  pendingLabel,
  variant = "default",
  className,
  disabled = false,
  pendingIcon,
}: DashboardActionSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      className={cn(className)}
      disabled={disabled || pending}
    >
      {pending ? (
        pendingIcon ? (
          <span className="inline-flex items-center gap-2">
            {pendingIcon}
            {pendingLabel}
          </span>
        ) : (
          pendingLabel
        )
      ) : (
        idleLabel
      )}
    </Button>
  );
}
