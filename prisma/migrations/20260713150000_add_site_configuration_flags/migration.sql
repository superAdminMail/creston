-- AlterTable
ALTER TABLE "site_configuration"
ADD COLUMN IF NOT EXISTS "maintenanceModeEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "disclaimerBannerEnabled" BOOLEAN NOT NULL DEFAULT false;
