-- CreateEnum
CREATE TYPE "CryptoAsset" AS ENUM ('BTC', 'ETH');

-- CreateEnum
CREATE TYPE "CryptoNetwork" AS ENUM ('BITCOIN', 'ETHEREUM');

-- CreateEnum
CREATE TYPE "CryptoFundingProvider" AS ENUM ('TRANSAK');

-- CreateEnum
CREATE TYPE "CryptoFundingIntentStatus" AS ENUM ('PENDING', 'REQUIRES_ACTION', 'PROCESSING', 'AWAITING_PROVIDER_CONFIRMATION', 'FUNDED', 'FAILED', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "CryptoWebhookSource" AS ENUM ('TRANSAK');

-- CreateEnum
CREATE TYPE "CryptoWebhookProcessingStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'IGNORED', 'FAILED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'FROZEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "PenaltyType" AS ENUM ('FIXED', 'PERCENT');

-- CreateEnum
CREATE TYPE "InvestmentModel" AS ENUM ('FIXED', 'MARKET');

-- CreateEnum
CREATE TYPE "InvestmentOrderStatus" AS ENUM ('PENDING_CONFIRMATION', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'PAID', 'PENDING_PAYMENT', 'PARTIALLY_PAID');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'PARTIALLY_PAID', 'VOID');

-- CreateEnum
CREATE TYPE "InvestmentType" AS ENUM ('STOCKS', 'BONDS', 'ETFS', 'CRYPTO', 'COMMODITIES');

-- CreateEnum
CREATE TYPE "InvestmentPeriod" AS ENUM ('SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM');

-- CreateEnum
CREATE TYPE "InvestmentCatalogStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('BANK', 'CRYPTO');

-- CreateEnum
CREATE TYPE "SavingsInterestFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "SavingsStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SavingsTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'INTEREST', 'FEE', 'ADJUSTMENT', 'LOCK', 'UNLOCK');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NOT_STARTED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_FRONT', 'ID_BACK', 'PROOF_OF_ADDRESS', 'DRIVER_LICENSE', 'PASSPORT', 'SELFIE');

