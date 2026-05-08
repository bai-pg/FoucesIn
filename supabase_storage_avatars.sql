-- ============================================
-- Supabase Storage Bucket 配置脚本
-- 用于头像上传功能
-- ============================================

-- 1. 创建 avatars bucket (如果不存在)
-- 注意: 此操作需要在 Supabase Dashboard 中手动执行,或通过 Management API
-- SQL 无法直接创建 bucket,以下仅为参考说明

/*
在 Supabase Dashboard 中创建 Bucket 的步骤:

1. 登录 Supabase Dashboard
2. 选择你的项目
3. 左侧菜单 → Storage
4. 点击 "New bucket"
5. 配置如下:
   - Name: avatars
   - Public bucket: ✅ 勾选 (允许公开访问)
   - File size limit: 2097152 (2MB, 可选)
   - Allowed MIME types: image/jpeg,image/png,image/gif,image/webp (可选)
6. 点击 "Create bucket"
*/

-- 2. 配置 RLS (Row Level Security) 策略
-- 确保只有认证用户可以上传和删除自己的头像

-- 允许认证用户上传文件
CREATE POLICY "允许认证用户上传头像"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许认证用户更新自己的文件
CREATE POLICY "允许认证用户更新头像"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许认证用户删除自己的文件
CREATE POLICY "允许认证用户删除头像"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许所有人公开读取头像(因为头像URL是公开的)
CREATE POLICY "允许公开读取头像"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 3. 验证配置
-- 查询已创建的策略
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';

-- 4. profiles 表添加 avatar_url 字段(如果不存在)
-- 注意: 如果已存在则跳过此步骤
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- 5. 为 avatar_url 添加注释
COMMENT ON COLUMN profiles.avatar_url IS '用户头像URL,指向Supabase Storage中的头像文件';

-- ============================================
-- 配置完成!
-- ============================================

/*
使用说明:

1. 在 Supabase Dashboard 中手动创建 'avatars' bucket
2. 在 SQL Editor 中执行上述 RLS 策略配置
3. 确保 profiles 表有 avatar_url 字段
4. 前端即可正常使用头像上传功能

前端调用示例:
```typescript
const { uploadAvatar } = useUserProfile();
const avatarUrl = await uploadAvatar(userId, file);
await updateProfile(userId, { avatar_url: avatarUrl });
```
*/