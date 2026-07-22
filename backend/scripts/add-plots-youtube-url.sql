-- Add optional YouTube URL column to plots (safe to run multiple times)
-- Run in phpMyAdmin or: mysql -u USER -p DB_NAME < add-plots-youtube-url.sql

SET @db = DATABASE();

SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'plots' AND COLUMN_NAME = 'youtubeUrl') > 0,
    'SELECT ''plots.youtubeUrl already exists'' AS result',
    'ALTER TABLE `plots` ADD COLUMN `youtubeUrl` VARCHAR(512) NULL DEFAULT NULL COMMENT ''Optional YouTube embed/watch URL'''
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
