import { z } from "zod";

export const updateSuperAdminSavingsAccountSchema = z.object({
  name: z.string().trim().min(1, "Account name is required."),
  description: z.string().trim().optional(),
  targetAmount: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "CLOSED"]),
  isLocked: z.boolean(),
  lockedUntil: z.string().trim().optional(),
});

