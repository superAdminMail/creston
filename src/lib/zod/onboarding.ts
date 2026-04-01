import { z } from "zod";

export const onboardingSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .optional()
    .or(z.literal("")),

  dateOfBirth: z.string().min(1, "Date of birth is required"),

  country: z.string().trim().min(2, "Country is required"),

  state: z.string().trim().min(2, "State is required"),

  city: z.string().trim().min(2, "City is required"),

  addressLine1: z.string().trim().optional().or(z.literal("")),
  addressLine2: z.string().trim().optional().or(z.literal("")),
});

export type OnboardingSchemaType = z.infer<typeof onboardingSchema>;
