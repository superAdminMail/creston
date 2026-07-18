import type { FormActionState } from "@/lib/forms/actionState";
import { createInitialFormState } from "@/lib/forms/actionState";

export type TestimonyFieldName =
  | "fullName"
  | "roleOrTitle"
  | "message"
  | "rating"
  | "isFeatured"
  | "status"
  | "avatarFileId"
  | "videoFileId"
  | "sortOrder";

export type TestimonyFormActionState = FormActionState<TestimonyFieldName>;

export const initialTestimonyFormState: TestimonyFormActionState =
  createInitialFormState();
