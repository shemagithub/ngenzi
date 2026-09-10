-- ============================================================
-- INSERT data: properties, plots, cars only
-- Source: guzedeveloper_ngenzi.sql
-- Target: NGENZI current schema (youtubeUrl on properties/plots/cars)
--
-- How to use (phpMyAdmin → your live DB):
-- 1. Schema tables must already exist (import backend/sql/schema.sql if needed).
-- 2. Import THIS file.
-- 3. Copy old /uploads files to the new backend uploads folder
--    (frontImage / image paths stay the same).
--
-- From dump:
--   properties → 1 row
--   plots      → no rows (empty in source DB)
--   cars       → no rows (empty in source DB)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------- properties ----------
DELETE FROM `properties`;
INSERT INTO `properties` (
  `id`, `title`, `location`, `price`, `frontImage`, `image`,
  `beds`, `baths`, `sqft`, `type`, `availability`, `description`,
  `amenities`, `phone`, `youtubeUrl`, `createdAt`, `updatedAt`
) VALUES
(
  1,
  'eew',
  'mus',
  999.00,
  '/uploads/properties/front-property-1768439812957-53m5k7-Rubavu_new_market.jpeg',
  '["/uploads/properties/property-1768439813208-1vbua3-O1CN01gjR1BI1k3DgOYgFJa___2071774627.avif","/uploads/properties/property-1768439813213-73g63f-floating_white_sneaker_minimalist_shoe_design_191095_80028.avif","/uploads/properties/property-1768439813206-hb5dmu-1765444467013_574698657_Gemini_Generated_Image_5w9ih05w9ih05w9i_removebg_preview__3_.png","/uploads/properties/property-1768439813211-9cginh-prepaid.png"]',
  4,
  4,
  499,
  'House',
  'rent',
  'jndjhi',
  '["jdne","Security system","Fireplace","Garage","Guest bathroom","High-speed internet ready"]',
  '948982',
  NULL,
  '2026-01-15 01:16:53',
  '2026-01-15 01:17:14'
);

-- ---------- plots (no data in guzedeveloper_ngenzi.sql) ----------
-- DELETE FROM `plots`;
-- (source dump had CREATE TABLE plots but zero INSERT rows)

-- ---------- cars (no data in guzedeveloper_ngenzi.sql) ----------
-- DELETE FROM `cars`;
-- (source dump had CREATE TABLE cars but zero INSERT rows)

-- Reset AUTO_INCREMENT
SET @m = (SELECT IFNULL(MAX(`id`), 0) + 1 FROM `properties`);
SET @q = CONCAT('ALTER TABLE `properties` AUTO_INCREMENT = ', @m);
PREPARE stmt FROM @q; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @m = (SELECT IFNULL(MAX(`id`), 0) + 1 FROM `plots`);
SET @q = CONCAT('ALTER TABLE `plots` AUTO_INCREMENT = ', @m);
PREPARE stmt FROM @q; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @m = (SELECT IFNULL(MAX(`id`), 0) + 1 FROM `cars`);
SET @q = CONCAT('ALTER TABLE `cars` AUTO_INCREMENT = ', @m);
PREPARE stmt FROM @q; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;
