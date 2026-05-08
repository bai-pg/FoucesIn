-- ============================================
-- 学习追踪系统 - 基础数据库脚本
-- 创建所有必需的基础表
-- ============================================

-- 1. 用户资料表
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 学习记录表
CREATE TABLE IF NOT EXISTS public.study_records (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  subject TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  notes TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'pomodoro')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 如果 study_records 表已存在但缺少 source 字段，添加它
ALTER TABLE public.study_records 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'pomodoro'));

-- 3. 工作流表（已存在，保留）
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB DEFAULT '[]'::jsonb NOT NULL,
  edges JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================
-- 索引优化
-- ============================================

-- 学习记录表索引
CREATE INDEX IF NOT EXISTS idx_study_records_user_id 
  ON public.study_records(user_id);

CREATE INDEX IF NOT EXISTS idx_study_records_date 
  ON public.study_records(date DESC);

CREATE INDEX IF NOT EXISTS idx_study_records_subject 
  ON public.study_records(subject);

-- 工作流表索引
CREATE INDEX IF NOT EXISTS idx_workflows_user_id 
  ON public.workflows(user_id);

CREATE INDEX IF NOT EXISTS idx_workflows_updated_at 
  ON public.workflows(updated_at DESC);

-- ============================================
-- 行级安全策略 (RLS)
-- ============================================

-- Profiles 表 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" 
          ON public.profiles FOR SELECT 
          USING (auth.uid() = id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" 
          ON public.profiles FOR INSERT 
          WITH CHECK (auth.uid() = id);
    END IF;
END $$;

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

-- 学习记录表 RLS
ALTER TABLE public.study_records ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'study_records' 
        AND policyname = 'Users can view own records'
    ) THEN
        CREATE POLICY "Users can view own records" 
          ON public.study_records FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'study_records' 
        AND policyname = 'Users can insert own records'
    ) THEN
        CREATE POLICY "Users can insert own records" 
          ON public.study_records FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'study_records' 
        AND policyname = 'Users can update own records'
    ) THEN
        CREATE POLICY "Users can update own records" 
          ON public.study_records FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'study_records' 
        AND policyname = 'Users can delete own records'
    ) THEN
        CREATE POLICY "Users can delete own records" 
          ON public.study_records FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- 工作流表 RLS（检查后创建，不破坏现有策略）
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'workflows' 
        AND policyname = 'Users can view their own workflows'
    ) THEN
        CREATE POLICY "Users can view their own workflows"
          ON public.workflows FOR SELECT
          USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'workflows' 
        AND policyname = 'Users can insert their own workflows'
    ) THEN
        CREATE POLICY "Users can insert their own workflows"
          ON public.workflows FOR INSERT
          WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'workflows' 
        AND policyname = 'Users can update their own workflows'
    ) THEN
        CREATE POLICY "Users can update their own workflows"
          ON public.workflows FOR UPDATE
          USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'workflows' 
        AND policyname = 'Users can delete their own workflows'
    ) THEN
        CREATE POLICY "Users can delete their own workflows"
          ON public.workflows FOR DELETE
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profiles 表触发器
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 学习记录表不需要 updated_at 触发器（记录创建后不修改）

-- 工作流表触发器
DROP TRIGGER IF EXISTS update_workflows_updated_at ON public.workflows;
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 注释说明
-- ============================================

COMMENT ON TABLE public.profiles IS '用户资料表：存储用户的基本信息';
COMMENT ON TABLE public.study_records IS '学习记录表：记录用户的学习时间和科目';
COMMENT ON TABLE public.workflows IS '工作流表：存储用户创建的可视化工作流';
COMMENT ON COLUMN public.study_records.source IS '记录来源：manual(手动添加), pomodoro(番茄钟)';
