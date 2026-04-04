"use server";

import { prisma } from "@/lib/prisma";
import {
  SiteConfigurationInput,
  siteConfigurationSchema,
} from "@/lib/zodValidations/site-configuration";
import { revalidatePath } from "next/cache";

// CREATE OR UPDATE (singleton pattern)
export async function upsertSiteConfiguration(data: SiteConfigurationInput) {
  const parsed = siteConfigurationSchema.parse(data);

  const existing = await prisma.siteConfiguration.findFirst();

  if (existing) {
    await prisma.siteConfiguration.update({
      where: { id: existing.id },
      data: parsed,
    });
  } else {
    await prisma.siteConfiguration.create({
      data: parsed,
    });
  }

  revalidatePath("/account/dashboard/super-admin/site-config");
}

// GET
export async function getSiteConfiguration() {
  return prisma.siteConfiguration.findFirst({
    include: {
      defaultOgImageFileAsset: true,
    },
  });
}

// DELETE (rare but useful)
export async function deleteSiteConfiguration() {
  const existing = await prisma.siteConfiguration.findFirst();

  if (!existing) return;

  await prisma.siteConfiguration.delete({
    where: { id: existing.id },
  });

  revalidatePath("/account/dashboard/super-admin/site-config");
}
