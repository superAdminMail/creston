"use server";

import { prisma } from "@/lib/prisma";
import { getSiteConfiguration } from "@/lib/site/getSiteConfiguration";
import { SITE_CONFIGURATION_ID } from "@/lib/site/siteConfiguration";
import {
  SiteConfigurationInput,
  siteConfigurationSchema,
} from "@/lib/zodValidations/site-configuration";
import { revalidatePath } from "next/cache";

export async function upsertSiteConfiguration(data: SiteConfigurationInput) {
  const parsed = siteConfigurationSchema.parse(data);
  await prisma.siteConfiguration.upsert({
    where: { id: SITE_CONFIGURATION_ID },
    create: {
      id: SITE_CONFIGURATION_ID,
      ...parsed,
    },
    update: parsed,
  });

  revalidatePath("/account/dashboard/super-admin/site-config");
}

// GET
export async function getSiteConfigurationAction() {
  return getSiteConfiguration();
}

// DELETE (rare but useful)
export async function deleteSiteConfiguration() {
  await prisma.siteConfiguration.deleteMany({
    where: { id: SITE_CONFIGURATION_ID },
  });

  revalidatePath("/account/dashboard/super-admin/site-config");
}
