-- Fix appointments table (run in phpMyAdmin on ngenmyvo_ngenzirealestate)
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `propertyId` INT UNSIGNED NOT NULL,
  `date` DATETIME NOT NULL,
  `time` VARCHAR(50) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `meetingLink` VARCHAR(500) NULL,
  `meetingPlatform` VARCHAR(50) NULL DEFAULT 'other',
  `notes` TEXT NULL,
  `cancelReason` TEXT NULL,
  `reminderSent` TINYINT(1) NOT NULL DEFAULT 0,
  `feedback` JSON NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Safe column adds (ignore error if column already exists)
SET @db = DATABASE();

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='appointments' AND COLUMN_NAME='meetingPlatform')>0,
  'SELECT 1',
  'ALTER TABLE `appointments` ADD COLUMN `meetingPlatform` VARCHAR(50) NULL DEFAULT ''other'' AFTER `meetingLink`'
));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='appointments' AND COLUMN_NAME='cancelReason')>0,
  'SELECT 1',
  'ALTER TABLE `appointments` ADD COLUMN `cancelReason` TEXT NULL'
));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='appointments' AND COLUMN_NAME='reminderSent')>0,
  'SELECT 1',
  'ALTER TABLE `appointments` ADD COLUMN `reminderSent` TINYINT(1) NOT NULL DEFAULT 0'
));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='appointments' AND COLUMN_NAME='feedback')>0,
  'SELECT 1',
  'ALTER TABLE `appointments` ADD COLUMN `feedback` JSON NULL'
));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
