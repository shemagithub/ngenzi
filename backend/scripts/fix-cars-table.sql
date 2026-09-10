-- Ensure cars table exists / has vin column (phpMyAdmin safe)
CREATE TABLE IF NOT EXISTS `cars` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(255) NOT NULL,
  `model` VARCHAR(255) NOT NULL,
  `year` INT NOT NULL,
  `mileage` INT NOT NULL DEFAULT 0,
  `mileageUnit` VARCHAR(255) NULL DEFAULT 'km',
  `fuelType` VARCHAR(255) NOT NULL,
  `transmission` VARCHAR(255) NOT NULL,
  `color` VARCHAR(255) NULL,
  `condition` VARCHAR(255) NOT NULL DEFAULT 'Used',
  `bodyType` VARCHAR(255) NULL,
  `engineSize` VARCHAR(255) NULL,
  `vin` VARCHAR(255) NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `location` VARCHAR(255) NULL,
  `frontImage` VARCHAR(255) NULL,
  `image` JSON NULL,
  `availability` VARCHAR(255) NULL DEFAULT 'sale',
  `description` TEXT NULL,
  `features` JSON NULL,
  `phone` VARCHAR(255) NULL,
  `youtubeUrl` TEXT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add vin if table already existed without it
SET @dbname = DATABASE();
SET @tablename = 'cars';
SET @columnname = 'vin';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `cars` ADD COLUMN `vin` VARCHAR(255) NULL AFTER `engineSize`'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
