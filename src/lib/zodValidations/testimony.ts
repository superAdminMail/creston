import { z } from "zod";

export const testimonyStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  });

export const testimonySchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  roleOrTitle: optionalTrimmedString,
  message: z.string().trim().min(1, "Testimony message is required."),
  rating: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce
      .number()
      .int()
      .min(1, "Rating must be at least 1.")
      .max(5, "Rating cannot exceed 5.")
      .optional(),
  )
    .transform((value) => {
      if (value === undefined || value === null) {
        return null;
      }

      return value;
    }),
  isFeatured: z.boolean().default(false),
  status: testimonyStatusSchema.default("DRAFT"),
  avatarFileId: optionalTrimmedString,
  sortOrder: z.coerce.number().int().default(0),
});

export type TestimonyFormInput = z.infer<typeof testimonySchema>;

export const updateTestimonySchema = testimonySchema.extend({
  testimonyId: z.string().trim().min(1, "Missing testimony id."),
});

export type UpdateTestimonyFormInput = z.infer<typeof updateTestimonySchema>;

export function normalizeTestimonyValues(values: TestimonyFormInput) {
  return {
    fullName: values.fullName.trim(),
    roleOrTitle: values.roleOrTitle,
    message: values.message.trim(),
    rating: values.rating,
    isFeatured: values.isFeatured ?? false,
    status: values.status,
    avatarFileId: values.avatarFileId,
    sortOrder: values.sortOrder ?? 0,
    publishedAt: values.status === "PUBLISHED" ? new Date() : null,
  };
}
