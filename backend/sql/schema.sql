-- NGENZI REALESTATE — MySQL schema for cPanel (phpMyAdmin import)
-- Database: ngenmyvo_ngenzirealestate (or your DB_NAME)
-- Import via phpMyAdmin → Import → Choose this file → Go

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `resetToken` VARCHAR(255) NULL,
  `resetTokenExpire` DATETIME NULL,
  `role` ENUM('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `properties` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `frontImage` VARCHAR(255) NULL,
  `image` JSON NOT NULL,
  `beds` INT NOT NULL,
  `baths` INT NOT NULL,
  `sqft` INT NOT NULL,
  `type` VARCHAR(255) NOT NULL,
  `availability` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `amenities` JSON NOT NULL,
  `phone` VARCHAR(255) NOT NULL,
  `youtubeUrl` TEXT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `plots` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `frontImage` VARCHAR(255) NULL,
  `image` JSON NOT NULL,
  `area` DECIMAL(10,2) NOT NULL,
  `areaUnit` VARCHAR(255) NULL DEFAULT 'sqft',
  `type` VARCHAR(255) NULL DEFAULT 'Plot',
  `availability` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `amenities` JSON NOT NULL,
  `phone` VARCHAR(255) NULL,
  `plotNumber` VARCHAR(255) NULL,
  `surveyNumber` VARCHAR(255) NULL,
  `facing` VARCHAR(255) NULL,
  `cornerPlot` TINYINT(1) NULL DEFAULT 0,
  `approvedLayout` TINYINT(1) NULL DEFAULT 0,
  `youtubeUrl` TEXT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companyName` VARCHAR(255) NOT NULL DEFAULT 'NGENZI REALESTATE',
  `companyLogo` VARCHAR(255) NULL,
  `companyEmail` VARCHAR(255) NOT NULL DEFAULT 'info@ngenzirealestate.com',
  `companyPhone` VARCHAR(255) NULL,
  `companyAddress` TEXT NULL,
  `facebook` VARCHAR(255) NULL,
  `twitter` VARCHAR(255) NULL,
  `instagram` VARCHAR(255) NULL,
  `linkedin` VARCHAR(255) NULL,
  `youtube` VARCHAR(255) NULL,
  `whatsapp` VARCHAR(255) NULL,
  `websiteUrl` VARCHAR(500) NULL,
  `currency` VARCHAR(10) NULL DEFAULT 'RWF',
  `timezone` VARCHAR(100) NULL DEFAULT 'Africa/Kigali',
  `metaTitle` VARCHAR(255) NULL,
  `metaDescription` TEXT NULL,
  `metaKeywords` TEXT NULL,
  `aboutUs` TEXT NULL,
  `termsAndConditions` TEXT NULL,
  `privacyPolicy` TEXT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `stats` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `endpoint` VARCHAR(255) NOT NULL,
  `method` ENUM('GET','POST','PUT','DELETE','OPTIONS','HEAD') NOT NULL,
  `timestamp` DATETIME NULL,
  `responseTime` INT NOT NULL,
  `statusCode` INT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `stats_endpoint_timestamp` (`endpoint`,`timestamp`),
  KEY `stats_method` (`method`),
  KEY `stats_statusCode` (`statusCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `services` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `icon` VARCHAR(100) NULL,
  `color` VARCHAR(100) NULL,
  `features` JSON NULL,
  `link` VARCHAR(255) NULL,
  `image` VARCHAR(500) NULL,
  `order` INT NULL DEFAULT 0,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `blogs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) NULL,
  `content` LONGTEXT NOT NULL,
  `excerpt` TEXT NULL,
  `author` VARCHAR(200) NOT NULL DEFAULT 'Admin',
  `authorId` INT NULL,
  `image` VARCHAR(500) NULL,
  `category` VARCHAR(100) NULL DEFAULT 'General',
  `tags` JSON NULL,
  `views` INT NOT NULL DEFAULT 0,
  `isPublished` TINYINT(1) NOT NULL DEFAULT 0,
  `publishedAt` DATETIME NULL,
  `metaTitle` VARCHAR(200) NULL,
  `metaDescription` TEXT NULL,
  `metaKeywords` TEXT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blogs_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `position` VARCHAR(255) NULL,
  `company` VARCHAR(255) NULL,
  `content` TEXT NOT NULL,
  `rating` INT NULL DEFAULT 5,
  `image` VARCHAR(500) NULL,
  `order` INT NULL DEFAULT 0,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `isFeatured` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `teams` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `position` VARCHAR(255) NULL,
  `bio` TEXT NULL,
  `email` VARCHAR(255) NULL,
  `phone` VARCHAR(255) NULL,
  `image` VARCHAR(500) NULL,
  `socialLinks` JSON NULL,
  `order` INT NULL DEFAULT 0,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `news` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `forms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `phone` VARCHAR(255) NULL,
  `message` TEXT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  PRIMARY KEY (`id`),
  KEY `idx_appointments_user_date` (`userId`, `date`),
  KEY `idx_appointments_property_date` (`propertyId`, `date`),
  KEY `idx_appointments_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `saved_properties` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `propertyId` INT UNSIGNED NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NULL,
  `type` VARCHAR(50) NULL,
  `isRead` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default settings row
INSERT INTO `settings` (`companyName`,`companyEmail`,`websiteUrl`,`currency`,`timezone`,`metaTitle`,`metaDescription`,`createdAt`,`updatedAt`)
SELECT 'NGENZI REALESTATE','info@ngenzirealestate.com','https://ngenzirealestate.com','RWF','Africa/Kigali',
       'NGENZI REALESTATE — Premium Real Estate in Rwanda',
       'Browse verified properties, plots, and cars across Kigali and Rwanda.',
       NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `settings` LIMIT 1);

SET FOREIGN_KEY_CHECKS = 1;
