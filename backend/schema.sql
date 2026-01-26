-- SQL Schema for Reverse Engineering in MySQL Workbench
-- Generated based on Sequelize models

CREATE DATABASE IF NOT EXISTS `internstuff`;
USE `internstuff`;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------
-- Table `institutionsupervisors`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `institutionsupervisors`;
CREATE TABLE IF NOT EXISTS `institutionsupervisors` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fullName` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `department` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `profileImage` VARCHAR(255),
  `isActive` BOOLEAN DEFAULT TRUE,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `industrysupervisors`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `industrysupervisors`;
CREATE TABLE IF NOT EXISTS `industrysupervisors` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fullName` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `companyName` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `profileImage` VARCHAR(255),
  `companyAddress` TEXT,
  `position` VARCHAR(100),
  `department` VARCHAR(100),
  `lastLogin` DATETIME,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `siwescoordinators`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `siwescoordinators`;
CREATE TABLE IF NOT EXISTS `siwescoordinators` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fullName` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `department` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `h_o_ds`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `h_o_ds`;
CREATE TABLE IF NOT EXISTS `h_o_ds` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `department` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `profile_image` VARCHAR(255),
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `students`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE IF NOT EXISTS `students` (
  `id` CHAR(36) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `matric_number` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `department` VARCHAR(255) NOT NULL,
  `company_name` VARCHAR(255),
  `company_address` TEXT,
  `assigned_supervisor` INT,
  `assigned_industry_supervisor` INT,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `verification_code_used` VARCHAR(255),
  `phone` VARCHAR(255),
  `profile_image` TEXT,
  `progress` INT DEFAULT 0,
  `status` ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'INACTIVE') DEFAULT 'ACTIVE',
  `siwes_start_date` DATE,
  `siwes_end_date` DATE,
  `total_weeks` INT DEFAULT 24,
  `last_login` DATETIME,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_student_supervisor`
    FOREIGN KEY (`assigned_supervisor`)
    REFERENCES `institutionsupervisors` (`id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_student_industry_supervisor`
    FOREIGN KEY (`assigned_industry_supervisor`)
    REFERENCES `industrysupervisors` (`id`)
    ON DELETE SET NULL
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `verification_codes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `verification_codes`;
CREATE TABLE IF NOT EXISTS `verification_codes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(10) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL,
  `department` VARCHAR(255) NOT NULL,
  `issuedBy` INT NOT NULL,
  `isUsed` BOOLEAN DEFAULT FALSE,
  `expiresAt` DATETIME NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_code_coordinator`
    FOREIGN KEY (`issuedBy`)
    REFERENCES `siwescoordinators` (`id`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `logbooks`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logbooks`;
CREATE TABLE IF NOT EXISTS `logbooks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `studentId` CHAR(36) NOT NULL,
  `weekNumber` INT NOT NULL,
  `startDate` DATE NOT NULL,
  `endDate` DATE NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `weekSummary` TEXT NOT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REVISION') DEFAULT 'PENDING',
  `supervisorComment` TEXT,
  `industryStatus` ENUM('PENDING', 'APPROVED', 'REVISION') DEFAULT 'PENDING',
  `industryComment` TEXT,
  `industryReviewedAt` DATETIME,
  `institutionStatus` ENUM('PENDING', 'APPROVED', 'REVISION') DEFAULT 'PENDING',
  `institutionComment` TEXT,
  `institutionReviewedAt` DATETIME,
  `images` JSON,
  `mondayActivities` TEXT,
  `tuesdayActivities` TEXT,
  `wednesdayActivities` TEXT,
  `thursdayActivities` TEXT,
  `fridayActivities` TEXT,
  `challengesFaced` TEXT,
  `lessonsLearned` TEXT,
  `skillsAcquired` TEXT,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_logbook_student`
    FOREIGN KEY (`studentId`)
    REFERENCES `students` (`id`)
    ON DELETE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `assignments`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `assignments`;
CREATE TABLE IF NOT EXISTS `assignments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `studentId` CHAR(36) NOT NULL,
  `institutionSupervisorId` INT,
  `industrySupervisorId` INT,
  `assignedBy` INT NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE', 'COMPLETED') DEFAULT 'ACTIVE',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_assignment_student`
    FOREIGN KEY (`studentId`)
    REFERENCES `students` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_assignment_institution`
    FOREIGN KEY (`institutionSupervisorId`)
    REFERENCES `institutionsupervisors` (`id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_assignment_industry`
    FOREIGN KEY (`industrySupervisorId`)
    REFERENCES `industrysupervisors` (`id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_assignment_hod`
    FOREIGN KEY (`assignedBy`)
    REFERENCES `h_o_ds` (`id`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `defenses`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `defenses`;
CREATE TABLE IF NOT EXISTS `defenses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `studentId` CHAR(36) NOT NULL,
  `defenseDate` DATETIME NOT NULL,
  `defenseTime` TIME NOT NULL,
  `venue` VARCHAR(100) NOT NULL,
  `duration` VARCHAR(20) DEFAULT '30 minutes',
  `panelMembers` JSON,
  `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'PENDING') DEFAULT 'PENDING',
  `score` FLOAT,
  `remarks` TEXT,
  `verdict` ENUM('PASS', 'FAIL', 'PENDING') DEFAULT 'PENDING',
  `scheduledBy` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_defense_student`
    FOREIGN KEY (`studentId`)
    REFERENCES `students` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_defense_coordinator`
    FOREIGN KEY (`scheduledBy`)
    REFERENCES `siwescoordinators` (`id`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `letters`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `letters`;
CREATE TABLE IF NOT EXISTS `letters` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `studentId` CHAR(36) NOT NULL, -- Corrected from INTEGER
  `fileUrl` VARCHAR(255) NOT NULL,
  `uploadedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_letter_student`
    FOREIGN KEY (`studentId`)
    REFERENCES `students` (`id`)
    ON DELETE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `gradings`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gradings`;
CREATE TABLE IF NOT EXISTS `gradings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `studentId` CHAR(36) NOT NULL, -- Corrected from INTEGER
  `score` DECIMAL(5, 2) NOT NULL,
  `remarks` TEXT,
  `defenseDate` DATETIME NOT NULL,
  `assessor` VARCHAR(255) NOT NULL,
  `verdict` ENUM('PASS', 'FAIL', 'PENDING') DEFAULT 'PENDING',
  `submittedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_grading_student`
    FOREIGN KEY (`studentId`)
    REFERENCES `students` (`id`)
    ON DELETE CASCADE
) ENGINE = InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
