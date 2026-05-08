# Deep Chat AI 助手集成指南

## 📋 目录

- [概述](#概述)
- [技术架构](#技术架构)
- [第一步：组件封装](#第一步组件封装)
- [第二步：后端代理配置](#第二步后端代理配置)
- [第三步：RAG 知识库](#第三步rag-知识库)
- [第四步：悬浮助手](#第四步悬浮助手)
- [部署步骤](#部署步骤)
- [环境变量配置](#环境变量配置)
- [数据库迁移](#数据库迁移)
- [测试与验证](#测试与验证)
- [常见问题](#常见问题)

---

## 概述

本项目已成功集成 **Deep Chat** AI 助手，提供以下功能：

✅ **智能对话** - 基于 OpenAI GPT-4 的自然语言交互  
✅ **RAG 知识库** - 基于用户学习记录和笔记的智能检索  
✅ **悬浮助手** - 随时可唤起的浮动聊天窗口  
✅ **消息持久化** - 使用 localStorage 保存聊天历史  
✅ **移动端适配** - 响应式设计，支持各种屏幕尺寸  

---

## 技术架构

```
┌─────────────────────────────────────────────────┐
│              Vue 3 Frontend                      │
│  ┌──────────────┐    ┌──────────────────────┐   │
│  │ FloatingChat │───▶│    AiChat.vue        │   │
│  │  (UI Layer)  │    │  (Deep Chat Wrapper) │   │
│  └──────────────┘    └──────────┬───────────┘   │
│                                 │                │
│                    ┌────────────▼───────────┐   │
│                    │   chat.ts (Pinia)      │   │
│                    │  (Message Persistence) │   │
│                    └────────────────────────┘   │
└─────────────────────────┬───────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────┐
│         Supabase Edge Functions                  │
│  ┌──────────────────┐    ┌──────────────────┐   │
│  │   ai-proxy       │───▶│  rag-search      │   │
│  │ (OpenAI Proxy)   │    │ (Vector Search)  │   │
│  └──────────────────┘    └────────┬─────────┘   │
└───────────────────────────────────┼─────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────┐
│           Supabase Database                      │
│  ┌──────────────────┐    ┌──────────────────┐   │
│  │ study_records    │    │ learning_notes   │   │
│  │ (with embedding) │    │ (with embedding) │   │
│  └──────────────────┘    └──────────────────┘   │
│         pgvector Extension                      │
└─────────────────────────────────────────────────┘
```

---

## 第一步：组件封装

### 1.1 AiChat.vue - Deep Chat Vue 组件

**位置**: `src/components/AiChat.vue`

该组件是 Deep Chat Web Component 的 Vue 封装，主要功能：

- 配置请求处理器连接到 Supabase Edge Function
- 定义 RAG 工具指令（`rag_tool`）
- 实现响应拦截器处理工具调用
- 支持初始消息加载和新消息事件

**关键代码**:

```vue
<template>
  <deep-chat
    ref="chatElement"
    :style="{ height: '100%', width: '100%' }"
    :initial-messages="initialMessages"
    :request="requestConfig"
    @new-message="handleNewMessage"
    :response-interceptor="responseInterceptor"
    :directives="directives"
  />
</template>
```

### 1.2 FloatingChat.vue - 悬浮聊天助手

**位置**: `src/components/FloatingChat.vue`

提供浮动按钮和聊天弹窗 UI：

- 右下角固定浮动按钮
- 点击展开聊天窗口
- 未读消息计数徽章
- 平滑动画过渡效果
- 移动端响应式适配

**已集成到**: `src/layouts/DashboardLayout.vue`

---

## 第二步：后端代理配置

### 2.1 ai-proxy Edge Function

**位置**: `supabase/functions/ai-proxy/index.ts`

**功能**:
- 验证用户身份（JWT Token）
- 代理请求到 OpenAI API
- 处理函数调用（Function Calling）
- 协调 RAG 搜索流程

**安全特性**:
- ✅ 不暴露 API Key 给前端
- ✅ 用户身份验证
- ✅ CORS 支持
- ✅ 错误处理和日志记录

**工作流程**:

```
1. 接收前端请求
2. 验证用户身份
3. 调用 OpenAI API（带工具定义）
4. 如果 AI 返回工具调用：
   a. 解析工具参数
   b. 调用 rag-search 函数
   c. 将结果返回给 AI
   d. 获取最终回复
5. 返回响应给前端
```

### 2.2 部署 Edge Function

```bash
# 登录 Supabase CLI
supabase login

# 链接到你的项目
supabase link --project-ref YOUR_PROJECT_REF

# 部署 ai-proxy 函数
supabase functions deploy ai-proxy

# 部署 rag-search 函数
supabase functions deploy rag-search
```

---

## 第三步：RAG 知识库

### 3.1 rag-search Edge Function

**位置**: `supabase/functions/rag-search/index.ts`

**功能**:
- 生成查询文本的向量嵌入（使用 OpenAI Embeddings）
- 执行向量相似度搜索（pgvector）
- 回退到文本搜索（如果向量搜索失败）
- 返回相关的学习记录

**搜索策略**:

1. **向量搜索**（优先）
   - 使用 cosine similarity
   - 阈值：0.7
   - 最多返回 5 条结果

2. **文本搜索**（回退）
   - ILIKE 模糊匹配
   - 搜索标题和内容字段

### 3.2 数据库迁移

**位置**: `supabase/migrations/20240101_enable_pgvector.sql`

**包含**:
- 启用 pgvector 扩展
- 为 `study_records` 和 `learning_notes` 表添加 embedding 字段
- 创建 `search_similar_records` 存储过程
- 创建向量索引（IVFFlat）

**执行迁移**:

```bash
# 通过 Supabase Dashboard 执行 SQL
# 或使用 CLI
supabase db push
```

### 3.3 向量嵌入生成

当用户创建或更新学习记录时，需要生成向量嵌入：

```typescript
// 示例：在保存学习记录时生成嵌入
async function generateAndSaveEmbedding(recordId: string, content: string) {
  const session = await supabase.auth.getSession();
  const { data, error } = await supabase.functions.invoke('generate-embedding', {
    body: { text: content },
    headers: {
      Authorization: `Bearer ${session.data.session?.access_token}`,
    },
  });
  
  if (error) throw error;
  
  // 更新记录的 embedding 字段
  await supabase
    .from('study_records')
    .update({ embedding: data.embedding })
    .eq('id', recordId);
}
```

> **注意**: 你需要创建一个额外的 Edge Function 来生成嵌入，或在应用层使用 `@xenova/transformers` 库生成本地向量。

---

## 第四步：悬浮助手

### 4.1 消息持久化

**位置**: `src/stores/chat.ts`

使用 Pinia Store 管理聊天状态：

- 自动保存到 localStorage
- 最多保存 100 条消息
- 支持消息增删改查
- 深度监听自动同步

**消息格式**:

```typescript
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}
```

### 4.2 全局集成

FloatingChat 已集成到 `DashboardLayout.vue`：

```vue
<template>
  <div class="flex h-full w-full max-w-full transition-colors">
    <NavDrawer v-model="open" />
    <div class="...">
      <AppTopBar v-model="open" />
      <main>
        <router-view />
      </main>
      <AppFooter />
    </div>
    <!-- AI 助手 -->
    <FloatingChat />
  </div>
</template>
```

---

## 部署步骤

### 前置条件

1. ✅ Node.js >= 16.0.0
2. ✅ Supabase 账号和项目
3. ✅ OpenAI API Key

### 步骤 1：安装依赖

```bash
npm install
```

> deep-chat 已在 package.json 中（版本 2.4.2）

### 步骤 2：配置环境变量

创建 `.env` 文件：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 步骤 3：配置 Edge Function Secrets

在 Supabase Dashboard 中配置：

1. 进入 **Edge Functions** → **Manage Secrets**
2. 添加以下密钥：
   - `OPENAI_API_KEY`: 你的 OpenAI API Key
   - `OPENAI_MODEL`: `gpt-4` 或 `gpt-3.5-turbo`

或通过 CLI：

```bash
supabase secrets set OPENAI_API_KEY=sk-your-key
supabase secrets set OPENAI_MODEL=gpt-4
```

### 步骤 4：执行数据库迁移

```bash
# 方法 1：通过 Supabase Dashboard
# 复制 supabase/migrations/20240101_enable_pgvector.sql 的内容
# 在 SQL Editor 中执行

# 方法 2：通过 CLI
supabase db push
```

### 步骤 5：部署 Edge Functions

```bash
# 部署 ai-proxy
supabase functions deploy ai-proxy

# 部署 rag-search
supabase functions deploy rag-search
```

### 步骤 6：启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 测试应用。

### 步骤 7：生产构建

```bash
npm run build
```

部署到 Vercel、Netlify 或其他静态托管服务。

---

## 环境变量配置

### 前端环境变量 (.env)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Edge Function Secrets

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `OPENAI_API_KEY` | OpenAI API Key | `sk-xxxxxxxxx` |
| `OPENAI_MODEL` | 使用的模型 | `gpt-4` 或 `gpt-3.5-turbo` |
| `SUPABASE_URL` | Supabase 项目 URL | 自动注入 |
| `SUPABASE_ANON_KEY` | Supabase Anon Key | 自动注入 |

---

## 数据库迁移

### pgvector 扩展

确保你的 Supabase 项目已启用 pgvector：

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 表结构

#### study_records 表

```sql
ALTER TABLE study_records 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE INDEX IF NOT EXISTS idx_study_records_embedding 
ON study_records USING ivfflat (embedding vector_cosine_ops);
```

#### learning_notes 表

```sql
ALTER TABLE learning_notes 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE INDEX IF NOT EXISTS idx_learning_notes_embedding 
ON learning_notes USING ivfflat (embedding vector_cosine_ops);
```

### 相似度搜索函数

```sql
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
```

---

## 测试与验证

### 1. 测试 AI 对话

1. 登录应用
2. 点击右下角的聊天按钮
3. 输入问题，例如："你好"
4. 确认收到 AI 回复

### 2. 测试 RAG 功能

1. 确保数据库中有学习记录
2. 询问与学习记录相关的问题，例如："我最近学习了什么？"
3. 检查 AI 是否引用了你的学习记录

### 3. 测试消息持久化

1. 发送几条消息
2. 刷新页面
3. 打开聊天窗口，确认历史消息仍然存在

### 4. 测试移动端适配

1. 使用浏览器开发者工具切换到移动设备模式
2. 确认浮动按钮和聊天窗口正常显示
3. 测试触控交互

---

## 常见问题

### Q1: Deep Chat 组件不显示

**解决方案**:
- 检查 `deep-chat` 是否正确安装：`npm list deep-chat`
- 确认 CSS 已导入：`import "deep-chat/index.css"`
- 检查浏览器控制台是否有错误

### Q2: Edge Function 返回 401 错误

**解决方案**:
- 确认用户已登录
- 检查 Supabase Session 是否有效
- 验证 Edge Function 的 CORS 配置

### Q3: RAG 搜索返回空结果

**解决方案**:
- 确认数据库中有学习记录
- 检查 `embedding` 字段是否有值
- 验证 `search_similar_records` 函数是否存在
- 降低 `match_threshold` 值（例如从 0.7 改为 0.5）

### Q4: 消息未持久化

**解决方案**:
- 检查浏览器是否禁用了 localStorage
- 确认 Pinia Store 已正确初始化
- 检查浏览器控制台是否有存储错误

### Q5: OpenAI API 调用失败

**解决方案**:
- 验证 `OPENAI_API_KEY` 是否正确配置
- 检查 OpenAI 账户余额
- 查看 Edge Function 日志：`supabase functions logs ai-proxy`

### Q6: 向量搜索性能慢

**解决方案**:
- 确认已创建 IVFFlat 索引
- 增加 `lists` 参数以提高索引质量
- 考虑使用 HNSW 索引（适合更大规模数据）

```sql
-- 创建 HNSW 索引
CREATE INDEX idx_study_records_embedding_hnsw 
ON study_records USING hnsw (embedding vector_cosine_ops);
```

---

## 下一步优化建议

### 1. 流式响应

实现打字机效果的流式输出：

```typescript
// 在 ai-proxy 中使用 stream: true
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { ... },
  body: JSON.stringify({
    model: OPENAI_MODEL,
    messages: [...],
    stream: true, // 启用流式响应
  }),
});
```

### 2. 多模态支持

添加图片和文件上传功能：

```vue
<deep-chat
  :file-upload="true"
  :camera="true"
  :microphone="true"
/>
```

### 3. 自定义主题

根据应用主题动态调整聊天界面：

```typescript
const themeConfig = computed(() => ({
  styles: {
    chat: {
      backgroundColor: isDark.value ? '#1f2937' : '#ffffff',
    },
  },
}));
```

### 4. 语音输入/输出

集成 Web Speech API：

```typescript
// 语音识别
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  // 发送到 AI
};
```

### 5. 知识库增强

- 支持 PDF、Word 文档上传和解析
- 自动提取网页内容
- 定期重新索引知识库

---

## 参考资料

- [Deep Chat 官方文档](https://deepchat.dev/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [pgvector 文档](https://github.com/pgvector/pgvector)
- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [Pinia 文档](https://pinia.vuejs.org/)

---

## 许可证

本项目遵循 MIT 许可证。

---

**最后更新**: 2026-05-08  
**维护者**: vuepabase 团队
