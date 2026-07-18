ALTER TABLE "investment_order"
ADD COLUMN IF NOT EXISTS "bankInfoRequestedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "bankInfoRespondedAt" TIMESTAMP(3);

ALTER TABLE "savings_account"
ADD COLUMN IF NOT EXISTS "platformPaymentMethodId" TEXT,
ADD COLUMN IF NOT EXISTS "bankInfoRequestedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "bankInfoRespondedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "investment_order_bankInfoRequestedAt_idx"
  ON "investment_order"("bankInfoRequestedAt");

CREATE INDEX IF NOT EXISTS "savings_account_platformPaymentMethodId_idx"
  ON "savings_account"("platformPaymentMethodId");

CREATE INDEX IF NOT EXISTS "savings_account_bankInfoRequestedAt_idx"
  ON "savings_account"("bankInfoRequestedAt");

ALTER TABLE "savings_account"
ADD CONSTRAINT "savings_account_platformPaymentMethodId_fkey"
FOREIGN KEY ("platformPaymentMethodId")
REFERENCES "platform_payment_method"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
