-- uGoal — Database creation script
--
-- Creates the empty `habit_tracker` database. Run this once before
-- create_tables.py, on a MySQL server that does not yet have this database.
--
-- Usage:
--   mysql -u root -p < init_db.sql
--
-- After this runs, point your backend's .env at it:
--   DATABASE_URL=mysql+pymysql://<user>:<password>@localhost:3306/habit_tracker

CREATE DATABASE IF NOT EXISTS habit_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE habit_tracker;
