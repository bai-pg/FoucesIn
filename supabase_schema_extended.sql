-- ============================================
-- 学习追踪系统 - 数据库扩展脚本
-- 添加目标管理、番茄钟、用户偏好等功能
-- ============================================

-- 1. 学习目标表
CREATE TABLE IF NOT EXISTS public.learning_goals (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly')),
  target_minutes INTEGER NOT NULL CHECK (target_minutes > 0),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, goal_type, start_date)
);

-- 2. 番茄钟会话表
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  study_record_id INTEGER REFERENCES public.study_records(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'interrupted', 'skipped')),
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 用户偏好表
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  email_notifications BOOLEAN DEFAULT true,
  default_view TEXT DEFAULT 'dashboard',
  pomodoro_work_duration INTEGER DEFAULT 25, -- 专注时长（分钟）
  pomodoro_rest_duration INTEGER DEFAULT 5,  -- 休息时长（分钟）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 扩展 profiles 表（如果不存在某些字段）
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================
-- 行级安全策略 (RLS)
-- ============================================

-- 学习目标表 RLS
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;

-- 使用 DO 块检查并创建策略（避免重复创建错误）
DO $$ 
BEGIN
    -- 检查策略是否存在
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'learning_goals' 
        AND policyname = 'Users can view own goals'
    ) THEN
        CREATE POLICY "Users can view own goals" 
          ON public.learning_goals FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'learning_goals' 
        AND policyname = 'Users can insert own goals'
    ) THEN
        CREATE POLICY "Users can insert own goals" 
          ON public.learning_goals FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'learning_goals' 
        AND policyname = 'Users can update own goals'
    ) THEN
        CREATE POLICY "Users can update own goals" 
          ON public.learning_goals FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'learning_goals' 
        AND policyname = 'Users can delete own goals'
    ) THEN
        CREATE POLICY "Users can delete own goals" 
          ON public.learning_goals FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- 番茄钟会话表 RLS
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pomodoro_sessions' 
        AND policyname = 'Users can view own pomodoro sessions'
    ) THEN
        CREATE POLICY "Users can view own pomodoro sessions" 
          ON public.pomodoro_sessions FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pomodoro_sessions' 
        AND policyname = 'Users can insert own pomodoro sessions'
    ) THEN
        CREATE POLICY "Users can insert own pomodoro sessions" 
          ON public.pomodoro_sessions FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pomodoro_sessions' 
        AND policyname = 'Users can update own pomodoro sessions'
    ) THEN
        CREATE POLICY "Users can update own pomodoro sessions" 
          ON public.pomodoro_sessions FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pomodoro_sessions' 
        AND policyname = 'Users can delete own pomodoro sessions'
    ) THEN
        CREATE POLICY "Users can delete own pomodoro sessions" 
          ON public.pomodoro_sessions FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- 用户偏好表 RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_preferences' 
        AND policyname = 'Users can view own preferences'
    ) THEN
        CREATE POLICY "Users can view own preferences" 
          ON public.user_preferences FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_preferences' 
        AND policyname = 'Users can upsert own preferences'
    ) THEN
        CREATE POLICY "Users can upsert own preferences" 
          ON public.user_preferences FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_preferences' 
        AND policyname = 'Users can update own preferences'
    ) THEN
        CREATE POLICY "Users can update own preferences" 
          ON public.user_preferences FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Profiles 表 RLS（补充更新策略）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" 
          ON public.profiles FOR UPDATE 
          USING (auth.uid() = id);
    END IF;
END $$;

-- ============================================
-- 索引优化
-- ============================================

-- 学习目标表索引
CREATE INDEX IF NOT EXISTS idx_learning_goals_user_id 
  ON public.learning_goals(user_id);

CREATE INDEX IF NOT EXISTS idx_learning_goals_dates 
  ON public.learning_goals(start_date, end_date);

-- 番茄钟会话表索引
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id 
  ON public.pomodoro_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_study_record 
  ON public.pomodoro_sessions(study_record_id);

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_time 
  ON public.pomodoro_sessions(start_time, end_time);

-- 用户偏好表索引
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
  ON public.user_preferences(user_id);

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================

-- 学习目标表
CREATE OR REPLACE FUNCTION update_learning_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_learning_goals_updated_at
  BEFORE UPDATE ON public.learning_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_goals_updated_at();

-- 用户偏好表
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Profiles 表
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- ============================================
-- 注释说明
-- ============================================

COMMENT ON TABLE public.learning_goals IS '学习目标表：存储用户的每日/每周/每月学习目标';
COMMENT ON TABLE public.pomodoro_sessions IS '番茄钟会话表：记录每次番茄钟专注的详细信息';
COMMENT ON TABLE public.user_preferences IS '用户偏好表：存储用户的个性化设置';
COMMENT ON COLUMN public.learning_goals.goal_type IS '目标类型：daily(每日), weekly(每周), monthly(每月)';
COMMENT ON COLUMN public.pomodoro_sessions.status IS '会话状态：completed(完成), interrupted(中断), skipped(跳过)';
COMMENT ON COLUMN public.user_preferences.theme IS '主题设置：light(亮色), dark(暗色)';
