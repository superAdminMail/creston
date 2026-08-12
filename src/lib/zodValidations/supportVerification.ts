import z from "zod";

export const createSupportVerificationSchema = z.object({
  userId: z.string().trim().min(1, "A customer must be selected."),

  representativeName: z
    .string()
    .trim()
    .min(2, "Representative name is required.")
    .max(100, "Representative name is too long."),

  department: z
    .string()
    .trim()
    .min(2, "Department is required.")
    .max(100, "Department is too long."),

  reason: z
    .string()
    .trim()
    .min(5, "A reason is required.")
    .max(500, "Reason is too long."),

  expiresAt: z.string().trim().optional(),
});

export type CreateSupportVerificationInput = z.infer<
  typeof createSupportVerificationSchema
>;
