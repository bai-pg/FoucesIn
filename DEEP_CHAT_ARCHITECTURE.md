# Deep Chat 架构详解

## 🏗️ 系统架构概览

```
┌──────────────────────────────────────────────────────────────┐
│                     用户界面层 (UI Layer)                      │
│                                                               │
│  ┌────────────────┐         ┌──────────────────────────┐     │
│  │ FloatingChat   │◄────────┤   DashboardLayout.vue    │     │
│  │ 悬浮聊天按钮    │         │   (全局布局)              │     │
│  └───────┬────────┘         └──────────────────────────┘     │
│          │                                                     │
│          ▼                                                     │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              AiChat.vue                               │    │
│  │         (Deep Chat Web Component 封装)                │    │
│  │                                                       │    │
│  │  • 消息显示                                            │    │
│  │  • 用户输入                                            │    │
│  │  • 事件处理                                            │    │
│  └──────────────┬───────────────────────────────────────┘    │
└─────────────────┼───────────────────────────────────────────┘
                  │
                  │ @new-message 事件
                  ▼
┌──────────────────────────────────────────────────────────────┐
│                   状态管理层 (State Layer)                     │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           chat.ts (Pinia Store)                       │    │
│  │                                                       │    │
│  │  • messages: ChatMessage[]                            │    │
│  │  • addMessage()                                       │    │
│  │  • clearMessages()                                    │    │
│  │  • localStorage 持久化                                 │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                  │
                  │ HTTPS Request
                  ▼
┌──────────────────────────────────────────────────────────────┐
│                 后端服务层 (Backend Layer)                     │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │     Supabase Edge Function: ai-proxy                  │    │
│  │                                                       │    │
│  │  1. 验证用户身份 (JWT)                                 │    │
│  │  2. 转发请求到 OpenAI API                              │    │
│  │  3. 处理 Function Calling                             │    │
│  │  4. 协调 RAG 搜索流程                                  │    │
│  └──────────────┬───────────────────────────────────────┘    │
│                 │                                              │
│                 │ 调用 rag_tool                                │
│                 ▼                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │    Supabase Edge Function: rag-search                 │    │
│  │                                                       │    │
│  │  1. 生成查询向量 (OpenAI Embeddings)                   │    │
│  │  2. 执行向量相似度搜索 (pgvector)                      │    │
│  │  3. 返回相关学习记录                                   │    │
│  └──────────────┬───────────────────────────────────────┘    │
└─────────────────┼───────────────────────────────────────────┘
                  │
                  │ SQL Query
                  ▼
┌──────────────────────────────────────────────────────────────┐
│                  数据持久层 (Data Layer)                       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │          Supabase PostgreSQL Database                 │    │
│  │                                                       │    │
│  │  • study_records (with embedding vector)              │    │
│  │  • learning_notes (with embedding vector)             │    │
│  │  • pgvector extension                                 │    │
│  │  • search_similar_records() function                  │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## 📦 核心组件详解

### 1. AiChat.vue - Deep Chat 封装组件

**职责**:
- 将 Deep Chat Web Component 集成到 Vue 应用中
- 配置请求处理器连接到后端
- 处理工具调用和响应拦截

**关键属性**:

```typescript
interface AiChatProps {
  initialMessages?: any[];  // 初始历史消息
}

interface AiChatEvents {
  'new-message': (message: any) => void;  // 新消息事件
}
```

**请求配置**:

```typescript
const requestConfig = {
  url: "/functions/v1/ai-proxy",  // Supabase Edge Function URL
  method: "POST",
};
```

**工具定义**:

```typescript
const directives = [
  {
    name: "rag_tool",
    description: "查询用户的学习笔记和记录",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" }
      },
      required: ["query"]
    }
  }
];
```

**响应拦截器工作流程**:

```
接收 AI 响应
    ↓
检查是否有 tool_calls
    ↓
如果有 rag_tool 调用
    ↓
提取查询参数
    ↓
调用 rag-search Edge Function
    ↓
获取相关学习记录
    ↓
返回工具结果给 AI
    ↓
AI 生成最终回复
    ↓
