-- 启用 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 为学习记录表添加向量字段（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'study_records' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE study_records ADD COLUMN embedding vector(1536);
  END IF;
END $$;

-- 为笔记表添加向量字段（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'learning_notes' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE learning_notes ADD COLUMN embedding vector(1536);
  END IF;
END $$;

-- 创建相似度搜索函数
CREATE OR REPLACE FUNCTION search_similar_records(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  content text,
  category text,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sr.id,
    sr.user_id,
    sr.title,
    sr.content,
    sr.category,
    sr.created_at,
    1 - (sr.embedding <=> query_embedding) AS similarity
  FROM study_records sr
  WHERE sr.user_id = p_user_id
    AND sr.embedding IS NOT NULL
    AND 1 - (sr.embedding <=> query_embedding) > match_threshold
  ORDER BY sr.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 创建向量索引以提高搜索性能
CREATE INDEX IF NOT EXISTS idx_study_records_embedding 
ON study_records USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_learning_notes_embedding 
ON learning_notes USING ivfflat (embedding vector_cosine_ops);
