-- =========================================================
-- PE HUB - SIMPLE SUPABASE SCHEMA
-- =========================================================
-- Copy and paste this entire script into your Supabase SQL Editor
-- Go to: SQL Editor → New Query → Paste here → Run
-- =========================================================

-- =========================================================
-- USERS (Authentication + user type)
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  authorized_id TEXT UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'teacher', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- STUDENTS (Student profiles)
-- =========================================================
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  gender TEXT,
  class_grade TEXT,
  year_group TEXT,
  class_letter TEXT,
  key_stage TEXT,
  house TEXT,
  school TEXT,
  xp INTEGER DEFAULT 0,
  house_points INTEGER DEFAULT 0,
  glory_points INTEGER DEFAULT 0,
  profile_pic TEXT,
  quiz_levels_completed INTEGER DEFAULT 0,
  sports_count INTEGER DEFAULT 0,
  lessons_done INTEGER DEFAULT 0,
  activated BOOLEAN DEFAULT FALSE,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  birthdate DATE,
  last_active_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add missing columns to students table if they don't exist
ALTER TABLE students ADD COLUMN IF NOT EXISTS year_group TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS class_letter TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS key_stage TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS glory_points INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS quiz_levels_completed INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS sports_count INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS lessons_done INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS birthdate DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS last_active_timestamp TIMESTAMP;

-- =========================================================
-- TEACHERS (Teacher profiles)
-- =========================================================
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  school TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- ASSESSMENTS (Sport assessments)
-- =========================================================
CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
  sport_key TEXT NOT NULL,
  skills JSONB,
  teacher_comment TEXT,
  total_points INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- HOUSE POINT EVENTS (Point history)
-- =========================================================
CREATE TABLE IF NOT EXISTS house_point_events (
  id BIGSERIAL PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  source TEXT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- TEACHER NOTIFICATIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS teacher_notifications (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- AUTHORIZED IDS (Registration codes)
-- =========================================================
CREATE TABLE IF NOT EXISTS authorized_ids (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  registered BOOLEAN DEFAULT FALSE,
  linked_student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
  linked_teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- INDEXES
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_assessments_student ON assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_teacher ON assessments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_house_points_student ON house_point_events(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_teacher ON teacher_notifications(teacher_id);
CREATE INDEX IF NOT EXISTS idx_notifications_student ON teacher_notifications(student_id);

-- =========================================================
-- SIMPLE SCHEMA READY
-- =========================================================
-- Run this SQL in Supabase and refresh your app.
-- If you want to expand later, add tables for quiz progress,
-- achievements, feedback, or season history as needed.
-- =========================================================
