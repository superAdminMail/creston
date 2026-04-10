import { Prisma } from "@/generated/prisma";

export type FormFieldErrors<TField extends string = string> = Partial<
  Record<TField, string[]>
>;

export type FormActionState<TField extends string = string> = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FormFieldErrors<TField>;
};

export function createInitialFormState<TField extends string = string>(): FormActionState<TField> {
  return {
    status: "idle",
  };
}

export function createErrorFormState<TField extends string = string>(
  message: string,
  fieldErrors?: FormFieldErrors<TField>,
): FormActionState<TField> {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

export function createSuccessFormState<TField extends string = string>(
  message: string,
): FormActionState<TField> {
  return {
    status: "success",
    message,
  };
}

export function createValidationErrorState<TField extends string = string>(
  fieldErrors: FormFieldErrors<TField>,
  message = "Please review the highlighted fields.",
): FormActionState<TField> {
  return createErrorFormState(message, fieldErrors);
}

export function getFriendlyServerError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return "A record with one of those values already exists.";
      case "P2003":
        return "This record is linked to data that could not be resolved.";
      case "P2025":
        return "The requested record could not be found.";
      default:
        return fallback;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
