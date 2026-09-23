-- =============================================================================
-- COP4331 Database Initialization Script
-- =============================================================================

-- 1. Create database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS `COP4331`;
USE `COP4331`;

-- 2. Create Users table (InnoDB, VARCHAR(50) fields)
CREATE TABLE IF NOT EXISTS `Users` (
    `ID` INT NOT NULL AUTO_INCREMENT,
    `FirstName` VARCHAR(50) NOT NULL DEFAULT '',
    `LastName` VARCHAR(50) NOT NULL DEFAULT '',
    `Login` VARCHAR(50) NOT NULL DEFAULT '',
    `Password` VARCHAR(50) NOT NULL DEFAULT '',
    PRIMARY KEY (`ID`),
    UNIQUE KEY `idx_login` (`Login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Create Contacts table (InnoDB, INT UserID foreign key)
CREATE TABLE IF NOT EXISTS `Contacts` (
    `ID` INT NOT NULL AUTO_INCREMENT,
    `FirstName` VARCHAR(50) NOT NULL DEFAULT '',
    `LastName` VARCHAR(50) NOT NULL DEFAULT '',
    `Phone` VARCHAR(50) NOT NULL DEFAULT '',
    `Email` VARCHAR(50) NOT NULL DEFAULT '',
    `UserID` INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`ID`),
    KEY `idx_userid` (`UserID`),
    CONSTRAINT `fk_contacts_user` FOREIGN KEY (`UserID`) REFERENCES `Users` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Create or update database user 'TheBeast'@'localhost' and grant privileges
CREATE USER IF NOT EXISTS 'TheBeast'@'localhost' IDENTIFIED BY 'WeLoveCOP4331';
ALTER USER 'TheBeast'@'localhost' IDENTIFIED BY 'WeLoveCOP4331';
GRANT ALL PRIVILEGES ON `COP4331`.* TO 'TheBeast'@'localhost';
FLUSH PRIVILEGES;

-- 5. Seed initial test data
-- Seed user: Alex Smith (login: alexsmith, pass: pass123)
INSERT INTO `Users` (`FirstName`, `LastName`, `Login`, `Password`)
SELECT 'Alex', 'Smith', 'alexsmith', 'pass123'
WHERE NOT EXISTS (
    SELECT 1 FROM `Users` WHERE `Login` = 'alexsmith'
);

-- Seed sample contacts for Alex Smith
INSERT INTO `Contacts` (`FirstName`, `LastName`, `Phone`, `Email`, `UserID`)
SELECT 'John', 'Doe', '555-123-4567', 'johndoe@example.com', u.`ID`
FROM `Users` u
WHERE u.`Login` = 'alexsmith'
  AND NOT EXISTS (
      SELECT 1 FROM `Contacts` c WHERE c.`Email` = 'johndoe@example.com' AND c.`UserID` = u.`ID`
  );

INSERT INTO `Contacts` (`FirstName`, `LastName`, `Phone`, `Email`, `UserID`)
SELECT 'Jane', 'Samson', '555-987-6543', 'janesamson@example.com', u.`ID`
FROM `Users` u
WHERE u.`Login` = 'alexsmith'
  AND NOT EXISTS (
      SELECT 1 FROM `Contacts` c WHERE c.`Email` = 'janesamson@example.com' AND c.`UserID` = u.`ID`
  );
