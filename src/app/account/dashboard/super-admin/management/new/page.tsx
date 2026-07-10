import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { ManagementForm } from "../../_components/ManagementForm";

export default async function CreateManagementPage() {
  await requireSuperAdminAccess();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
          New management profile
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Add a new management profile to be displayed on the public-facing
          website.
        </p>
      </div>

      <ManagementForm />
    </div>
  );
}
