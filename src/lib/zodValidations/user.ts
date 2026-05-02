import z from "zod";

export const fileSchema = z.object({
  url: z.string().url(),
  key: z.string(),
});

//register a user
export const registerUserSchema = z.object({
  email: z.string().email("Invalid email address").min(5, "Email too short"),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/^(?=.*[A-Z])(?=.*\d)/, {
      message:
        "Password must contain at least one uppercase letter and one number.",
    }),
  referralCode: z
    .string()
    .trim()
    .max(64, { message: "Referral code is too long." })
    .optional(),
});

export type RegisterUserSchemaType = z.infer<typeof registerUserSchema>;

//login a user
export const loginUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});
export type loginUserSchemaType = z.infer<typeof loginUserSchema>;

export const updateUserSchema = z.object({
  name: z
    .string({ message: "name must be a string." })
    .min(2, { message: "name must be at least 2 characters." })
    .optional(),

  profileAvatar: fileSchema.nullable().optional(),

  username: z
    .string({ message: "Username must be a string." })
    .min(2, { message: "Username must be at least 2 characters." })
    .optional(),
});

export type updateUserSchemaType = z.infer<typeof updateUserSchema>;
