ALTER TABLE `SiteSettings`
  ADD COLUMN `googleAnalyticsCounter` VARCHAR(191) NULL,
  ADD COLUMN `googleAnalyticsCode` TEXT NULL,
  ADD COLUMN `yandexMetrikaCounter` VARCHAR(191) NULL,
  ADD COLUMN `yandexMetrikaCode` TEXT NULL;
