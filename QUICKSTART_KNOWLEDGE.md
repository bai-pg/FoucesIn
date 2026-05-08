# 知识库检索模块 - 快速启动指南

## 🎯 已完成的功能

✅ **前端模块**（完整可用）
- [types.ts](file://c:\Users\23150\Desktop\qd\tes2\vuepabase\src\views\knowledge\types.ts) - 完整的 TypeScript 类型定义
- [useKnowledgeRetrieval.ts](file://c:\Users\23150\Desktop\qd\tes2\vuepabase\src\views\knowledge\composables\useKnowledgeRetrieval.ts) - 核心业务逻辑 Composable
- [RetrievalConfigPanel.vue](file://c:\Users\23150\Desktop\qd\tes2\vuepabase\src\views\knowledge\components\RetrievalConfigPanel.vue) - 检索调优面板组件
- [SearchResultList.vue](file://c:\Users\23150\Desktop\qd\tes2\vuepabase\src\views\knowledge\components\SearchResultList.vue) - 搜索结果展示组件
- [KnowledgeSearchView.vue](file://c:\Users\23150\Desktop\qd\tes2\vuepabase\src\views\knowledge\KnowledgeSearchView.vue) - 主视图页面

✅ **路由配置**
- 已添加 `/knowledge` 路由
- 已在导航菜单中添加入口

✅ **模拟数据**
- 当前使用模拟数据进行演示
- 支持所有 UI 交互和动态调优功能

## 🚀 立即体验（无需配置）

### 1. 启动项目

```bash
cd c:\Users\23150\Desktop\qd\tes2\vuepabase
npm run dev
```

### 2. 访问页面

打开浏览器访问：`http://localhost:3000/knowledge`

### 3. 测试功能

- ✅ 输入查询内容
- ✅ 调整 Top-K（1-20）
- ✅ 调整相似度阈值（0-1）
- ✅ 切换检索方法（语义/全文/混合）
- ✅ 调节权重比例（混合检索模式）
- ✅ 查看模拟检索结果
- ✅ 复制结果内容

## 🔌 接入真实腾讯云 LKE API

### 方案一：使用后端代理（推荐，生产环境）

#### 1. 创建后端项目

```bash
mkdir lke-proxy-server
cd lke-proxy-server
npm init -y
npm install express tencentcloud-sdk-nodejs dotenv cors
npm install -D typescript @types/node @types/express @types/cors
```

#### 2. 配置环境变量

创建 `.env` 文件：

```bash
TENCENT_SECRET_ID=your-secret-id
TENCENT_SECRET_KEY=your-secret-key
TENCENT_REGION=ap-guangzhou
LKE_KNOWLEDGE_ID=your-knowledge-base-id
PORT=3001
```

**获取密钥步骤：**
1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入「访问管理」→「访问密钥」→「API 密钥管理」
3. 创建或查看 SecretId 和 SecretKey
4. 在 LKE 控制台创建知识库，获取 KnowledgeBaseId

#### 3. 部署后端服务

将 [server/lke-proxy.ts](file://c:\Users\23150\Desktop\qd\tes2\vuepabase\server\lke-proxy.ts) 复制到后端项目，然后：

```bash
npx ts-node lke-proxy.ts
```

#### 4. 修改前端 API 调用

编辑 [useKnowledgeRetrieval.ts](file://c:\Users\23150\Desktop\qd\tes2\vuepabase\src\views\knowledge\composables\useKnowledgeRetrieval.ts)，在 `search()` 函数中：

```typescript
// 替换这一行：
const response = await mockRetrievalAPI(config.value);

// 为：
const response = await realLKERetrievalAPI(config.value);
```

### 方案二：直接在前端调用（仅开发测试）

⚠️ **警告：此方式会暴露密钥，仅限本地开发测试！**

#### 1. 安装腾讯云 SDK

```bash
npm install tencentcloud-sdk-nodejs
```

如果安装失败（sharp 依赖问题），可以尝试：

```bash
npm install tencentcloud-sdk-nodejs --ignore-scripts
```

#### 2. 配置环境变量

在 `.env.local` 文件中添加：

```bash
VITE_LKE_KNOWLEDGE_ID=your-knowledge-base-id
VITE_TENCENT_SECRET_ID=your-secret-id
VITE_TENCENT_SECRET_KEY=your-secret-key
```

#### 3. 修改 Composable

在 [useKnowledgeRetrieval.ts](file://c:\Users\23150\Desktop\qd\tes2\vuepabase\src\views\knowledge\composables\useKnowledgeRetrieval.ts) 中添加真实的 API 调用：

```typescript
import * as tencentcloud from "tencentcloud-sdk-nodejs";

async function realLKERetrievalAPI(config: RetrievalConfig) {
  const LkeClient = tencentcloud.lke.v20231130.Client;
  
  const client = new LkeClient({
    credential: {
      secretId: import.meta.env.VITE_TENCENT_SECRET_ID,
      secretKey: import.meta.env.VITE_TENCENT_SECRET_KEY,
    },
    region: "ap-guangzhou",
  });

  const params = {
    KnowledgeBaseId: config.knowledgeBaseId,
    Query: config.query,
    RetrievalMethod: config.retrievalMethod,
    RetrievalSetting: {
      TopK: config.retrievalSetting.topK,
      ScoreThreshold: config.retrievalSetting.scoreThreshold,
    },
  };

  const response = await client.RetrieveKnowledge(params);
  
  return {
    results: response.Results || [],
    totalCount: response.TotalCount || 0,
    latency: response.Latency || 0,
  };
}
```

## 📊 功能对比

| 功能 | 模拟模式 | 真实 API |
|------|---------|----------|
| UI 交互 | ✅ | ✅ |
| 动态调优 | ✅ | ✅ |
| 检索结果 | 🔄 固定数据 | ✅ 真实数据 |
| 密钥安全 | ✅ 无需密钥 | ⚠️ 需妥善保管 |
| 网络请求 | ❌ 无 | ✅ 需要 |
| 适用场景 | 开发演示 | 生产环境 |

## 🎨 UI 特性

### 毛玻璃效果
- 遵循项目规范，背景不透明度 50%
- 多层柔和阴影营造立体感
- 输入框区分明显

### 响应式设计
- 左右分栏布局（大屏）
- 单列堆叠布局（小屏）
- 流畅的过渡动画

### 可视化反馈
- 加载状态动画
- 权重比例可视化条
- 相似度进度条
- 排名徽章

## 🔧 自定义配置

### 修改默认参数

编辑 [useKnowledgeRetrieval.ts](file://c:\Users\23150\Desktop\qd\tes2\vuepabase\src\views\knowledge\composables\useKnowledgeRetrieval.ts)：

```typescript
const config = ref<RetrievalConfig>({
  knowledgeBaseId: import.meta.env.VITE_LKE_KNOWLEDGE_ID || "",
  query: "",
  retrievalMethod: "HYBRID", // 改为 "SEMANTIC" 或 "FULL_TEXT"
  retrievalSetting: {
    topK: 5,           // 修改默认 Top-K
    scoreThreshold: 0.6, // 修改默认阈值
  },
  weightRatio: 0.7,    // 修改默认权重
});
```

### 调整 Top-K 范围

编辑 [RetrievalConfigPanel.vue](file://c:\Users\23150\Desktop\qd\tes2\vuepabase\src\views\knowledge\components\RetrievalConfigPanel.vue)：

```vue
<input
  type="range"
  min="1"
  max="20"    <!-- 修改最大值 -->
  step="1"
  ...
/>
```

## 🐛 常见问题

### Q1: 安装 tencentcloud-sdk-nodejs 失败？

**A:** sharp 依赖可能在某些环境下编译失败。解决方案：

```bash
# 方案 1：忽略可选依赖
npm install tencentcloud-sdk-nodejs --ignore-scripts

# 方案 2：使用后端代理（推荐）
# 在后端项目中安装，避免前端构建问题
```

### Q2: 如何获取腾讯云密钥？

**A:** 
1. 注册/登录 [腾讯云](https://cloud.tencent.com/)
2. 实名认证
3. 开通 LKE 服务
4. 创建知识库
5. 在「访问管理」获取 API 密钥

### Q3: 模拟数据如何替换？

**A:** 在 [useKnowledgeRetrieval.ts](file://c:\Users\23150\Desktop\qd\tes2\vuepabase\src\views\knowledge\composables\useKnowledgeRetrieval.ts) 的 `mockRetrievalAPI` 函数中修改返回数据，或直接切换到 `realLKERetrievalAPI`。

### Q4: 如何添加更多检索参数？

**A:** 
1. 在 [types.ts](file://c:\Users\23150\Desktop\qd\tes2\vuepabase\src\views\knowledge\types.ts) 中添加新字段
2. 在调优面板组件中添加对应的 UI 控件
3. 在 API 调用时传递新参数

## 📝 下一步计划

- [ ] 集成真实腾讯云 LKE API
- [ ] 添加结果收藏功能
- [ ] 实现检索历史记录
- [ ] 支持多轮对话上下文
- [ ] 添加结果相关性反馈（点赞/点踩）
- [ ] 优化移动端体验
- [ ] 添加搜索结果导出功能

## 🔗 相关链接

- [项目 README](file://c:\Users\23150\Desktop\qd\tes2\vuepabase\README.md)
- [知识库模块文档](file://c:\Users\23150\Desktop\qd\tes2\vuepabase\src\views\knowledge\README.md)
- [腾讯云 LKE 文档](https://cloud.tencent.com/document/product/xxx)

---

**当前状态：✅ 前端模块已完成，可立即体验 UI 和交互。接入真实 API 只需配置密钥并切换调用方式。**
