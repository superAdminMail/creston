-- Rename the legacy investment plan penalty window column to match the schema.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'investment_plan'
      AND column_name = 'penaltyFreePeriodDays'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'investment_plan'
      AND column_name = 'penaltyPeriodDays'
  ) THEN
    EXECUTE 'ALTER TABLE "investment_plan" RENAME COLUMN "penaltyFreePeriodDays" TO "penaltyPeriodDays"';
  END IF;
END $$;
