-- ============================================
-- SETTINGS TABLE - Create Settings Table
-- ============================================
-- This script creates a settings table for storing company-wide settings
-- ============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `companyName` VARCHAR(255) NOT NULL DEFAULT 'NGENZI REALESTATE',
  `companyLogo` VARCHAR(500) DEFAULT NULL,
  `companyEmail` VARCHAR(255) NOT NULL DEFAULT 'support@ngenzirealestate.com',
  `companyPhone` VARCHAR(50) DEFAULT NULL,
  `companyAddress` TEXT DEFAULT NULL,
  `facebook` VARCHAR(500) DEFAULT NULL,
  `twitter` VARCHAR(500) DEFAULT NULL,
  `instagram` VARCHAR(500) DEFAULT NULL,
  `linkedin` VARCHAR(500) DEFAULT NULL,
  `youtube` VARCHAR(500) DEFAULT NULL,
  `whatsapp` VARCHAR(50) DEFAULT NULL,
  `websiteUrl` VARCHAR(500) DEFAULT NULL,
  `currency` VARCHAR(10) DEFAULT 'RWF',
  `timezone` VARCHAR(50) DEFAULT 'Africa/Kigali',
  `metaTitle` VARCHAR(255) DEFAULT NULL,
  `metaDescription` TEXT DEFAULT NULL,
  `metaKeywords` TEXT DEFAULT NULL,
  `aboutUs` TEXT DEFAULT NULL,
  `termsAndConditions` TEXT DEFAULT NULL,
  `privacyPolicy` TEXT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings if table is empty
INSERT INTO `settings` (`companyName`, `companyEmail`) 
SELECT 'NGENZI REALESTATE', 'support@ngenzirealestate.com'
WHERE NOT EXISTS (SELECT 1 FROM `settings`);

SELECT '✅ Settings table created successfully!' as Status;

