import { z } from "zod";

export const approveSavingsTransactionPaymentSchema = z.object({
  paymentId: z.string().min(1),
  approvedAmount: z.number().positive(),
  approvalMode: z.enum(["FULL", "PARTIAL"]),
  reviewNote: z.string().trim().max(500).optional(),
});

