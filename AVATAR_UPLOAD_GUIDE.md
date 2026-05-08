# 📸 头像上传功能使用指南

## ✨ 功能概述

项目已集成完整的头像上传功能,用户可以通过设置面板轻松上传和更换个人头像。

---

## 🎯 功能特性

- ✅ **双入口设计**: 查看模式和编辑模式均可上传头像
- ✅ **实时预览**: 上传后立即显示新头像
- ✅ **自动清理**: 上传新头像时自动删除旧头像,节省存储空间
- ✅ **文件验证**: 自动检查文件类型和大小
- ✅ **友好提示**: 上传过程有 loading 状态和成功/失败提示
- ✅ **安全可靠**: 基于 Supabase Storage + RLS 策略保护

---

## 🚀 快速开始

### 1️⃣ 配置 Supabase Storage (首次使用)

**方式一: 通过 Dashboard 手动配置(推荐)**

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 左侧菜单 → **Storage**
4. 点击 **"New bucket"**
5. 配置如下:
   ```
   Name: avatars
   Public bucket: ✅ 勾选
   File size limit: 2097152 (2MB, 可选)
   Allowed MIME types: image/jpeg,image/png,image/gif,image/webp (可选)
   ```
6. 点击 **"Create bucket"**

6. 进入 **SQL Editor**
7. 执行 [`supabase_storage_avatars.sql`](./supabase_storage_avatars.sql) 中的 RLS 策略配置

**方式二: 使用 SQL 脚本自动配置**

在项目根目录执行:
```bash
# 连接到 Supabase SQL Editor
# 复制并执行 supabase_storage_avatars.sql 中的所有内容
```

---

### 2️⃣ 使用头像上传功能

#### 方法一: 查看模式快速上传

1. 点击右上角 **⚙️ 设置按钮**
2. 在"个人资料"标签页中
3. 将鼠标悬停在头像上
4. 点击右下角的 **📷 相机图标**
5. 选择图片文件
6. 等待上传完成

![查看模式头像上传](./docs/avatar-upload-view-mode.png)

#### 方法二: 编辑模式中上传

1. 点击右上角 **⚙️ 设置按钮**
2. 点击 **"编辑资料"** 按钮
3. 在表单中找到"头像"字段
4. 点击 **"上传头像"** 或 **"更换头像"** 按钮
5. 选择图片文件
6. 等待上传完成
7. 点击 **"保存"** 保存其他资料修改

![编辑模式头像上传](./docs/avatar-upload-edit-mode.png)

---

## 📋 文件要求

| 属性 | 要求 |
|------|------|
| **文件格式** | JPG、PNG、GIF、WebP |
| **文件大小** | ≤ 2MB |
| **推荐尺寸** | 200x200px 或更大(正方形最佳) |
| **最小尺寸** | 50x50px |

---

## 🔧 技术实现

### 前端实现

**核心文件:**
- [`src/components/UserSettingsPanel.vue`](./src/components/UserSettingsPanel.vue) - 用户设置面板
- [`src/views/records/composables/useUserProfile.ts`](./src/views/records/composables/useUserProfile.ts) - 用户资料管理

**关键函数:**

```typescript
// 上传头像
const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  // 1. 验证文件类型和大小
  // 2. 生成唯一文件名: {userId}_{timestamp}.{ext}
  // 3. 上传到 Supabase Storage 'avatars' bucket
  // 4. 返回公共访问URL
};

// 删除旧头像
const deleteOldAvatar = async (avatarUrl: string) => {
  // 从URL提取文件路径并删除
};
```

**使用示例:**

```typescript
import { useUserProfile } from '@/views/records/composables/useUserProfile';

const { uploadAvatar, updateProfile } = useUserProfile();

// 上传新头像
const handleUpload = async (file: File) => {
  const userId = 'user-uuid';
  
  try {
    // 1. 上传文件
    const avatarUrl = await uploadAvatar(userId, file);
    
    // 2. 更新数据库
    await updateProfile(userId, { avatar_url: avatarUrl });
    
    console.log('头像上传成功:', avatarUrl);
  } catch (error) {
    console.error('上传失败:', error);
  }
};
```

### 后端配置

**Storage Bucket:**
- Name: `avatars`
- Public: `true`
- Path: `avatars/{userId}_{timestamp}.{ext}`

**RLS 策略:**
```sql
-- 允许认证用户上传自己的头像
CREATE POLICY "允许认证用户上传头像"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许公开读取(头像URL公开)
CREATE POLICY "允许公开读取头像"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');
```

**数据库字段:**
```sql
ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
```

---

## 🐛 常见问题

### Q1: 上传失败,提示 "Bucket not found"

**原因:** Supabase Storage 中未创建 `avatars` bucket

**解决方案:**
1. 登录 Supabase Dashboard
2. 进入 Storage → New bucket
3. 创建名为 `avatars` 的 bucket
4. 确保勾选 "Public bucket"

---

### Q2: 上传失败,提示 "Permission denied"

