-- Rename the company registration field and add the FCA reference number.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'site_configuration'
      AND column_name = 'siteLLC'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'site_configuration'
      AND column_name = 'siteCRN'
  ) THEN
    EXECUTE 'ALTER TABLE "site_configuration" RENAME COLUMN "siteLLC" TO "siteCRN"';
  END IF;
END $$;

ALTER TABLE "site_configuration"
ADD COLUMN IF NOT EXISTS "siteFRN" TEXT;
