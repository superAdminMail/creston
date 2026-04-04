export type ManagementFormActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialManagementFormState: ManagementFormActionState = {
  status: "idle",
};
