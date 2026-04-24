import { z } from "zod";

export const updateSuperAdminInvestorSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  username: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || ""),
  phoneNumber: z.string().trim().optional(),
  dateOfBirth: z.string().trim().optional(),
  country: z.string().trim().optional(),
  state: z.string().trim().optional(),
  city: z.string().trim().optional(),
  addressLine1: z.string().trim().optional(),
  kycStatus: z.enum(["NOT_STARTED", "PENDING_REVIEW", "VERIFIED", "REJECTED"]),
  isVerified: z.boolean(),
});
