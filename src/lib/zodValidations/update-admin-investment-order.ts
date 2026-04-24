import { z } from "zod";

import { InvestmentOrderStatus } from "@/generated/prisma";

export const updateAdminInvestmentOrderSchema = z.object({
  orderId: z.string().trim().min(1, "Order is required."),
  status: z.nativeEnum(InvestmentOrderStatus),
  paymentReference: z
    .string()
    .trim()
    .max(120, "Reference is too long.")
    .optional()
    .or(z.literal("")),
  adminNotes: z
    .string()
    .trim()
    .max(500, "Admin notes must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
  cancellationReason: z
    .string()
    .trim()
    .max(500, "Cancellation reason must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

