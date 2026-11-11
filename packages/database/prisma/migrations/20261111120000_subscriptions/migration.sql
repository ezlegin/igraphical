-- Subscriptions: additive only. No existing column/table is altered destructively.
-- AlterTable
ALTER TABLE `enrollment` ADD COLUMN `accessEndsAt` DATETIME(3) NULL,
    ADD COLUMN `isLegacy` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `mentorshipEndsAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `plan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `months` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `compareAtPrice` INTEGER NULL,
    `mentorshipPrice` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `plan_months_key`(`months`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `months` INTEGER NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `mentorship` BOOLEAN NOT NULL DEFAULT false,
    `mentorshipEndsAt` DATETIME(3) NULL,
    `price` DOUBLE NOT NULL,
    `mentorshipPrice` DOUBLE NOT NULL DEFAULT 0,
    `status` ENUM('ACTIVE', 'CANCELED') NOT NULL DEFAULT 'ACTIVE',
    `source` ENUM('PURCHASE', 'ADMIN') NOT NULL DEFAULT 'PURCHASE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,
    `planId` INTEGER NULL,
    `paymentId` INTEGER NULL,

    UNIQUE INDEX `subscription_paymentId_key`(`paymentId`),
    INDEX `subscription_userId_endsAt_idx`(`userId`, `endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `enrollment_userId_isLegacy_idx` ON `enrollment`(`userId`, `isLegacy`);

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;


-- Seed the four plans inactive with zero prices; admin sets prices and activates them.
INSERT IGNORE INTO `plan` (`title`, `months`, `price`, `mentorshipPrice`, `isActive`, `sortOrder`, `updatedAt`) VALUES
    ('اشتراک ۱ ماهه', 1, 0, 0, false, 1, CURRENT_TIMESTAMP(3)),
    ('اشتراک ۳ ماهه', 3, 0, 0, false, 2, CURRENT_TIMESTAMP(3)),
    ('اشتراک ۶ ماهه', 6, 0, 0, false, 3, CURRENT_TIMESTAMP(3)),
    ('اشتراک ۱۲ ماهه', 12, 0, 0, false, 4, CURRENT_TIMESTAMP(3));
