-- Optional YouTube embed URL for properties (safe to run multiple times)

SET @db = DATABASE();

SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'properties' AND COLUMN_NAME = 'youtubeUrl') > 0,
    'SELECT ''properties.youtubeUrl already exists'' AS result',
    'ALTER TABLE `properties` ADD COLUMN `youtubeUrl` VARCHAR(512) NULL DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
