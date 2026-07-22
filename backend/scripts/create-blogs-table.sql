-- Create blogs table
CREATE TABLE IF NOT EXISTS `blogs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) DEFAULT NULL,
  `content` LONGTEXT NOT NULL,
  `excerpt` TEXT DEFAULT NULL,
  `author` VARCHAR(200) NOT NULL DEFAULT 'Admin',
  `authorId` INT(11) DEFAULT NULL,
  `image` VARCHAR(500) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT 'General',
  `tags` JSON DEFAULT NULL,
  `views` INT(11) NOT NULL DEFAULT 0,
  `isPublished` TINYINT(1) NOT NULL DEFAULT 0,
  `publishedAt` DATETIME DEFAULT NULL,
  `metaTitle` VARCHAR(200) DEFAULT NULL,
  `metaDescription` TEXT DEFAULT NULL,
  `metaKeywords` TEXT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_isPublished` (`isPublished`),
  KEY `idx_category` (`category`),
  KEY `idx_publishedAt` (`publishedAt`),
  KEY `idx_authorId` (`authorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

