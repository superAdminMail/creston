import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteSeoConfig();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: site.siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${site.siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${site.siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${site.siteUrl}/compliance`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.55,
    },
    {
      url: `${site.siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${site.siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${site.siteUrl}/testimonial`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${site.siteUrl}/investment-plans`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];

  const investmentPlans = await prisma.investmentPlan.findMany({
    where: {
      isActive: true,
      investment: {
        isActive: true,
      },
    },
    select: { slug: true, updatedAt: true },
  });

  const planRoutes: MetadataRoute.Sitemap = investmentPlans.map((plan) => ({
    url: `${site.siteUrl}/investment-plans/${plan.slug}`,
    lastModified: plan.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...planRoutes];
}
