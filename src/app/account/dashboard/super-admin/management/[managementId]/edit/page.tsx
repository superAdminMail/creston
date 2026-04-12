import { notFound } from "next/navigation";

import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { prisma } from "@/lib/prisma";
import { ManagementForm } from "../../../_components/ManagementForm";

type PageProps = {
  params: Promise<{
    managementId: string;
  }>;
};

export default async function UpdateManagementPage({ params }: PageProps) {
  await requireSuperAdminAccess();

  const { managementId } = await params;

  const management = await prisma.management.findUnique({
    where: { id: managementId },
    select: {
      id: true,
      name: true,
      title: true,
      role: true,
      email: true,
      phone: true,
      bio: true,
      photoFileId: true,
      photoFile: {
        select: {
          url: true,
        },
      },
      isActive: true,
      sortOrder: true,
    },
  });

  if (!management) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Edit management profile
        </h1>
        <p className="text-sm text-slate-400">
          Update the public-facing profile details for this team member.
        </p>
      </div>

      <ManagementForm
        mode="edit"
        managementId={management.id}
        defaultValues={{
          name: management.name,
          title: management.title ?? "",
          role: management.role ?? "",
          email: management.email ?? "",
          phone: management.phone ?? "",
          bio: management.bio ?? "",
          photoFileId: management.photoFileId ?? "",
          isActive: management.isActive,
          sortOrder: String(management.sortOrder),
        }}
        initialPhotoUrl={management.photoFile?.url ?? null}
      />
    </div>
  );
}