返回给用户
```

---

### 2. FloatingChat.vue - 悬浮聊天助手

**职责**:
- 提供浮动按钮 UI
- 管理聊天窗口的显示/隐藏
- 格式化消息数据
- 跟踪未读消息计数

**状态管理**:

```typescript
const isChatOpen = ref(false);        // 聊天窗口是否打开
const unreadCount = ref(0);           // 未读消息数
const formattedMessages = computed(() => {
  // 将 store 消息转换为 Deep Chat 格式
  return chatStore.messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'ai',
    text: msg.content,
    timestamp: msg.timestamp
  }));
});
```

**消息处理**:

```typescript
const handleNewMessage = (message: any) => {
  // 转换消息格式
  const chatMessage: ChatMessage = {
    role: message.role === 'user' ? 'user' : 'assistant',
    content: message.text || '',
    timestamp: message.timestamp || Date.now()
  };
  
  // 保存到 store（自动持久化）
  chatStore.addMessage(chatMessage);
  
  // 如果窗口未打开，增加未读计数
  if (!isChatOpen.value) {
    unreadCount.value++;
  }
};
```

---

### 3. chat.ts - Pinia Store

**职责**:
- 管理聊天消息状态
- 持久化到 localStorage
- 提供消息操作方法

**数据结构**:

```typescript
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}
```

**核心方法**:

```typescript
// 添加消息（自动保存）
addMessage(message: ChatMessage)

// 清空所有消息
clearMessages()

// 删除指定消息
removeMessage(index: number)

// 获取最后 N 条消息
getLastMessages(count: number)
```

**持久化策略**:

- 使用 `localStorage` 存储
- 最多保存 100 条消息
- 深度监听自动同步
- 错误处理和配额管理

---

### 4. ai-proxy Edge Function

**职责**:
- 作为 OpenAI API 的安全代理
- 验证用户身份
- 处理函数调用逻辑
- 协调 RAG 搜索流程

**请求流程**:

```
1. 接收前端请求
   ↓
2. 验证 JWT Token
   ↓
3. 解析请求体（messages, temperature, max_tokens）
   ↓
4. 构建 OpenAI 请求（包含 system prompt 和 tools）
   ↓
5. 调用 OpenAI API
   ↓
6. 检查响应是否包含 tool_calls
   ↓
7a. 如果有工具调用：
    - 解析工具参数
    - 调用 rag-search Edge Function
    - 将结果返回给 OpenAI
    - 获取最终回复
    
7b. 如果没有工具调用：
    - 直接返回 AI 回复
   ↓
8. 返回响应给前端
```

**安全特性**:

- ✅ JWT 身份验证
- ✅ API Key 不暴露给前端
- ✅ CORS 支持
- ✅ 错误处理和日志记录
- ✅ 请求参数验证

**System Prompt**:

```typescript
const systemPrompt = {
  role: 'system',
  content: `你是用户的 AI 学习助手。你可以：
1. 回答学习相关的问题
2. 通过调用 rag_tool 函数来查询用户的学习笔记和记录
3. 提供学习建议和指导

当用户询问关于他们自己的学习记录或笔记时，请务必调用 rag_tool 函数来获取相关信息。

请用中文回答用户的问题。`
};
```

---

### 5. rag-search Edge Function

**职责**:
- 生成查询文本的向量嵌入
- 执行向量相似度搜索
- 回退到文本搜索
- 返回相关学习记录

**搜索流程**:

```
1. 接收查询请求（query, limit）
   ↓
2. 验证用户身份
   ↓
3. 使用 OpenAI Embeddings API 生成向量
   ↓
4. 调用 PostgreSQL 函数 search_similar_records()
   ↓
5. 执行向量相似度搜索（cosine similarity）
   ↓
6. 返回匹配的学习记录
   
如果步骤 3 或 4 失败：
   ↓
7. 回退到 ILIKE 文本搜索
   ↓
8. 返回文本搜索结果
```

**向量生成**:

```typescript
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-ada-002',
    }),
  });
  
  const data = await response.json();
  return data.data[0].embedding;  // 1536 维向量
}
```

**相似度搜索**:

```sql
SELECT 
  id, user_id, title, content, category, created_at,
  1 - (embedding <=> query_embedding) AS similarity
FROM study_records
WHERE user_id = p_user_id
  AND embedding IS NOT NULL
  AND 1 - (embedding <=> query_embedding) > match_threshold
ORDER BY embedding <=> query_embedding
LIMIT match_count;
```

**搜索参数**:

- `match_threshold`: 0.7（相似度阈值）
- `match_count`: 5（最大返回数量）
- 距离度量: cosine similarity (`<=>`)

---

## 🔄 数据流详解

### 场景 1: 普通对话

```
用户输入: "你好"
    ↓
AiChat.vue 发送请求到 /functions/v1/ai-proxy
    ↓
ai-proxy 验证用户身份
    ↓
ai-proxy 调用 OpenAI API
    ↓
