-- SQL CREATE TABLE statement for properties table
-- Based on Property model in backend/models/propertymodel.js

CREATE TABLE IF NOT EXISTS `properties` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `frontImage` VARCHAR(255) DEFAULT NULL,
  `image` JSON NOT NULL DEFAULT ('[]'),
  `beds` INT NOT NULL,
  `baths` INT NOT NULL,
  `sqft` INT NOT NULL,
  `type` VARCHAR(255) NOT NULL,
  `availability` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `amenities` JSON NOT NULL DEFAULT ('[]'),
  `phone` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_availability` (`availability`),
  INDEX `idx_location` (`location`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fix auto-increment if needed (run this if you have ID 0 issues)
-- ALTER TABLE `properties` AUTO_INCREMENT = 1;

-- Delete any properties with ID 0 (if they exist)
-- DELETE FROM `properties` WHERE `id` = 0;

