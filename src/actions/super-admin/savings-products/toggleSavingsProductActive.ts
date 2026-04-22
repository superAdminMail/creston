"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit/logAuditEvent";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";

export async function toggleSavingsProductActive(savingsProductId: string) {
  const { userId } = await requireSuperAdminAccess();

  const product = await prisma.savingsProduct.findUnique({
    where: { id: savingsProductId },
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  });

  if (!product) {
    throw new Error("Savings product not found.");
  }

  const nextIsActive = !product.isActive;

  await prisma.savingsProduct.update({
    where: { id: savingsProductId },
    data: {
      isActive: nextIsActive,
    },
  });

  await logAuditEvent({
    actorUserId: userId,
    action: "savings-product.toggled-active",
    entityType: "SavingsProduct",
    entityId: savingsProductId,
    description: `${nextIsActive ? "Activated" : "Deactivated"} savings product ${product.name}.`,
    metadata: {
      previousIsActive: product.isActive,
      nextIsActive,
    },
  });

  revalidatePath("/account/dashboard/super-admin/savings-products");
  revalidatePath(`/account/dashboard/super-admin/savings-products/${savingsProductId}`);
}
