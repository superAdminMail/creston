-- AlterTable
ALTER TABLE "site_configuration"
ADD COLUMN IF NOT EXISTS "supportPhoneSecondary" TEXT;
