import type { FormActionState } from "@/lib/forms/actionState";
import { createInitialFormState } from "@/lib/forms/actionState";

export type ManagementFieldName =
  | "name"
  | "title"
  | "role"
  | "email"
  | "phone"
  | "bio"
  | "photoFileId"
  | "isActive"
  | "sortOrder";

export type ManagementFormActionState = FormActionState<ManagementFieldName>;

export const initialManagementFormState: ManagementFormActionState =
  createInitialFormState();
