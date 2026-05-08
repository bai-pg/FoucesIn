# Deep Chat AI 助手 - 快速开始

## 🚀 5分钟快速部署

### 步骤 1: 配置环境变量

创建 `.env` 文件（如果不存在）：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 步骤 2: 配置 OpenAI API Key

在 Supabase Dashboard 中：

1. 进入 **Edge Functions** → **Manage Secrets**
2. 添加密钥：
   - `OPENAI_API_KEY`: `sk-your-openai-key`
   - `OPENAI_MODEL`: `gpt-4` (或 `gpt-3.5-turbo`)

或使用 CLI：

```bash
supabase secrets set OPENAI_API_KEY=sk-your-key
supabase secrets set OPENAI_MODEL=gpt-4
```

### 步骤 3: 执行数据库迁移

在 Supabase Dashboard 的 SQL Editor 中执行：

```sql
-- 启用 pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 添加向量字段
ALTER TABLE study_records ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE learning_notes ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_study_records_embedding 
ON study_records USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_learning_notes_embedding 
ON learning_notes USING ivfflat (embedding vector_cosine_ops);
```

完整的迁移脚本见：`supabase/migrations/20240101_enable_pgvector.sql`

### 步骤 4: 部署 Edge Functions

```bash
# 登录 Supabase
supabase login

# 链接项目
supabase link --project-ref YOUR_PROJECT_REF

# 部署函数
supabase functions deploy ai-proxy
supabase functions deploy rag-search
```

### 步骤 5: 启动应用

```bash
npm install
npm run dev
```

访问 http://localhost:5173，登录后点击右下角的聊天按钮即可使用！

---

## ✅ 功能验证清单

- [ ] 浮动聊天按钮显示在右下角
- [ ] 点击按钮打开聊天窗口
- [ ] 发送消息 "你好"，收到 AI 回复
- [ ] 刷新页面后，历史消息仍然存在
- [ ] 移动端适配正常（可选测试）

---

## 🔧 故障排除

### 问题 1: 聊天窗口打不开

**检查**:
```bash
# 查看浏览器控制台错误
# 确认 FloatingChat 组件已加载
```

**解决**:
- 确认 `DashboardLayout.vue` 中包含 `<FloatingChat />`
- 检查是否有 JavaScript 错误

### 问题 2: AI 不回复

**检查 Edge Function 日志**:
```bash
supabase functions logs ai-proxy
```

**常见原因**:
- ❌ OpenAI API Key 未配置或无效
- ❌ 用户未登录
- ❌ 网络连接问题

### 问题 3: RAG 搜索无结果

**检查**:
```sql
-- 确认表中有数据
SELECT COUNT(*) FROM study_records WHERE embedding IS NOT NULL;
```

**解决**:
- 确保学习记录有 `embedding` 值
- 降低搜索阈值（修改 `rag-search/index.ts` 中的 `match_threshold`）

---

## 📱 在移动设备上测试

1. 获取本地 IP 地址：
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. 修改 `vite.config.ts`（如果需要）：
   ```typescript
   export default defineConfig({
     server: {
       host: '0.0.0.0', // 允许外部访问
     },
   });
   ```

3. 在手机浏览器访问：
   ```
   http://YOUR_LOCAL_IP:5173
   ```

---

## 🎯 下一步

- 📖 阅读完整文档：[DEEP_CHAT_INTEGRATION_GUIDE.md](./DEEP_CHAT_INTEGRATION_GUIDE.md)
- 🔨 自定义聊天界面样式
- 📚 添加更多知识库内容
- 🌊 实现流式响应效果
- 🎤 添加语音输入功能

---

**需要帮助？** 查看完整指南或提交 Issue。
