-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'WithdrawalAllocationSourceType'
  ) THEN
    CREATE TYPE "WithdrawalAllocationSourceType" AS ENUM (
      'INVESTMENT_ORDER',
      'SAVINGS_ACCOUNT'
    );
  END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "withdrawal_order_allocation" (
  "id" TEXT NOT NULL,
  "withdrawalOrderId" TEXT NOT NULL,
  "sourceType" "WithdrawalAllocationSourceType" NOT NULL,
  "sourceId" TEXT NOT NULL,
  "sourceLabel" TEXT,
  "sourceGrossAmount" DECIMAL(18,2) NOT NULL,
  "sourcePenaltyAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "sourceNetAmount" DECIMAL(18,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "investmentOrderId" TEXT,
  "savingsAccountId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "withdrawal_order_allocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "withdrawal_order_allocation_withdrawalOrderId_idx"
  ON "withdrawal_order_allocation"("withdrawalOrderId");

CREATE INDEX IF NOT EXISTS "withdrawal_order_allocation_sourceType_sourceId_idx"
  ON "withdrawal_order_allocation"("sourceType", "sourceId");

CREATE INDEX IF NOT EXISTS "withdrawal_order_allocation_investmentOrderId_idx"
  ON "withdrawal_order_allocation"("investmentOrderId");

CREATE INDEX IF NOT EXISTS "withdrawal_order_allocation_savingsAccountId_idx"
  ON "withdrawal_order_allocation"("savingsAccountId");

-- AddForeignKey
ALTER TABLE "withdrawal_order_allocation"
  ADD CONSTRAINT "withdrawal_order_allocation_withdrawalOrderId_fkey"
  FOREIGN KEY ("withdrawalOrderId")
  REFERENCES "withdrawal_order"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "withdrawal_order_allocation"
  ADD CONSTRAINT "withdrawal_order_allocation_investmentOrderId_fkey"
  FOREIGN KEY ("investmentOrderId")
  REFERENCES "investment_order"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "withdrawal_order_allocation"
  ADD CONSTRAINT "withdrawal_order_allocation_savingsAccountId_fkey"
  FOREIGN KEY ("savingsAccountId")
  REFERENCES "savings_account"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Backfill completed investment withdrawals into the allocation ledger.
INSERT INTO "withdrawal_order_allocation" (
  "id",
  "withdrawalOrderId",
  "sourceType",
  "sourceId",
  "sourceLabel",
  "sourceGrossAmount",
  "sourcePenaltyAmount",
  "sourceNetAmount",
  "currency",
  "investmentOrderId",
  "savingsAccountId",
  "createdAt"
)
SELECT
  CONCAT('walloc_', w."id") AS "id",
  w."id" AS "withdrawalOrderId",
  'INVESTMENT_ORDER'::"WithdrawalAllocationSourceType" AS "sourceType",
  w."investmentOrderId" AS "sourceId",
  COALESCE(ip."name", 'Investment order') AS "sourceLabel",
  COALESCE(
    NULLIF((w."payoutSnapshot"->>'requestedAmount'), '')::DECIMAL(18,2),
    w."amount"
  ) AS "sourceGrossAmount",
  GREATEST(
    COALESCE(
      NULLIF((w."payoutSnapshot"->>'requestedAmount'), '')::DECIMAL(18,2),
      w."amount"
    ) - COALESCE(
      NULLIF((w."payoutSnapshot"->>'netPayoutAmount'), '')::DECIMAL(18,2),
      w."amount"
    ),
    0
  ) AS "sourcePenaltyAmount",
  COALESCE(
    NULLIF((w."payoutSnapshot"->>'netPayoutAmount'), '')::DECIMAL(18,2),
    w."amount"
  ) AS "sourceNetAmount",
  w."currency" AS "currency",
  w."investmentOrderId" AS "investmentOrderId",
  NULL AS "savingsAccountId",
  w."createdAt" AS "createdAt"
FROM "withdrawal_order" w
LEFT JOIN "investment_order" io ON io."id" = w."investmentOrderId"
LEFT JOIN "investment_plan" ip ON ip."id" = io."investmentPlanId"
WHERE w."status" = 'COMPLETED'
  AND w."investmentOrderId" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;
