import { z } from "zod";

export const rejectSavingsTransactionPaymentSchema = z.object({
  paymentId: z.string().min(1),
  rejectionReason: z.string().trim().min(1).max(500),
  reviewNote: z.string().trim().max(500).optional(),
});

