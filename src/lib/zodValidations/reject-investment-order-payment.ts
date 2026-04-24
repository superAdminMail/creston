import { z } from "zod";

export const rejectInvestmentOrderPaymentSchema = z.object({
  paymentId: z.string().min(1),
  rejectionReason: z.string().trim().min(1).max(500),
  reviewNote: z.string().trim().max(500).optional(),
});

