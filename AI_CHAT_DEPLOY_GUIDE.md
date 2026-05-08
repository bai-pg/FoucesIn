# AI 聊天助手部署指南

本文档指导你如何部署 AI 聊天助手到 Supabase。

## 目录结构

```
supabase/
├── config.toml                  # Edge Functions 配置
├── migrations/
│   └── 20240101_enable_pgvector.sql  # pgvector 迁移文件
└── functions/
    ├── ai-proxy/
    │   └── index.ts             # AI 代理 Edge Function
    └── rag-search/
        └── index.ts             # RAG 搜索 Edge Function
```

## 部署步骤

### 1. 安装 Supabase CLI

```bash
npm install -g supabase
```

### 2. 登录 Supabase

```bash
supabase login
```

### 3. 链接到你的 Supabase 项目

```bash
supabase link --project-ref <your-project-ref>
```

### 4. 设置环境变量

在 Supabase Dashboard 的 Edge Functions 设置中，添加以下环境变量：

```
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
DEEPSEEK_MODEL=deepseek-chat  # 或其他 DeepSeek 模型
```

### 5. 运行数据库迁移

```bash
supabase db push
```

这将会：

- 启用 pgvector 扩展
- 为学习记录表添加向量字段
- 创建相似度搜索函数
- 创建向量索引

### 6. 部署 Edge Functions

```bash
# 部署 ai-proxy 函数
supabase functions deploy ai-proxy

# 部署 rag-search 函数
supabase functions deploy rag-search
```

### 7. 在项目中添加环境变量

在 `.env` 文件中确保有以下配置：

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_KEY=your-supabase-anon-key
```

## 前端组件说明

### AiChat.vue

- 封装 Deep Chat Web Component
- 通过 Supabase Functions Client 调用 Edge Functions
- 支持 RAG 工具调用

### FloatingChat.vue

- 浮动按钮 + 弹窗布局
- 使用 Pinia Store 持久化聊天消息
- 支持未读消息计数

### chat.ts (Pinia Store)

- 管理聊天消息状态
- 使用 localStorage 持久化
- 支持添加、删除、清空消息

## 测试部署

1. 启动前端开发服务器：

```bash
npm run dev
```

2. 登录应用后，在右下角应该能看到浮动聊天按钮

3. 点击按钮，打开 AI 聊天窗口

4. 发送消息测试 AI 连接

## 故障排查

### Edge Function 返回 401

- 检查用户是否已登录
- 确认 Supabase Anon Key 配置正确

### 向量搜索无结果

- 确认已运行数据库迁移
- 检查学习记录是否有 embedding 字段
- 确保已生成并存储了向量嵌入

### AI 响应失败

- 检查 DEEPSEEK_API_KEY 是否已设置
- 确认 Edge Functions 已成功部署
- 查看 Supabase Logs 获取详细错误信息

## 下一步（可选）

### 1. 添加向量嵌入生成

当用户创建新的学习记录时，自动生成向量嵌入：

```typescript
// 在创建记录时调用
const { data, error } = await supabase.functions.invoke("generate-embedding", {
  body: { text: recordContent },
});
```

### 2. 支持更多数据源

可以扩展 rag-search 函数，同时搜索：

- 学习笔记 (learning_notes)
- 目标记录 (goals)
- 番茄钟记录 (pomodoro_sessions)

### 3. 添加文件上传支持

使用 Supabase Storage 存储 PDF、图片等文件，并通过 OCR 提取文本。

## 安全注意事项

1. **API Key 安全**: 永远不要将 OpenAI API Key 暴露在前端代码中
2. **用户认证**: Edge Functions 会验证 JWT Token，确保只有登录用户能访问
3. **数据隔离**: 向量搜索时严格限制 user_id，防止数据泄露
