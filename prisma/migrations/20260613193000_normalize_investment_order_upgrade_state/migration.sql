-- CreateEnum
CREATE TYPE "InvestmentOrderPaymentSubmissionKind" AS ENUM ('STANDARD', 'UPGRADE');

-- CreateEnum
CREATE TYPE "InvestmentOrderUpgradeStatus" AS ENUM (
  'DISABLED',
  'AVAILABLE',
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED'
);

-- AlterTable
ALTER TABLE "investment_order"
ADD COLUMN     "upgradeStatus" "InvestmentOrderUpgradeStatus" NOT NULL DEFAULT 'DISABLED',
ADD COLUMN     "upgradeAmount" DECIMAL(18,2),
ADD COLUMN     "upgradePaymentId" TEXT,
ADD COLUMN     "upgradeRequestedAt" TIMESTAMP(3),
ADD COLUMN     "upgradeReviewedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "investment_order_payment"
ADD COLUMN     "submissionKind" "InvestmentOrderPaymentSubmissionKind" NOT NULL DEFAULT 'STANDARD';

-- Backfill legacy upgrade order metadata into the new columns.
UPDATE "investment_order"
SET
  "upgradeStatus" = CASE
    WHEN "paymentMetadata" IS NULL THEN 'DISABLED'::"InvestmentOrderUpgradeStatus"
    WHEN COALESCE(("paymentMetadata"->'upgrade'->>'allowUpgrade')::boolean, false) = false THEN 'DISABLED'::"InvestmentOrderUpgradeStatus"
    WHEN NULLIF("paymentMetadata"->'upgrade'->>'approvedAt', '') IS NOT NULL THEN 'APPROVED'::"InvestmentOrderUpgradeStatus"
    WHEN NULLIF("paymentMetadata"->'upgrade'->>'pendingPaymentId', '') IS NOT NULL THEN 'PENDING_REVIEW'::"InvestmentOrderUpgradeStatus"
    ELSE 'AVAILABLE'::"InvestmentOrderUpgradeStatus"
  END,
  "upgradeAmount" = NULLIF("paymentMetadata"->'upgrade'->>'amount', '')::DECIMAL(18,2),
  "upgradePaymentId" = NULLIF("paymentMetadata"->'upgrade'->>'pendingPaymentId', ''),
  "upgradeRequestedAt" = NULLIF("paymentMetadata"->'upgrade'->>'submittedAt', '')::TIMESTAMP(3),
  "upgradeReviewedAt" = NULLIF("paymentMetadata"->'upgrade'->>'approvedAt', '')::TIMESTAMP(3)
WHERE "paymentMetadata" ? 'upgrade';

UPDATE "investment_order_payment"
SET "submissionKind" =
  CASE
    WHEN COALESCE("metadata"->>'kind', '') = 'UPGRADE'
      THEN 'UPGRADE'::"InvestmentOrderPaymentSubmissionKind"
    ELSE 'STANDARD'::"InvestmentOrderPaymentSubmissionKind"
  END;
