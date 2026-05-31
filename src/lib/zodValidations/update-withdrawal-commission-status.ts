import { z } from "zod";

import { CommissionStatus } from "@/generated/prisma";

export const updateWithdrawalCommissionStatusSchema = z.object({
  withdrawalId: z.string().min(1, "Withdrawal id is required."),
  status: z.nativeEnum(CommissionStatus),
});
