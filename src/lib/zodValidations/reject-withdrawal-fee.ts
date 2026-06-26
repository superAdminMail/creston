import { z } from "zod";

export const rejectWithdrawalFeeSchema = z.object({
  withdrawalId: z.string().min(1),
  rejectionReason: z.string().trim().min(1).max(500),
  reviewNote: z.string().trim().max(500).optional(),
});
