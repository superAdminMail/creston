import z from "zod";

export const supportFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email"),
  issueType: z.enum(
    [
      "payments",
      "technical_issues",
      "investment_inquiries",
      "account_issues",
      "other",
    ],
    "Please select an issue type",
  ),
  referenceId: z.string().optional(),
  message: z
    .string()
    .min(10, "Please describe your issue, minimum 10 characters required."),
});

export type SupportFormValues = z.infer<typeof supportFormSchema>;

export const supportConversationSchema = z.object({
  subject: z.string().trim().min(3).max(120).optional(),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters.")
    .max(4000, "Message is too long."),
});

export type SupportConversationValues = z.infer<
  typeof supportConversationSchema
>;
