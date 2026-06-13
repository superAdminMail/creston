ALTER TABLE "platform_payment_method"
ADD COLUMN IF NOT EXISTS "bankAddress" TEXT;
