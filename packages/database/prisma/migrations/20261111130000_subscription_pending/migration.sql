-- Additive: new enum value and nullable column.
-- AlterTable
ALTER TABLE `subscription` ADD COLUMN `mentorshipStartsAt` DATETIME(3) NULL,
    MODIFY `status` ENUM('PENDING', 'ACTIVE', 'CANCELED') NOT NULL DEFAULT 'PENDING';

