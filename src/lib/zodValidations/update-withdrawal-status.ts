import { z } from "zod";

import { WithdrawalStatus } from "@/generated/prisma";
import { requiresWithdrawalStatusReason } from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";

export const updateWithdrawalStatusSchema = z.object({
  withdrawalId: z.string().min(1, "Withdrawal id is required."),
  status: z.nativeEnum(WithdrawalStatus),
  reason: z.string().trim().optional(),
}).superRefine((data, ctx) => {
  if (requiresWithdrawalStatusReason(data.status) && !data.reason?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["reason"],
      message: "A reason is required for cancellation or rejection.",
    });
  }
});
