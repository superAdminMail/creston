import { notFound } from "next/navigation";

import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { prisma } from "@/lib/prisma";
import { updateTestimony } from "@/actions/admin/testimonies/updateTestimony";
import { TestimonyForm } from "../../_components/TestimonyForm";

type PageProps = {
  params: Promise<{
    testimonyId: string;
  }>;
};

export default async function EditTestimonyPage({ params }: PageProps) {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const { testimonyId } = await params;

  const testimony = await prisma.testimony.findUnique({
    where: { id: testimonyId },
    select: {
      id: true,
      fullName: true,
      roleOrTitle: true,
      message: true,
      rating: true,
      isFeatured: true,
      status: true,
      avatarFileId: true,
      sortOrder: true,
      avatarFile: {
        select: {
          url: true,
        },
      },
    },
  });

  if (!testimony) {
    notFound();
  }

  return (
    <TestimonyForm
      mode="edit"
      testimonyId={testimony.id}
      formAction={updateTestimony}
      defaultValues={{
        fullName: testimony.fullName,
        roleOrTitle: testimony.roleOrTitle ?? "",
        message: testimony.message,
        rating: testimony.rating?.toString() ?? "",
        status: testimony.status,
        avatarFileId: testimony.avatarFileId ?? "",
        sortOrder: testimony.sortOrder.toString(),
        isFeatured: testimony.isFeatured,
      }}
      initialAvatarUrl={testimony.avatarFile?.url ?? null}
    />
  );
}
