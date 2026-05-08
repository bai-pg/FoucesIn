import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/ai-proxy', async (req: Request, res: Response) => {
  const { messages } = req.body;
  const lastMessage = messages[messages.length - 1];
  
  console.log('收到消息:', lastMessage.content);
  
  res.json({
    role: 'assistant',
    content: `你问的是: "${lastMessage.content}"\n\n这是一个模拟的 AI 响应。在实际应用中，这个请求会被转发到真实的 AI 服务（如 OpenAI、Anthropic 等）。\n\n如果你想实现完整的 RAG 功能，需要：\n1. 部署 Supabase Edge Function\n2. 配置向量数据库 (pgvector)\n3. 实现知识库检索逻辑`,
  });
});

app.post('/api/rag-search', async (req: Request, res: Response) => {
  const { query } = req.body;
  
  console.log('RAG 搜索:', query);
  
  res.json({
    results: [
      {
        title: '学习笔记示例',
        content: '这是一篇关于 Vue 3 Composition API 的学习笔记。Composition API 提供了更好的代码组织和复用能力...',
        similarity: 0.85,
      },
      {
        title: '学习记录',
        content: '2024年1月15日，学习了 Vue Router 4 的路由守卫和动态路由匹配...',
        similarity: 0.72,
      },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`AI Proxy Server running on http://localhost:${PORT}`);
});
