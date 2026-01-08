-- Reset Database Script
-- This will DROP and RECREATE the 'hrm' database
-- All data will be lost!

-- Step 1: Drop existing database
DROP DATABASE IF EXISTS hrm;

-- Step 2: Create fresh database
CREATE DATABASE hrm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Done! Now restart the backend to run DataSeeder
