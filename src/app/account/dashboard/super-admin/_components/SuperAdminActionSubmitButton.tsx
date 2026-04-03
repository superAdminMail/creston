"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SuperAdminActionSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  variant?: "default" | "outline" | "destructive";
  className?: string;
  disabled?: boolean;
};

export function SuperAdminActionSubmitButton({
  idleLabel,
  pendingLabel,
  variant = "outline",
  className,
  disabled = false,
}: SuperAdminActionSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      className={cn(className)}
      disabled={disabled || pending}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
