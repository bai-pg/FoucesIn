# ✅ 头像上传功能配置检查清单

## 📋 配置步骤

在开始使用头像上传功能前,请确保完成以下配置:

---

### 1️⃣ Supabase Storage Bucket 创建

- [ ] 登录 [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] 选择你的项目
- [ ] 左侧菜单 → **Storage**
- [ ] 点击 **"New bucket"**
- [ ] 填写配置:
  - [ ] Name: `avatars`
  - [ ] Public bucket: ✅ **勾选**
  - [ ] File size limit: `2097152` (2MB, 可选)
  - [ ] Allowed MIME types: `image/jpeg,image/png,image/gif,image/webp` (可选)
- [ ] 点击 **"Create bucket"**
- [ ] 确认 bucket 已创建成功

**验证方法:**
```
Storage 列表中应该看到 "avatars" bucket
状态显示为 "Public"
```

---

### 2️⃣ RLS 策略配置

- [ ] 进入 **SQL Editor**
- [ ] 打开文件 [`supabase_storage_avatars.sql`](./supabase_storage_avatars.sql)
- [ ] 复制并执行以下内容:

```sql
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

-- 允许所有人公开读取头像
CREATE POLICY "允许公开读取头像"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

**验证方法:**
```sql
-- 查询已创建的策略
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';

-- 应该返回 4 条记录
```

---

### 3️⃣ 数据库字段检查

- [ ] 确认 `profiles` 表存在 `avatar_url` 字段

**检查 SQL:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'avatar_url';
```

**如果字段不存在,执行:**
```sql
ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
COMMENT ON COLUMN profiles.avatar_url IS '用户头像URL,指向Supabase Storage中的头像文件';
```

---

### 4️⃣ 前端代码验证

- [ ] 确认以下文件已更新:
  - [ ] [`src/components/UserSettingsPanel.vue`](./src/components/UserSettingsPanel.vue)
  - [ ] [`src/views/records/composables/useUserProfile.ts`](./src/views/records/composables/useUserProfile.ts)

- [ ] 检查导入路径是否正确:
  ```typescript
  import { useUserProfile } from '@/views/records/composables/useUserProfile';
  ```

- [ ] 确认图标已导入:
  ```typescript
  import { Edit, UserFilled, Camera } from '@element-plus/icons-vue';
  ```

---

### 5️⃣ 环境变量检查

- [ ] 确认 `.env` 文件中配置了 Supabase 凭证:
  ```env
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_KEY=your-anon-key
  ```

- [ ] 重启开发服务器:
  ```bash
  npm run dev
  ```

---

## 🧪 功能测试

### 测试 1: 查看模式上传

1. - [ ] 登录应用
2. - [ ] 点击右上角 ⚙️ 设置按钮
3. - [ ] 将鼠标悬停在头像上
4. - [ ] 确认看到 📷 相机图标
5. - [ ] 点击相机图标
6. - [ ] 选择一张图片(≤ 2MB)
7. - [ ] 等待上传完成
8. - [ ] 确认头像立即更新
9. - [ ] 确认显示"头像上传成功"提示

---

### 测试 2: 编辑模式上传

1. - [ ] 打开设置面板
2. - [ ] 点击"编辑资料"按钮
3. - [ ] 找到"头像"字段
4. - [ ] 点击"上传头像"或"更换头像"按钮
5. - [ ] 选择一张图片
6. - [ ] 等待上传完成
7. - [ ] 确认头像预览更新
8. - [ ] 修改昵称和简介
9. - [ ] 点击"保存"
10. - [ ] 确认所有修改保存成功

---

### 测试 3: 文件验证

1. - [ ] 尝试上传非图片文件(如 .txt)
   - 预期: 提示"只能上传图片文件"
   
2. - [ ] 尝试上传超过 2MB 的图片
   - 预期: 提示"图片大小不能超过 2MB"
   
3. - [ ] 上传正常图片
   - 预期: 上传成功

---

### 测试 4: 旧头像清理

1. - [ ] 上传第一张头像
2. - [ ] 记录 Supabase Storage 中的文件数量
3. - [ ] 上传第二张头像
4. - [ ] 确认旧文件已被删除
5. - [ ] Storage 中应该只有最新的头像文件

---

### 测试 5: 取消编辑

1. - [ ] 进入编辑模式
2. - [ ] 上传新头像
3. - [ ] 点击"取消"按钮
4. - [ ] 确认头像恢复为原来的

---

## 🔍 故障排查

### 问题 1: 看不到相机图标

**可能原因:**
- 图标未正确导入
- CSS 样式问题

**解决方案:**
```typescript
// 确认已导入 Camera 图标
import { Camera } from '@element-plus/icons-vue';
```

---

### 问题 2: 点击上传无反应

**可能原因:**
- file input 未正确绑定
- 浏览器兼容性问题

**解决方案:**
1. 检查控制台是否有错误
2. 确认 `avatarInput` ref 正确绑定
3. 尝试在不同浏览器测试

---

### 问题 3: 上传失败

**检查步骤:**
1. - [ ] 打开浏览器开发者工具 → Network 面板
2. - [ ] 查看上传请求的响应
3. - [ ] 检查错误信息

**常见错误:**
- `Bucket not found`: 未创建 avatars bucket
- `Permission denied`: RLS 策略未配置
- `File too large`: 文件超过 2MB

---

### 问题 4: 上传成功但头像不显示

**可能原因:**
- 浏览器缓存
- avatar_url 未保存到数据库

**解决方案:**
1. 硬刷新页面 (Ctrl+Shift+R)
2. 检查数据库中 profiles 表的 avatar_url 字段
3. 直接在浏览器中打开 avatar_url 链接

---

## 📊 配置完成确认

完成以上所有步骤后,请确认:

- [ ] Supabase Storage 中 `avatars` bucket 已创建
- [ ] 4 条 RLS 策略已配置
- [ ] `profiles` 表有 `avatar_url` 字段
- [ ] 前端代码已更新
- [ ] 所有测试用例通过
- [ ] 无控制台错误

**恭喜! 🎉 头像上传功能配置完成!**

---

## 📞 需要帮助?

如果遇到问题:

1. 查阅 [`AVATAR_UPLOAD_GUIDE.md`](./AVATAR_UPLOAD_GUIDE.md) 详细文档
2. 检查 Supabase Dashboard 中的 Logs
3. 查看浏览器控制台错误信息
4. 联系开发团队

---

**检查清单版本:** v1.0.0  
**最后更新:** 2026-05-06