-- CreateEnum
CREATE TYPE "FileAssetType" AS ENUM ('AVATAR', 'DOCUMENT', 'KYC_DOCUMENT', 'REPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "FileAssetVisibility" AS ENUM ('PRIVATE', 'INTERNAL', 'PUBLIC');

-- CreateEnum
CREATE TYPE "TestimonyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InvestmentTierLevel" AS ENUM ('CORE', 'ADVANCED', 'ELITE');

-- CreateEnum
CREATE TYPE "FileStorageProvider" AS ENUM ('UPLOADTHING', 'S3', 'CLOUDINARY', 'R2', 'LOCAL');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('SUPPORT', 'SYSTEM', 'ACCOUNT_ISSUES', 'INVESTMENT_INQUIRIES');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('OPEN', 'RESOLVED', 'CLOSED', 'ARCHIVED', 'WAITING', 'CANCELLED', 'REJECTED', 'BLOCKED', 'DELETED');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('USER', 'SUPPORT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ConversationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ConversationRole" AS ENUM ('USER', 'SUPPORT', 'ADMIN', 'SYSTEM');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "username" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "scheduledDeletionAt" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "skippedOnboardingAt" TIMESTAMP(3),
    "profileAvatarFileAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetAttempt" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_asset" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT,
    "mimeType" TEXT,
    "extension" TEXT,
    "sizeBytes" BIGINT,
    "checksumSha256" TEXT,
    "storageKey" TEXT NOT NULL,
    "storageBucket" TEXT,
    "storageProvider" "FileStorageProvider" NOT NULL,
    "url" TEXT,
    "type" "FileAssetType" NOT NULL DEFAULT 'OTHER',
    "visibility" "FileAssetVisibility" NOT NULL DEFAULT 'PRIVATE',
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investor_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "age" INTEGER NOT NULL DEFAULT 18,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "avatarFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investor_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_account" (
    "id" TEXT NOT NULL,
    "investorProfileId" TEXT NOT NULL,
    "investmentPlanId" TEXT NOT NULL,
    "pendingWithdrawal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "symbol" TEXT,
    "type" "InvestmentType" NOT NULL DEFAULT 'CRYPTO',
    "status" "InvestmentCatalogStatus" NOT NULL DEFAULT 'ACTIVE',
    "iconFileAssetId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_price" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "price" DECIMAL(18,8) NOT NULL,
    "source" TEXT,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investment_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_plan" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "penaltyFreePeriodDays" INTEGER NOT NULL DEFAULT 0,
    "penaltyType" "PenaltyType",
    "earlyWithdrawalPenaltyValue" DECIMAL(18,2),
    "maxPenaltyAmount" DECIMAL(18,2),
    "investmentModel" "InvestmentModel" NOT NULL,
    "expectedReturnMin" DECIMAL(5,2),
    "expectedReturnMax" DECIMAL(5,2),
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "allowWithdrawal" BOOLEAN NOT NULL DEFAULT true,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoImageFileId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "durationDays" INTEGER NOT NULL DEFAULT 7,
    "period" "InvestmentPeriod" NOT NULL DEFAULT 'LONG_TERM',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_plan_tier" (
    "id" TEXT NOT NULL,
    "investmentPlanId" TEXT NOT NULL,
    "level" "InvestmentTierLevel" NOT NULL DEFAULT 'CORE',
    "minAmount" DECIMAL(18,2) NOT NULL,
    "maxAmount" DECIMAL(18,2) NOT NULL,
    "roiPercent" DECIMAL(5,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_plan_tier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_order" (
    "id" TEXT NOT NULL,
    "investorProfileId" TEXT NOT NULL,
    "investmentPlanId" TEXT NOT NULL,
    "investmentAccountId" TEXT NOT NULL,
    "investmentPlanTierId" TEXT NOT NULL,
    "investmentModel" "InvestmentModel" NOT NULL,
    "startDate" TIMESTAMP(3),
    "maturityDate" TIMESTAMP(3),
    "expectedReturn" DECIMAL(18,2),
    "accruedProfit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "lastAccruedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "dailyProfitAccumulated" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lastProfitResetAt" TIMESTAMP(3),
    "units" DECIMAL(18,8),
    "entryPrice" DECIMAL(18,8),
    "currentValue" DECIMAL(18,2),
    "lastValuationAt" TIMESTAMP(3),
    "isMatured" BOOLEAN NOT NULL DEFAULT false,
    "isWithdrawn" BOOLEAN NOT NULL DEFAULT false,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "InvestmentOrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "commissionStatus" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "commissionPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "paymentReference" TEXT,
    "paidAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentEarning" (
    "id" TEXT NOT NULL,
    "investmentOrderId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestmentEarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "interestRatePercent" DECIMAL(5,2),
    "interestPayoutFrequency" "SavingsInterestFrequency",
    "interestEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isLockable" BOOLEAN NOT NULL DEFAULT false,
    "minimumLockDays" INTEGER,
    "maximumLockDays" INTEGER,
    "allowsWithdrawals" BOOLEAN NOT NULL DEFAULT true,
    "allowsDeposits" BOOLEAN NOT NULL DEFAULT true,
    "minBalance" DECIMAL(18,2),
    "maxBalance" DECIMAL(18,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_account" (
    "id" TEXT NOT NULL,
    "investorProfileId" TEXT NOT NULL,
    "savingsProductId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "targetAmount" DECIMAL(18,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedUntil" TIMESTAMP(3),
    "lastInterestAppliedAt" TIMESTAMP(3),
    "status" "SavingsStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_transaction" (
    "id" TEXT NOT NULL,
    "savingsAccountId" TEXT NOT NULL,
    "type" "SavingsTransactionType" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "balanceBefore" DECIMAL(18,2) NOT NULL,
    "balanceAfter" DECIMAL(18,2) NOT NULL,
    "feeAmount" DECIMAL(18,2),
    "reference" TEXT,
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawal_order" (
    "id" TEXT NOT NULL,
    "externalReference" TEXT,
    "investorProfileId" TEXT NOT NULL,
    "investmentAccountId" TEXT,
    "investmentOrderId" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "payoutMethodId" TEXT,
    "payoutSnapshot" JSONB,
    "reference" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdrawal_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "investorProfileId" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "bankName" TEXT,
    "accountName" TEXT,
    "accountNumber" TEXT,
    "network" TEXT,
    "address" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CronJob" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "isRunning" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CronJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CronLock" (
    "name" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CronLock_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "KYCVerification" (
    "id" TEXT NOT NULL,
    "investorProfileId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'didit',
    "providerSessionId" TEXT,
    "vendorData" TEXT,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "faceMatchScore" DOUBLE PRECISION,
    "livenessPassed" BOOLEAN,
    "failureReason" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYCVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimony" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "roleOrTitle" TEXT DEFAULT 'CLIENT',
    "message" TEXT NOT NULL,
    "rating" INTEGER,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "status" "TestimonyStatus" NOT NULL DEFAULT 'DRAFT',
    "avatarFileId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimony_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "photoFileId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "management_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformWallet" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "asset" "CryptoAsset" NOT NULL,
    "network" "CryptoNetwork" NOT NULL,
    "address" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoFundingIntent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "CryptoFundingProvider" NOT NULL,
    "asset" "CryptoAsset" NOT NULL,
    "network" "CryptoNetwork" NOT NULL,
    "fiatCurrency" TEXT NOT NULL DEFAULT 'USD',
    "fiatAmount" DECIMAL(18,2) NOT NULL,
    "expectedCryptoAmount" DECIMAL(36,18),
    "receivedCryptoAmount" DECIMAL(36,18),
    "status" "CryptoFundingIntentStatus" NOT NULL DEFAULT 'PENDING',
    "platformWalletId" TEXT,
    "destinationWalletAddress" TEXT NOT NULL,
    "destinationWalletLabel" TEXT,
    "providerSessionId" TEXT,
    "providerExternalId" TEXT,
    "providerReference" TEXT,
    "partnerCustomerId" TEXT,
    "redirectUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "fundedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoFundingIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoWebhookEvent" (
    "id" TEXT NOT NULL,
    "source" "CryptoWebhookSource" NOT NULL,
    "eventType" TEXT NOT NULL,
    "processingStatus" "CryptoWebhookProcessingStatus" NOT NULL DEFAULT 'RECEIVED',
    "fundingIntentId" TEXT,
    "providerEventId" TEXT,
    "providerObjectId" TEXT,
    "idempotencyKey" TEXT,
    "signature" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "investmentAccountId" TEXT,
    "type" "ConversationType" NOT NULL,
    "status" "ConversationStatus" NOT NULL DEFAULT 'OPEN',
    "subject" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agentId" TEXT,
    "priority" "ConversationPriority" NOT NULL DEFAULT 'NORMAL',

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT,
    "senderType" "SenderType" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMember" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ConversationRole" NOT NULL DEFAULT 'USER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "lastReadAt" TIMESTAMP(3),

    CONSTRAINT "ConversationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "type" TEXT,
    "key" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_configuration" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "siteName" TEXT NOT NULL,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "siteDescription" TEXT,
    "siteTagline" TEXT,
    "siteLogoFileAssetId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "locale" TEXT DEFAULT 'en_US',
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "defaultTwitterHandle" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "defaultOgImageFileAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_profileAvatarFileAssetId_idx" ON "user"("profileAvatarFileAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE INDEX "PasswordResetAttempt_email_idx" ON "PasswordResetAttempt"("email");

-- CreateIndex
CREATE INDEX "PasswordResetAttempt_createdAt_idx" ON "PasswordResetAttempt"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "file_asset_storageKey_key" ON "file_asset"("storageKey");

-- CreateIndex
CREATE INDEX "file_asset_uploadedById_idx" ON "file_asset"("uploadedById");

-- CreateIndex
CREATE INDEX "file_asset_type_idx" ON "file_asset"("type");

-- CreateIndex
CREATE INDEX "file_asset_visibility_idx" ON "file_asset"("visibility");

-- CreateIndex
CREATE UNIQUE INDEX "investor_profile_userId_key" ON "investor_profile"("userId");

-- CreateIndex
CREATE INDEX "investor_profile_kycStatus_idx" ON "investor_profile"("kycStatus");

-- CreateIndex
CREATE INDEX "investor_profile_avatarFileId_idx" ON "investor_profile"("avatarFileId");

-- CreateIndex
CREATE INDEX "investment_account_investorProfileId_idx" ON "investment_account"("investorProfileId");

-- CreateIndex
CREATE INDEX "investment_account_investmentPlanId_idx" ON "investment_account"("investmentPlanId");

-- CreateIndex
CREATE INDEX "investment_account_status_idx" ON "investment_account"("status");

-- CreateIndex
CREATE UNIQUE INDEX "investment_account_investorProfileId_investmentPlanId_key" ON "investment_account"("investorProfileId", "investmentPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "investment_slug_key" ON "investment"("slug");

-- CreateIndex
CREATE INDEX "investment_type_idx" ON "investment"("type");

-- CreateIndex
CREATE INDEX "investment_status_idx" ON "investment"("status");

-- CreateIndex
CREATE INDEX "investment_isActive_idx" ON "investment"("isActive");

-- CreateIndex
CREATE INDEX "investment_sortOrder_idx" ON "investment"("sortOrder");

-- CreateIndex
CREATE INDEX "investment_iconFileAssetId_idx" ON "investment"("iconFileAssetId");

-- CreateIndex
CREATE INDEX "investment_price_symbol_recordedAt_idx" ON "investment_price"("symbol", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "investment_plan_slug_key" ON "investment_plan"("slug");

-- CreateIndex
CREATE INDEX "investment_plan_investmentId_idx" ON "investment_plan"("investmentId");

-- CreateIndex
CREATE INDEX "investment_plan_investmentModel_idx" ON "investment_plan"("investmentModel");

-- CreateIndex
CREATE INDEX "investment_plan_period_idx" ON "investment_plan"("period");

-- CreateIndex
CREATE INDEX "investment_plan_isActive_idx" ON "investment_plan"("isActive");

-- CreateIndex
CREATE INDEX "investment_plan_tier_investmentPlanId_idx" ON "investment_plan_tier"("investmentPlanId");

-- CreateIndex
CREATE INDEX "investment_plan_tier_level_idx" ON "investment_plan_tier"("level");

-- CreateIndex
CREATE UNIQUE INDEX "investment_plan_tier_investmentPlanId_level_key" ON "investment_plan_tier"("investmentPlanId", "level");

-- CreateIndex
CREATE INDEX "investment_order_investorProfileId_idx" ON "investment_order"("investorProfileId");

-- CreateIndex
CREATE INDEX "investment_order_investmentPlanId_idx" ON "investment_order"("investmentPlanId");

-- CreateIndex
CREATE INDEX "investment_order_investmentAccountId_idx" ON "investment_order"("investmentAccountId");

-- CreateIndex
CREATE INDEX "investment_order_investmentModel_idx" ON "investment_order"("investmentModel");

-- CreateIndex
CREATE INDEX "investment_order_status_idx" ON "investment_order"("status");

-- CreateIndex
CREATE INDEX "investment_order_paidAt_idx" ON "investment_order"("paidAt");

-- CreateIndex
CREATE INDEX "investment_order_confirmedAt_idx" ON "investment_order"("confirmedAt");

-- CreateIndex
CREATE INDEX "investment_order_cancelledAt_idx" ON "investment_order"("cancelledAt");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentEarning_investmentOrderId_date_key" ON "InvestmentEarning"("investmentOrderId", "date");

-- CreateIndex
CREATE INDEX "savings_product_isActive_idx" ON "savings_product"("isActive");

-- CreateIndex
CREATE INDEX "savings_product_sortOrder_idx" ON "savings_product"("sortOrder");

-- CreateIndex
CREATE INDEX "savings_account_investorProfileId_idx" ON "savings_account"("investorProfileId");

-- CreateIndex
CREATE INDEX "savings_account_savingsProductId_idx" ON "savings_account"("savingsProductId");

-- CreateIndex
CREATE INDEX "savings_account_status_idx" ON "savings_account"("status");

-- CreateIndex
CREATE INDEX "savings_transaction_savingsAccountId_idx" ON "savings_transaction"("savingsAccountId");

-- CreateIndex
CREATE INDEX "savings_transaction_type_idx" ON "savings_transaction"("type");

-- CreateIndex
CREATE INDEX "savings_transaction_createdAt_idx" ON "savings_transaction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawal_order_externalReference_key" ON "withdrawal_order"("externalReference");

-- CreateIndex
CREATE INDEX "withdrawal_order_payoutMethodId_idx" ON "withdrawal_order"("payoutMethodId");

-- CreateIndex
CREATE INDEX "withdrawal_order_investorProfileId_idx" ON "withdrawal_order"("investorProfileId");

-- CreateIndex
CREATE INDEX "withdrawal_order_investmentAccountId_idx" ON "withdrawal_order"("investmentAccountId");

-- CreateIndex
CREATE INDEX "withdrawal_order_investmentOrderId_idx" ON "withdrawal_order"("investmentOrderId");

-- CreateIndex
CREATE INDEX "withdrawal_order_status_idx" ON "withdrawal_order"("status");

-- CreateIndex
CREATE INDEX "PaymentMethod_investorProfileId_idx" ON "PaymentMethod"("investorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "CronJob_key_key" ON "CronJob"("key");

-- CreateIndex
CREATE UNIQUE INDEX "KYCVerification_investorProfileId_key" ON "KYCVerification"("investorProfileId");

-- CreateIndex
CREATE INDEX "KYCVerification_status_idx" ON "KYCVerification"("status");

-- CreateIndex
CREATE INDEX "audit_log_actorUserId_idx" ON "audit_log"("actorUserId");

-- CreateIndex
CREATE INDEX "audit_log_entityType_entityId_idx" ON "audit_log"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_log_action_idx" ON "audit_log"("action");

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- CreateIndex
CREATE INDEX "testimony_status_idx" ON "testimony"("status");

-- CreateIndex
CREATE INDEX "testimony_isFeatured_idx" ON "testimony"("isFeatured");

-- CreateIndex
CREATE INDEX "testimony_sortOrder_idx" ON "testimony"("sortOrder");

-- CreateIndex
CREATE INDEX "testimony_avatarFileId_idx" ON "testimony"("avatarFileId");

-- CreateIndex
CREATE INDEX "management_isActive_idx" ON "management"("isActive");

-- CreateIndex
CREATE INDEX "management_sortOrder_idx" ON "management"("sortOrder");

-- CreateIndex
CREATE INDEX "management_photoFileId_idx" ON "management"("photoFileId");

-- CreateIndex
CREATE INDEX "PlatformWallet_asset_network_isActive_idx" ON "PlatformWallet"("asset", "network", "isActive");

-- CreateIndex
CREATE INDEX "PlatformWallet_isDefault_isActive_idx" ON "PlatformWallet"("isDefault", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformWallet_network_address_key" ON "PlatformWallet"("network", "address");

-- CreateIndex
CREATE INDEX "CryptoFundingIntent_userId_status_idx" ON "CryptoFundingIntent"("userId", "status");

-- CreateIndex
CREATE INDEX "CryptoFundingIntent_provider_status_idx" ON "CryptoFundingIntent"("provider", "status");

-- CreateIndex
CREATE INDEX "CryptoFundingIntent_asset_network_idx" ON "CryptoFundingIntent"("asset", "network");

-- CreateIndex
CREATE INDEX "CryptoFundingIntent_providerSessionId_idx" ON "CryptoFundingIntent"("providerSessionId");

-- CreateIndex
CREATE INDEX "CryptoFundingIntent_providerExternalId_idx" ON "CryptoFundingIntent"("providerExternalId");

-- CreateIndex
CREATE INDEX "CryptoFundingIntent_createdAt_idx" ON "CryptoFundingIntent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoWebhookEvent_idempotencyKey_key" ON "CryptoWebhookEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "CryptoWebhookEvent_source_eventType_idx" ON "CryptoWebhookEvent"("source", "eventType");

-- CreateIndex
CREATE INDEX "CryptoWebhookEvent_processingStatus_idx" ON "CryptoWebhookEvent"("processingStatus");

-- CreateIndex
CREATE INDEX "CryptoWebhookEvent_providerEventId_idx" ON "CryptoWebhookEvent"("providerEventId");

-- CreateIndex
CREATE INDEX "CryptoWebhookEvent_providerObjectId_idx" ON "CryptoWebhookEvent"("providerObjectId");

-- CreateIndex
CREATE INDEX "CryptoWebhookEvent_receivedAt_idx" ON "CryptoWebhookEvent"("receivedAt");

-- CreateIndex
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_type_status_idx" ON "Conversation"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_userId_key" ON "AgentProfile"("userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "ConversationMember_userId_idx" ON "ConversationMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationMember_conversationId_userId_key" ON "ConversationMember"("conversationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_key_key" ON "Notification"("key");

-- CreateIndex
CREATE UNIQUE INDEX "site_configuration_siteLogoFileAssetId_key" ON "site_configuration"("siteLogoFileAssetId");

-- CreateIndex
CREATE INDEX "site_configuration_defaultOgImageFileAssetId_idx" ON "site_configuration"("defaultOgImageFileAssetId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_profileAvatarFileAssetId_fkey" FOREIGN KEY ("profileAvatarFileAssetId") REFERENCES "file_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_asset" ADD CONSTRAINT "file_asset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investor_profile" ADD CONSTRAINT "investor_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investor_profile" ADD CONSTRAINT "investor_profile_avatarFileId_fkey" FOREIGN KEY ("avatarFileId") REFERENCES "file_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_account" ADD CONSTRAINT "investment_account_investorProfileId_fkey" FOREIGN KEY ("investorProfileId") REFERENCES "investor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_account" ADD CONSTRAINT "investment_account_investmentPlanId_fkey" FOREIGN KEY ("investmentPlanId") REFERENCES "investment_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment" ADD CONSTRAINT "investment_iconFileAssetId_fkey" FOREIGN KEY ("iconFileAssetId") REFERENCES "file_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_plan" ADD CONSTRAINT "investment_plan_seoImageFileId_fkey" FOREIGN KEY ("seoImageFileId") REFERENCES "file_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_plan" ADD CONSTRAINT "investment_plan_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_plan_tier" ADD CONSTRAINT "investment_plan_tier_investmentPlanId_fkey" FOREIGN KEY ("investmentPlanId") REFERENCES "investment_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_order" ADD CONSTRAINT "investment_order_investmentPlanTierId_fkey" FOREIGN KEY ("investmentPlanTierId") REFERENCES "investment_plan_tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_order" ADD CONSTRAINT "investment_order_investorProfileId_fkey" FOREIGN KEY ("investorProfileId") REFERENCES "investor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_order" ADD CONSTRAINT "investment_order_investmentPlanId_fkey" FOREIGN KEY ("investmentPlanId") REFERENCES "investment_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_order" ADD CONSTRAINT "investment_order_investmentAccountId_fkey" FOREIGN KEY ("investmentAccountId") REFERENCES "investment_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentEarning" ADD CONSTRAINT "InvestmentEarning_investmentOrderId_fkey" FOREIGN KEY ("investmentOrderId") REFERENCES "investment_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_account" ADD CONSTRAINT "savings_account_investorProfileId_fkey" FOREIGN KEY ("investorProfileId") REFERENCES "investor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_account" ADD CONSTRAINT "savings_account_savingsProductId_fkey" FOREIGN KEY ("savingsProductId") REFERENCES "savings_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_transaction" ADD CONSTRAINT "savings_transaction_savingsAccountId_fkey" FOREIGN KEY ("savingsAccountId") REFERENCES "savings_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_order" ADD CONSTRAINT "withdrawal_order_payoutMethodId_fkey" FOREIGN KEY ("payoutMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_order" ADD CONSTRAINT "withdrawal_order_investorProfileId_fkey" FOREIGN KEY ("investorProfileId") REFERENCES "investor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_order" ADD CONSTRAINT "withdrawal_order_investmentAccountId_fkey" FOREIGN KEY ("investmentAccountId") REFERENCES "investment_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_order" ADD CONSTRAINT "withdrawal_order_investmentOrderId_fkey" FOREIGN KEY ("investmentOrderId") REFERENCES "investment_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_investorProfileId_fkey" FOREIGN KEY ("investorProfileId") REFERENCES "investor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCVerification" ADD CONSTRAINT "KYCVerification_investorProfileId_fkey" FOREIGN KEY ("investorProfileId") REFERENCES "investor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimony" ADD CONSTRAINT "testimony_avatarFileId_fkey" FOREIGN KEY ("avatarFileId") REFERENCES "file_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management" ADD CONSTRAINT "management_photoFileId_fkey" FOREIGN KEY ("photoFileId") REFERENCES "file_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoFundingIntent" ADD CONSTRAINT "CryptoFundingIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoFundingIntent" ADD CONSTRAINT "CryptoFundingIntent_platformWalletId_fkey" FOREIGN KEY ("platformWalletId") REFERENCES "PlatformWallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoWebhookEvent" ADD CONSTRAINT "CryptoWebhookEvent_fundingIntentId_fkey" FOREIGN KEY ("fundingIntentId") REFERENCES "CryptoFundingIntent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentProfile" ADD CONSTRAINT "AgentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMember" ADD CONSTRAINT "ConversationMember_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMember" ADD CONSTRAINT "ConversationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_configuration" ADD CONSTRAINT "site_configuration_siteLogoFileAssetId_fkey" FOREIGN KEY ("siteLogoFileAssetId") REFERENCES "file_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_configuration" ADD CONSTRAINT "site_configuration_defaultOgImageFileAssetId_fkey" FOREIGN KEY ("defaultOgImageFileAssetId") REFERENCES "file_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
