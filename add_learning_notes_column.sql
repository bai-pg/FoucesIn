-- ============================================
-- 学习笔记功能 - 数据库迁移脚本
-- 为 study_records 表添加 learning_notes 字段
-- 执行时间: 2026-05-07
-- ============================================

-- 添加 learning_notes 字段（富文本学习笔记）
ALTER TABLE public.study_records 
ADD COLUMN IF NOT EXISTS learning_notes TEXT;

-- 添加注释
COMMENT ON COLUMN public.study_records.learning_notes IS '富文本格式的学习笔记/反思日志，支持HTML格式';

-- 创建索引以优化查询性能（如果需要按笔记内容搜索）
CREATE INDEX IF NOT EXISTS idx_study_records_learning_notes 
  ON public.study_records(user_id) 
  WHERE learning_notes IS NOT NULL AND learning_notes != '';

-- 验证字段是否添加成功
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'study_records' 
  AND column_name = 'learning_notes';
