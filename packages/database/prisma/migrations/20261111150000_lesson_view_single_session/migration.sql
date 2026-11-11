-- Additive: lesson_view table and a nullable user column.
-- AlterTable
ALTER TABLE `user` ADD COLUMN `activeSessionId` VARCHAR(64) NULL;

-- CreateTable
CREATE TABLE `lesson_view` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,
    `lessonId` INTEGER NOT NULL,

    INDEX `lesson_view_userId_createdAt_idx`(`userId`, `createdAt`),
    UNIQUE INDEX `lesson_view_userId_lessonId_day_key`(`userId`, `lessonId`, `day`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lesson_view` ADD CONSTRAINT `lesson_view_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lesson_view` ADD CONSTRAINT `lesson_view_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

