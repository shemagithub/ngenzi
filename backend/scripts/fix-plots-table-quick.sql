-- ============================================
-- QUICK FIX FOR PLOTS TABLE
-- ============================================
-- Run this if you're getting "Plot was created but does not have a valid ID" error
-- ============================================

-- Ensure the table exists with correct structure
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fix AUTO_INCREMENT if needed
ALTER TABLE `plots` MODIFY `id` INT(11) NOT NULL AUTO_INCREMENT;

-- Reset AUTO_INCREMENT to next available value
SET @max_id = (SELECT COALESCE(MAX(id), 0) FROM plots);
SET @sql = CONCAT('ALTER TABLE plots AUTO_INCREMENT = ', @max_id + 1);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify
SELECT '✅ Plots table fixed!' as Status;
SELECT AUTO_INCREMENT FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'plots';

