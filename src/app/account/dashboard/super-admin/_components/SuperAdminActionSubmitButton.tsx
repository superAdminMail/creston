"use client";

import { DashboardActionSubmitButton } from "../../_components/DashboardActionSubmitButton";

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
  return (
    <DashboardActionSubmitButton
      idleLabel={idleLabel}
      pendingLabel={pendingLabel}
      variant={variant}
      className={className}
      disabled={disabled}
    />
  );
}
