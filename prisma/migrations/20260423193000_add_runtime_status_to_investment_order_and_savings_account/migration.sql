-- CreateEnum
CREATE TYPE "RuntimeStatus" AS ENUM ('NOT_STARTED', 'ONGOING', 'PAUSED', 'COMPLETED');

-- AlterTable
ALTER TABLE "investment_order"
ADD COLUMN     "runtimeStatus" "RuntimeStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- AlterTable
ALTER TABLE "savings_account"
ADD COLUMN     "runtimeStatus" "RuntimeStatus" NOT NULL DEFAULT 'NOT_STARTED';
