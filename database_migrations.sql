-- ============================================
-- 学习目标与番茄钟数据表迁移脚本
-- ============================================

-- 1. 创建学习记录表 (如果不存在)
CREATE TABLE IF NOT EXISTS study_records (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  subject TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  source TEXT DEFAULT 'manual', -- 'manual' 或 'pomodoro'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为 study_records 添加索引
CREATE INDEX IF NOT EXISTS idx_study_records_user_date 
ON study_records(user_id, date);

CREATE INDEX IF NOT EXISTS idx_study_records_user_subject 
ON study_records(user_id, subject);

-- 2. 创建番茄钟会话表 (如果不存在)
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_record_id BIGINT REFERENCES study_records(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'completed', -- 'completed', 'abandoned'
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为 pomodoro_sessions 添加索引
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_time 
ON pomodoro_sessions(user_id, end_time);

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_study_record 
ON pomodoro_sessions(study_record_id);

-- 3. 创建学习目标表 (如果不存在)
CREATE TABLE IF NOT EXISTS learning_goals (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly')),
  target_minutes INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, goal_type, start_date)
);

-- 为 learning_goals 添加索引
CREATE INDEX IF NOT EXISTS idx_learning_goals_user_type 
ON learning_goals(user_id, goal_type);

CREATE INDEX IF NOT EXISTS idx_learning_goals_date_range 
ON learning_goals(start_date, end_date);

-- 4. 启用 RLS (Row Level Security)
ALTER TABLE study_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_goals ENABLE ROW LEVEL SECURITY;

-- 5. 创建 RLS 策略 - study_records
DROP POLICY IF EXISTS "用户只能访问自己的学习记录" ON study_records;
CREATE POLICY "用户只能访问自己的学习记录"
ON study_records
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. 创建 RLS 策略 - pomodoro_sessions
DROP POLICY IF EXISTS "用户只能访问自己的番茄钟会话" ON pomodoro_sessions;
CREATE POLICY "用户只能访问自己的番茄钟会话"
ON pomodoro_sessions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. 创建 RLS 策略 - learning_goals
DROP POLICY IF EXISTS "用户只能访问自己的学习目标" ON learning_goals;
CREATE POLICY "用户只能访问自己的学习目标"
ON learning_goals
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 迁移完成!
-- ============================================

-- 验证表是否创建成功
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('study_records', 'pomodoro_sessions', 'learning_goals')
ORDER BY table_name, ordinal_position;