ALTER TABLE "PaymentMethod"
ADD COLUMN "bankCode" TEXT,
ADD COLUMN "iban" TEXT,
ADD COLUMN "swiftCode" TEXT,
ADD COLUMN "routingNumber" TEXT,
ADD COLUMN "branchName" TEXT;
