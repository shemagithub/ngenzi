-- ============================================
-- CARS TABLE
-- ============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS `cars` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(100) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  `year` INT(11) NOT NULL,
  `mileage` INT(11) NOT NULL DEFAULT 0,
  `mileageUnit` VARCHAR(20) DEFAULT 'km',
  `fuelType` VARCHAR(50) NOT NULL,
  `transmission` VARCHAR(50) NOT NULL,
  `color` VARCHAR(50) DEFAULT NULL,
  `condition` VARCHAR(50) NOT NULL DEFAULT 'Used',
  `bodyType` VARCHAR(50) DEFAULT NULL,
  `engineSize` VARCHAR(50) DEFAULT NULL,
  `vin` VARCHAR(50) DEFAULT NULL,
  `location` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `frontImage` VARCHAR(500) DEFAULT NULL,
  `image` JSON NOT NULL DEFAULT ('[]'),
  `availability` VARCHAR(50) NOT NULL COMMENT 'buy or rent',
  `description` TEXT NOT NULL,
  `features` JSON NOT NULL DEFAULT ('[]'),
  `phone` VARCHAR(255) NOT NULL,
  `youtubeUrl` VARCHAR(512) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_brand` (`brand`),
  KEY `idx_location` (`location`),
  KEY `idx_availability` (`availability`),
  KEY `idx_price` (`price`),
  KEY `idx_year` (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✅ Cars table created successfully!' as Status;
