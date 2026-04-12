-- =========================================================
-- PE HUB - SUPABASE SCHEMA
-- =========================================================
-- Run these SQL commands in your Supabase Dashboard
-- Settings → SQL Editor → New Query
-- =========================================================

-- TABLE 1: Students (Enhanced)
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  gender TEXT,
  class_grade TEXT,
  house TEXT,
  school TEXT,
  xp INTEGER DEFAULT 0,
  house_points INTEGER DEFAULT 0,
  profile_pic TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLE 2: Teachers (Enhanced)
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  title TEXT,
  school TEXT,
  qualifications JSONB,
  years_experience INTEGER,
  specialisms JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLE 3: Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  sport_key TEXT NOT NULL,
  source TEXT,
  skills JSONB,
  teacher_comment TEXT,
  total_points INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLE 4: House Point Events
CREATE TABLE IF NOT EXISTS house_point_events (
  id BIGSERIAL PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  points INTEGER NOT NULL,
  source TEXT,
  note TEXT,
  created_at TIMESTAMP,
  synced_at TIMESTAMP DEFAULT NOW()
);

-- TABLE 5: Teacher Feedback
CREATE TABLE IF NOT EXISTS teacher_feedback (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES teachers(id),
  student_id TEXT NOT NULL REFERENCES students(id),
  lesson_type TEXT,
  feedback_text TEXT,
  mood TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLE 6: Teacher Notifications
CREATE TABLE IF NOT EXISTS teacher_notifications (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES teachers(id),
  student_id TEXT NOT NULL REFERENCES students(id),
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLE 7: Quiz Progress
CREATE TABLE IF NOT EXISTS quiz_progress (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  quiz_key TEXT NOT NULL,
  score INTEGER,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLE 8: Student Achievements
CREATE TABLE IF NOT EXISTS student_achievements (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  achievement_key TEXT NOT NULL,
  earned_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLE 9: Authorized IDs
CREATE TABLE IF NOT EXISTS authorized_ids (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  registered BOOLEAN DEFAULT FALSE,
  preset_first_name TEXT,
  preset_last_name TEXT,
  linked_student_id TEXT,
  linked_teacher_id TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLE 10: Season History
CREATE TABLE IF NOT EXISTS season_history (
  id TEXT PRIMARY KEY,
  season_name TEXT NOT NULL,
  winners JSONB,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_assessments_student ON assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_sport ON assessments(sport_key);
CREATE INDEX IF NOT EXISTS idx_house_points_student ON house_point_events(student_id);
CREATE INDEX IF NOT EXISTS idx_feedback_teacher ON teacher_feedback(teacher_id);
CREATE INDEX IF NOT EXISTS idx_feedback_student ON teacher_feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_teacher ON teacher_notifications(teacher_id);
CREATE INDEX IF NOT EXISTS idx_quiz_progress_student ON quiz_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_achievements_student ON student_achievements(student_id);

-- =========================================================
-- OPTIONAL: ROW-LEVEL SECURITY POLICIES
-- =========================================================
-- Uncomment these if you want to enable RLS

-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Students can read their own data"
--   ON students FOR SELECT
--   USING (auth.uid()::text = id);

-- CREATE POLICY "Teachers can update their own data"
--   ON teachers FOR UPDATE
--   USING (auth.uid()::text = id);

-- =========================================================
-- SYNC STATUS TABLE (Optional - for debugging)
-- =========================================================

CREATE TABLE IF NOT EXISTS sync_logs (
  id BIGSERIAL PRIMARY KEY,
  collection TEXT NOT NULL,
  operation TEXT NOT NULL,
  data_id TEXT NOT NULL,
  status TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_created ON sync_logs(created_at DESC);

-- =========================================================
-- VIEWS FOR REPORTING (Optional)
-- =========================================================

-- View: Total house points per student
CREATE OR REPLACE VIEW student_house_points_summary AS
SELECT 
  s.id,
  s.first_name,
  s.last_name,
  s.house,
  COALESCE(SUM(hp.points), 0) as total_points
FROM students s
LEFT JOIN house_point_events hp ON s.id = hp.student_id
GROUP BY s.id, s.first_name, s.last_name, s.house;

-- View: Recent assessments
CREATE OR REPLACE VIEW recent_assessments AS
SELECT 
  a.id,
  a.student_id,
  s.first_name,
  s.last_name,
  a.sport_key,
  a.total_points,
  a.created_at
FROM assessments a
LEFT JOIN students s ON a.student_id = s.id
ORDER BY a.created_at DESC
LIMIT 100;

-- =========================================================
-- ALL TABLES CREATED SUCCESSFULLY!
-- =========================================================
-- 
-- Next steps:
-- 1. Go back to your PE Hub app
-- 2. The sync system will automatically populate these tables
-- 3. All student and teacher modifications will now sync to Supabase
-- 4. Monitor sync status in browser console: universalSync.logStatus()
-- 
-- =========================================================
