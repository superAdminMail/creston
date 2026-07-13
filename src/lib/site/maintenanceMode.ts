import { UserRole } from "@/generated/prisma";

import type { AccountAccessState } from "@/lib/auth/accountAccessState";

export function canBypassMaintenanceMode(
  accessState: Pick<NonNullable<AccountAccessState>, "role" | "status"> | null,
) {
  return (
    accessState?.status === "ACTIVE" &&
    accessState.role === UserRole.SUPER_ADMIN
  );
}
