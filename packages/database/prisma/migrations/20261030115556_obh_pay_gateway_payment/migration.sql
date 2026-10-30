-- CreateTable
CREATE TABLE `gateway_payment` (
    `reference` VARCHAR(64) NOT NULL,
    `orderId` VARCHAR(64) NOT NULL,
    `attempt` INTEGER NOT NULL,
    `gateway` VARCHAR(32) NOT NULL,
    `gatewayOrderId` VARCHAR(32) NOT NULL,
    `amount` VARCHAR(32) NOT NULL,
    `description` TEXT NOT NULL,
    `status` VARCHAR(16) NOT NULL,
    `environment` VARCHAR(8) NOT NULL,
    `returnUrl` TEXT NULL,
    `customerMobile` VARCHAR(20) NULL,
    `metadata` JSON NOT NULL,
    `providerSessionId` VARCHAR(191) NULL,
    `providerReference` VARCHAR(191) NULL,
    `traceNumber` VARCHAR(191) NULL,
    `maskedCardNumber` VARCHAR(64) NULL,
    `resultCode` INTEGER NULL,
    `resultText` TEXT NULL,
    `installment` JSON NULL,
    `redirect` JSON NULL,
    `callbackPayload` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,
    `callbackReceivedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `failedAt` DATETIME(3) NULL,
    `reportedStatus` VARCHAR(16) NULL,
    `reportedAt` DATETIME(3) NULL,

    INDEX `gateway_payment_orderId_idx`(`orderId`),
    INDEX `gateway_payment_gateway_providerSessionId_idx`(`gateway`, `providerSessionId`),
    INDEX `gateway_payment_status_createdAt_idx`(`status`, `createdAt`),
    UNIQUE INDEX `gateway_payment_gateway_gatewayOrderId_key`(`gateway`, `gatewayOrderId`),
    PRIMARY KEY (`reference`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gateway_order_number` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gateway` VARCHAR(32) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
