-- ============================================
-- SIMPLE CREATE/UPDATE PLOTS TABLE
-- ============================================
-- Quick script to create or update the plots table
-- Run this if you need a simple, straightforward solution
-- ============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Drop table if exists (WARNING: This will delete all data!)
-- Uncomment the next line ONLY if you want to recreate the table from scratch
-- DROP TABLE IF EXISTS `plots`;

-- Create the table
CREATE TABLE IF NOT EXISTS `plots` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `frontImage` VARCHAR(500) DEFAULT NULL,
  `image` JSON NOT NULL DEFAULT ('[]'),
  `area` DECIMAL(10, 2) NOT NULL,
  `areaUnit` VARCHAR(20) DEFAULT 'sqft',
  `type` VARCHAR(255) DEFAULT 'Plot',
  `availability` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `amenities` JSON NOT NULL DEFAULT ('[]'),
  `phone` VARCHAR(255) NOT NULL,
  `plotNumber` VARCHAR(100) DEFAULT NULL,
  `surveyNumber` VARCHAR(100) DEFAULT NULL,
  `facing` VARCHAR(50) DEFAULT NULL,
  `cornerPlot` BOOLEAN DEFAULT FALSE,
  `approvedLayout` BOOLEAN DEFAULT FALSE,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_location` (`location`),
  KEY `idx_type` (`type`),
  KEY `idx_availability` (`availability`),
  KEY `idx_price` (`price`),
  KEY `idx_area` (`area`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure AUTO_INCREMENT is properly set
ALTER TABLE `plots` MODIFY `id` INT(11) NOT NULL AUTO_INCREMENT;

-- Reset AUTO_INCREMENT to next available value (safe even if table is empty)
SET @max_id = (SELECT COALESCE(MAX(id), 0) FROM plots);
SET @sql = CONCAT('ALTER TABLE plots AUTO_INCREMENT = ', @max_id + 1);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify table exists (simple query that doesn't require information_schema access)
SELECT '✅ Plots table ready!' AS Status;
-- Count rows to verify table is accessible
SELECT COUNT(*) AS total_plots FROM `plots`;

