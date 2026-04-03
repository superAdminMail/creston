import z from "zod";

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
