import { z } from "zod";

export const rejectWithdrawalOrderSchema = z.object({
  withdrawalId: z.string().min(1),
  rejectionReason: z.string().trim().min(1).max(500),
});