**原因:** RLS 策略未正确配置

**解决方案:**
1. 进入 Supabase Dashboard → SQL Editor
2. 执行 `supabase_storage_avatars.sql` 中的 RLS 策略
3. 确认策略已创建:
   ```sql
   SELECT * FROM storage.policies WHERE bucket_id = 'avatars';
   ```

---

### Q3: 上传成功但头像不显示

**原因:** 
- 浏览器缓存
- avatar_url 未正确保存到数据库

**解决方案:**
1. 硬刷新页面 (Ctrl+Shift+R / Cmd+Shift+R)
2. 检查数据库中 profiles 表的 avatar_url 字段是否有值
3. 直接在浏览器中打开 avatar_url 链接,确认图片可访问

---

### Q4: 如何删除头像?

**当前实现:** 暂不支持直接删除头像,但可以上传默认头像或空白图片替代

**未来优化:** 可以添加"删除头像"按钮,将 avatar_url 设为 NULL

---

### Q5: 支持哪些图片格式?

**支持的格式:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

**不支持的格式:**
- BMP
- TIFF
- SVG
- PSD

---

## 🎨 UI 说明

### 查看模式

```
┌─────────────────────────────────┐
│  ┌──────┐                       │
│  │ 👤   │ 📷 ← 点击此处上传     │
│  └──────┘                       │
│                                 │
│  点击头像可更换                  │
│  [编辑资料]                     │
└─────────────────────────────────┘
```

### 编辑模式

```
┌─────────────────────────────────┐
│ 头像:                           │
│  ┌──────┐ [更换头像]            │
│  │ 👤   │                       │
│  └──────┘                       │
│  支持 JPG、PNG 格式,≤ 2MB       │
│                                 │
│ 昵称: [____________]            │
│ 邮箱: user@example.com (只读)   │
│ 简介: [____________]            │
│                                 │
│         [保存] [取消]           │
└─────────────────────────────────┘
```

---

## 📊 存储管理

### 文件命名规则

```
avatars/{userId}_{timestamp}.{ext}

示例:
avatars/550e8400-e29b-41d4-a716-446655440000_1714982400000.jpg
```

### 空间占用估算

| 头像数量 | 平均大小 | 总空间 |
|---------|---------|--------|
| 100     | 50KB    | ~5MB   |
| 1000    | 50KB    | ~50MB  |
| 10000   | 50KB    | ~500MB |

**注意:** 
- Supabase Free Tier 提供 1GB 存储空间
- 每次上传新头像会自动删除旧头像,避免浪费
- 建议定期清理未使用的头像文件

---

## 🔒 安全说明

### 文件验证

前端和后端均实施验证:

**前端验证:**
```typescript
// 文件类型检查
if (!file.type.startsWith('image/')) {
  throw new Error('只能上传图片文件');
}

// 文件大小检查(2MB)
if (file.size > 2 * 1024 * 1024) {
  throw new Error('图片大小不能超过 2MB');
}
```

**后端验证(RLS):**
```sql
-- 确保用户只能操作自己的文件
auth.uid()::text = (storage.foldername(name))[1]
```

### 访问控制

- ✅ 认证用户可上传/更新/删除自己的头像
- ✅ 所有人可公开读取头像(头像URL公开)
- ❌ 匿名用户不可上传
- ❌ 用户A不可操作用户B的头像

---

## 🚀 性能优化建议

### 1. 图片压缩

上传前在前端压缩图片:

```typescript
import Compressor from 'compressorjs';

new Compressor(file, {
  quality: 0.8,
  maxWidth: 400,
  maxHeight: 400,
  success(result) {
    uploadAvatar(userId, result);
  }
});
```

### 2. CDN 加速

Supabase 自带 CDN,头像URL已优化:
```
https://{project-id}.supabase.co/storage/v1/object/public/avatars/...
```

### 3. 浏览器缓存

设置适当的 Cache-Control:
```typescript
await supabase.storage
  .from('avatars')
  .upload(filePath, file, {
    cacheControl: '3600', // 1小时
    upsert: true
  });
```

---

## 📝 更新日志

### v1.0.0 (2026-05-06)
- ✅ 初始版本发布
- ✅ 支持查看模式和编辑模式上传
- ✅ 自动删除旧头像
- ✅ 文件类型和大小验证
- ✅ RLS 策略保护

---

## 🤝 贡献指南

如需改进头像上传功能,欢迎提交 PR!

**可能的优化方向:**
- [ ] 添加图片裁剪功能
- [ ] 支持拖拽上传
- [ ] 添加头像预设模板
- [ ] 实现头像删除功能
- [ ] 添加上传进度条
- [ ] 支持批量上传(多头像切换)

---

## 📞 技术支持

如有问题,请:
1. 查阅本指南的"常见问题"部分
2. 检查 Supabase Dashboard 中的 Storage 配置
3. 查看浏览器控制台错误信息
4. 联系开发团队

---

**最后更新:** 2026-05-06  
**维护者:** Lingma AI Assistant