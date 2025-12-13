-- MySQL Database Setup for TaskApp
-- This script creates all tables with appropriate relationships

-- Create database
CREATE DATABASE IF NOT EXISTS taskapp;
USE taskapp;

-- Drop tables if they exist (in correct order to avoid foreign key constraints)
DROP TABLE IF EXISTS ProjectHistory;
DROP TABLE IF EXISTS TaskInvitation;
DROP TABLE IF EXISTS TaskAssignee;
DROP TABLE IF EXISTS Task;
DROP TABLE IF EXISTS ProjectMember;
DROP TABLE IF EXISTS Project;
DROP TABLE IF EXISTS Admin;
DROP TABLE IF EXISTS VerificationToken;
DROP TABLE IF EXISTS Session;
DROP TABLE IF EXISTS Account;
DROP TABLE IF EXISTS User;

-- Create User table
CREATE TABLE User (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    emailVerified DATETIME,
    image TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    isSuspended BOOLEAN NOT NULL DEFAULT FALSE,
    suspendedUntil DATETIME,
    suspendedReason TEXT,
    bannedAt DATETIME,
    bannedReason TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Account table
CREATE TABLE Account (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    providerAccountId VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INT,
    token_type VARCHAR(255),
    scope VARCHAR(255),
    id_token TEXT,
    session_state VARCHAR(255),
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider_account (provider, providerAccountId)
);

-- Create Session table
CREATE TABLE Session (
    id VARCHAR(255) PRIMARY KEY,
    sessionToken VARCHAR(255) NOT NULL UNIQUE,
    userId VARCHAR(255) NOT NULL,
    expires DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- Create VerificationToken table
CREATE TABLE VerificationToken (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires DATETIME NOT NULL,
    UNIQUE KEY unique_identifier_token (identifier, token)
);

-- Create Project table
CREATE TABLE Project (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    startDate DATETIME,
    endDate DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    founderId VARCHAR(255) NOT NULL,
    FOREIGN KEY (founderId) REFERENCES User(id)
);

-- Create ProjectMember table
CREATE TABLE ProjectMember (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    projectId VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    joinedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_project (userId, projectId)
);

-- Create Task table
CREATE TABLE Task (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'TODO',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    dueDate DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    projectId VARCHAR(255) NOT NULL,
    createdById VARCHAR(255) NOT NULL,
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE,
    FOREIGN KEY (createdById) REFERENCES User(id)
);

-- Create TaskAssignee table (many-to-many relationship between Task and User)
CREATE TABLE TaskAssignee (
    id VARCHAR(255) PRIMARY KEY,
    taskId VARCHAR(255) NOT NULL,
    userId VARCHAR(255) NOT NULL,
    assignedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES Task(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    UNIQUE KEY unique_task_user (taskId, userId)
);

-- Create TaskInvitation table
CREATE TABLE TaskInvitation (
    id VARCHAR(255) PRIMARY KEY,
    projectId VARCHAR(255) NOT NULL,
    invitedUserId VARCHAR(255) NOT NULL,
    invitedByUserId VARCHAR(255) NOT NULL,
    taskTitle VARCHAR(255) NOT NULL,
    taskDescription TEXT,
    dueDate DATETIME,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE,
    FOREIGN KEY (invitedUserId) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (invitedByUserId) REFERENCES User(id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_invited_user (projectId, invitedUserId)
);

-- Create Admin table
CREATE TABLE Admin (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create ProjectHistory table
CREATE TABLE ProjectHistory (
    id VARCHAR(255) PRIMARY KEY,
    projectId VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    oldValue TEXT,
    newValue TEXT,
    changedBy VARCHAR(255) NOT NULL,
    changedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    isUndone BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE,
    FOREIGN KEY (changedBy) REFERENCES User(id) ON DELETE CASCADE,
    INDEX idx_project_changedAt (projectId, changedAt)
);

-- Insert sample data for testing
INSERT INTO User (id, username, name, email, role) VALUES 
('user_1', 'johndoe', 'John Doe', 'john@example.com', 'MEMBER'),
('user_2', 'janedoe', 'Jane Doe', 'jane@example.com', 'MEMBER');

INSERT INTO Project (id, name, description, founderId) VALUES 
('proj_1', 'Sample Project', 'This is a sample project', 'user_1');

INSERT INTO ProjectMember (id, userId, projectId, role) VALUES 
('pm_1', 'user_1', 'proj_1', 'FOUNDER'),
('pm_2', 'user_2', 'proj_1', 'MEMBER');

INSERT INTO Task (id, title, description, projectId, createdById) VALUES 
('task_1', 'Sample Task', 'This is a sample task', 'proj_1', 'user_1');

INSERT INTO TaskAssignee (id, taskId, userId) VALUES 
('ta_1', 'task_1', 'user_2');

INSERT INTO Admin (id, username, password, name) VALUES 
('admin_1', 'admin', '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', 'Administrator');

-- Show all tables
SHOW TABLES;

-- Describe each table structure
DESCRIBE User;
DESCRIBE Account;
DESCRIBE Session;
DESCRIBE VerificationToken;
DESCRIBE Project;
DESCRIBE ProjectMember;
DESCRIBE Task;
DESCRIBE TaskAssignee;
DESCRIBE TaskInvitation;
DESCRIBE Admin;
DESCRIBE ProjectHistory;