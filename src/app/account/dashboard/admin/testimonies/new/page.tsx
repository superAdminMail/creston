import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { createTestimony } from "@/actions/admin/testimonies/createTestimony";
import { TestimonyForm } from "../_components/TestimonyForm";

export default async function NewTestimonyPage() {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  return (
    <TestimonyForm
      mode="create"
      formAction={createTestimony}
      defaultValues={{
        fullName: "",
        roleOrTitle: "CLIENT",
        message: "",
        rating: "",
        status: "DRAFT",
        avatarFileId: "",
        sortOrder: "0",
        isFeatured: false,
      }}
    />
  );
}
