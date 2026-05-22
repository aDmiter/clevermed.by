-- Admin RBAC: расширение User, права и аудит входов (идемпотентно где возможно)

CREATE TABLE IF NOT EXISTS `UserPermission` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `section` ENUM('DASHBOARD', 'SERVICES', 'DOCTORS', 'ONLINE_BOOKINGS', 'APPOINTMENTS', 'SETTINGS', 'SEO', 'REVIEWS', 'CONTENT', 'USERS') NOT NULL,
    `canRead` BOOLEAN NOT NULL DEFAULT false,
    `canWrite` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `UserPermission_userId_section_key`(`userId`, `section`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `LoginAttempt` (
    `id` VARCHAR(191) NOT NULL,
    `login` VARCHAR(191) NOT NULL,
    `ip` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `success` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LoginAttempt_login_createdAt_idx`(`login`, `createdAt`),
    INDEX `LoginAttempt_ip_createdAt_idx`(`ip`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @has_login := (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'User' AND COLUMN_NAME = 'login'
);

SET @sql_login := IF(@has_login = 0,
    'ALTER TABLE `User`
        ADD COLUMN `login` VARCHAR(191) NULL,
        ADD COLUMN `firstName` VARCHAR(191) NULL,
        ADD COLUMN `lastName` VARCHAR(191) NULL,
        ADD COLUMN `role` ENUM(''SUPER_ADMIN'', ''ADMIN'') NOT NULL DEFAULT ''ADMIN'',
        ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
        ADD COLUMN `failedLoginAttempts` INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN `lockedUntil` DATETIME(3) NULL,
        ADD COLUMN `lastLoginAt` DATETIME(3) NULL,
        ADD COLUMN `passwordChangedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)',
    'SELECT 1');
PREPARE stmt FROM @sql_login;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_name := (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'User' AND COLUMN_NAME = 'name'
);

UPDATE `User`
SET
    `login` = COALESCE(`login`, LOWER(SUBSTRING_INDEX(`email`, '@', 1))),
    `firstName` = COALESCE(`firstName`, 'Админ'),
    `lastName` = COALESCE(
        `lastName`,
        IF(@has_name > 0, COALESCE(`name`, 'Пользователь'), 'Пользователь')
    ),
    `role` = 'SUPER_ADMIN'
WHERE `login` IS NULL OR `firstName` IS NULL OR `lastName` IS NULL;

ALTER TABLE `User`
    MODIFY `login` VARCHAR(191) NOT NULL,
    MODIFY `firstName` VARCHAR(191) NOT NULL,
    MODIFY `lastName` VARCHAR(191) NOT NULL;

SET @sql_drop_name := IF(@has_name > 0, 'ALTER TABLE `User` DROP COLUMN `name`', 'SELECT 1');
PREPARE stmt FROM @sql_drop_name;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_login_index := (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'User' AND INDEX_NAME = 'User_login_key'
);

SET @sql_index := IF(@has_login_index = 0,
    'CREATE UNIQUE INDEX `User_login_key` ON `User`(`login`)',
    'SELECT 1');
PREPARE stmt FROM @sql_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_fk := (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'UserPermission'
      AND CONSTRAINT_NAME = 'UserPermission_userId_fkey'
);

SET @sql_fk := IF(@has_fk = 0,
    'ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    'SELECT 1');
PREPARE stmt FROM @sql_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