OpenAI 返回回复（无工具调用）
    ↓
ai-proxy 返回响应给前端
    ↓
AiChat.vue 显示 AI 回复
    ↓
FloatingChat.vue 触发 @new-message 事件
    ↓
chat.ts Store 保存消息到 localStorage
```

### 场景 2: RAG 增强对话

```
用户输入: "我最近学习了什么？"
    ↓
AiChat.vue 发送请求到 /functions/v1/ai-proxy
    ↓
ai-proxy 调用 OpenAI API（带 rag_tool 定义）
    ↓
OpenAI 决定调用 rag_tool
    ↓
OpenAI 返回 tool_calls: [{ name: "rag_tool", arguments: { query: "最近学习" } }]
    ↓
ai-proxy 解析工具调用
    ↓
ai-proxy 调用 /functions/v1/rag-search
    ↓
rag-search 生成查询向量
    ↓
rag-search 执行向量相似度搜索
    ↓
rag-search 返回相关学习记录
    ↓
ai-proxy 将结果返回给 OpenAI
    ↓
OpenAI 基于学习记录生成回复
    ↓
ai-proxy 返回最终回复给前端
    ↓
AiChat.vue 显示 AI 回复（包含引用来源）
    ↓
FloatingChat.vue 保存消息到 Store
```

---

## 🛡️ 安全考虑

### 1. API Key 保护

- ❌ **不要**在前端代码中硬编码 OpenAI API Key
- ✅ **使用** Supabase Edge Functions 作为代理
- ✅ **配置** Secrets 在 Supabase Dashboard 中

### 2. 身份验证

- ✅ 所有 Edge Function 请求都需要 JWT Token
- ✅ 使用 `supabase.auth.getUser()` 验证用户
- ✅ 数据库查询限制为当前用户的数据（RLS）

### 3. CORS 配置

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### 4. 错误处理

- ✅ 所有 Edge Function 都有 try-catch 块
- ✅ 返回适当的 HTTP 状态码
- ✅ 记录错误日志但不暴露敏感信息

---

## ⚡ 性能优化

### 1. 向量索引

使用 IVFFlat 索引加速相似度搜索：

```sql
CREATE INDEX idx_study_records_embedding 
ON study_records USING ivfflat (embedding vector_cosine_ops);
```

对于更大规模的数据，使用 HNSW：

```sql
CREATE INDEX idx_study_records_embedding_hnsw 
ON study_records USING hnsw (embedding vector_cosine_ops);
```

### 2. 消息缓存

- localStorage 最多保存 100 条消息
- 自动清理旧消息
- 避免重复存储

### 3. Edge Function 优化

- 复用 Supabase Client 实例
- 减少不必要的数据库查询
- 使用连接池（Supabase 自动管理）

### 4. 前端优化

- 使用 `computed` 缓存格式化消息
- 懒加载 Deep Chat 组件
- 避免不必要的重渲染

---

## 🔍 监控与调试

### 1. 查看 Edge Function 日志

```bash
# 实时日志
supabase functions logs ai-proxy --tail

# 最近 100 行
supabase functions logs rag-search --lines 100
```

### 2. 浏览器开发者工具

- **Console**: 查看 JavaScript 错误和日志
- **Network**: 监控 API 请求和响应
- **Application**: 检查 localStorage 数据

### 3. Supabase Dashboard

- **Logs**: 查看 Edge Function 执行日志
- **SQL Editor**: 测试数据库查询
- **Table Editor**: 检查数据完整性

---

## 📊 扩展建议

### 1. 添加更多工具

```typescript
const directives = [
  {
    name: "rag_tool",
    description: "查询学习笔记"
  },
  {
    name: "search_web",
    description: "搜索网络信息"
  },
  {
    name: "calculate",
    description: "执行数学计算"
  }
];
```

### 2. 实现流式响应

```typescript
// 在 ai-proxy 中启用 stream
body: JSON.stringify({
  model: OPENAI_MODEL,
  messages: [...],
  stream: true,
});

// 使用 ReadableStream 逐步返回响应
```

### 3. 多模态支持

```vue
<deep-chat
  :file-upload="true"
  :camera="true"
  :microphone="true"
/>
```

### 4. 知识库增强

- 支持 PDF、Word 文档上传
- 自动提取网页内容
- 定期重新索引
- 用户反馈机制

---

## 🎓 学习资源

- [Deep Chat 官方文档](https://deepchat.dev/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Pinia 文档](https://pinia.vuejs.org/)

---

**架构版本**: v1.0  
**最后更新**: 2026-05-08
