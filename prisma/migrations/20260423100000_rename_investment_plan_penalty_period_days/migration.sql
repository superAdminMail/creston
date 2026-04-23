-- Rename the legacy investment plan penalty window column to match the schema.
ALTER TABLE "investment_plan"
  RENAME COLUMN "penaltyFreePeriodDays" TO "penaltyPeriodDays";
