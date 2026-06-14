-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'InvestmentOrderAdjustmentDirection'
  ) THEN
    CREATE TYPE "InvestmentOrderAdjustmentDirection" AS ENUM ('ADD', 'DEDUCT');
  END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "investment_order_adjustment" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "investmentOrderId" TEXT NOT NULL,
  "adjustedByUserId" TEXT NOT NULL,
  "direction" "InvestmentOrderAdjustmentDirection" NOT NULL,
  "amount" DECIMAL(18,2) NOT NULL,
  "earningsBefore" DECIMAL(18,2) NOT NULL,
  "earningsAfter" DECIMAL(18,2) NOT NULL,
  "balanceBefore" DECIMAL(18,2) NOT NULL,
  "balanceAfter" DECIMAL(18,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "reason" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "investment_order_adjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "investment_order_adjustment_reference_key"
  ON "investment_order_adjustment"("reference");

CREATE INDEX IF NOT EXISTS "investment_order_adjustment_investmentOrderId_idx"
  ON "investment_order_adjustment"("investmentOrderId");

CREATE INDEX IF NOT EXISTS "investment_order_adjustment_adjustedByUserId_idx"
  ON "investment_order_adjustment"("adjustedByUserId");

CREATE INDEX IF NOT EXISTS "investment_order_adjustment_direction_idx"
  ON "investment_order_adjustment"("direction");

CREATE INDEX IF NOT EXISTS "investment_order_adjustment_createdAt_idx"
  ON "investment_order_adjustment"("createdAt");

-- AddForeignKey
ALTER TABLE "investment_order_adjustment"
  ADD CONSTRAINT "investment_order_adjustment_investmentOrderId_fkey"
  FOREIGN KEY ("investmentOrderId")
  REFERENCES "investment_order"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "investment_order_adjustment"
  ADD CONSTRAINT "investment_order_adjustment_adjustedByUserId_fkey"
  FOREIGN KEY ("adjustedByUserId")
  REFERENCES "user"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- Backfill legacy JSON adjustment snapshots into the new ledger.
INSERT INTO "investment_order_adjustment" (
  "id",
  "reference",
  "investmentOrderId",
  "adjustedByUserId",
  "direction",
  "amount",
  "earningsBefore",
  "earningsAfter",
  "balanceBefore",
  "balanceAfter",
  "currency",
  "reason",
  "metadata",
  "createdAt"
)
SELECT
  CONCAT('ioadj_', io."id", '_', COALESCE(NULLIF(entry->>'adjustmentId', ''), md5(COALESCE(entry::text, '') || io."id"))) AS "id",
  COALESCE(NULLIF(entry->>'adjustmentId', ''), CONCAT('adj:', io."id", ':', COALESCE(NULLIF(entry->>'adjustedAt', ''), io."updatedAt"::text))) AS "reference",
  io."id" AS "investmentOrderId",
  NULLIF(entry->>'adjustedByUserId', '') AS "adjustedByUserId",
  CASE
    WHEN COALESCE(entry->>'direction', '') = 'DEDUCT' THEN 'DEDUCT'::"InvestmentOrderAdjustmentDirection"
    ELSE 'ADD'::"InvestmentOrderAdjustmentDirection"
  END AS "direction",
  COALESCE(NULLIF(entry->>'amount', '')::DECIMAL(18,2), 0) AS "amount",
  COALESCE(NULLIF(entry->>'earningsBefore', '')::DECIMAL(18,2), 0) AS "earningsBefore",
  COALESCE(NULLIF(entry->>'earningsAfter', '')::DECIMAL(18,2), 0) AS "earningsAfter",
  COALESCE(NULLIF(entry->>'balanceBefore', '')::DECIMAL(18,2), 0) AS "balanceBefore",
  COALESCE(NULLIF(entry->>'balanceAfter', '')::DECIMAL(18,2), 0) AS "balanceAfter",
  COALESCE(NULLIF(entry->>'currency', ''), io."currency", 'USD') AS "currency",
  NULLIF(entry->>'reason', '') AS "reason",
  entry AS "metadata",
  COALESCE(
    NULLIF(entry->>'adjustedAt', '')::TIMESTAMP(3),
    io."updatedAt"
  ) AS "createdAt"
FROM "investment_order" io
CROSS JOIN LATERAL jsonb_array_elements(
  COALESCE(io."paymentMetadata"->'adjustments', '[]'::jsonb)
) AS entry
WHERE COALESCE(entry->>'kind', '') IN ('EARNINGS_ADJUSTMENT', 'BALANCE_ADJUSTMENT')
  AND NULLIF(entry->>'adjustedByUserId', '') IS NOT NULL
ON CONFLICT ("reference") DO NOTHING;
