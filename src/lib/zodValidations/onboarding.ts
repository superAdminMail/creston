import { z } from "zod";

import { getAgeFromIsoDate } from "@/lib/formatters/age";
import { isValidPhoneInput } from "@/lib/formatters/phone";

export const onboardingSchema = z
  .object({
    countryCallingCode: z
      .string()
      .trim()
      .regex(/^\+\d{1,4}$/, "Enter a valid country code like +1")
      .optional()
      .or(z.literal("")),

    phoneNumber: z
      .string()
      .trim()
      .max(20, "Phone number is too long")
      .optional()
      .or(z.literal("")),

    dateOfBirth: z.string().min(1, "Date of birth is required"),
    confirmAdultAge: z.boolean().default(false),

    country: z.string().trim().min(2, "Country is required"),

    state: z.string().trim().min(2, "State is required"),

    city: z.string().trim().min(2, "City is required"),

    addressLine1: z.string().trim().optional().or(z.literal("")),
    addressLine2: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (!isValidPhoneInput(values)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid phone number in international format.",
        path: ["phoneNumber"],
      });
    }

    const age = getAgeFromIsoDate(values.dateOfBirth);

    if (age === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid date of birth.",
        path: ["dateOfBirth"],
      });
      return;
    }

    if (age < 18) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You must be at least 18 years old to continue.",
        path: ["dateOfBirth"],
      });
    }

    if (!values.confirmAdultAge) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Please confirm that you are ${age} years old.`,
        path: ["confirmAdultAge"],
      });
    }
  });

export type OnboardingSchemaInput = z.input<typeof onboardingSchema>;
export type OnboardingSchemaType = z.output<typeof onboardingSchema>;
