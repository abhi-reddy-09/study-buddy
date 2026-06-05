-- AlterTable
ALTER TABLE `Match` MODIFY COLUMN `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX `Match_status_idx` ON `Match`(`status`);
