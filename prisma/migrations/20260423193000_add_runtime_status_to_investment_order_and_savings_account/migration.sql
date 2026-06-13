-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'RuntimeStatus'
  ) THEN
    CREATE TYPE "RuntimeStatus" AS ENUM ('NOT_STARTED', 'ONGOING', 'PAUSED', 'COMPLETED');
  END IF;
END $$;

-- AlterTable
ALTER TABLE "investment_order"
ADD COLUMN IF NOT EXISTS "runtimeStatus" "RuntimeStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- AlterTable
ALTER TABLE "savings_account"
ADD COLUMN IF NOT EXISTS "runtimeStatus" "RuntimeStatus" NOT NULL DEFAULT 'NOT_STARTED';
