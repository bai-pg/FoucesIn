# 学习追踪系统 - 完整功能版

基于 Vue 3 + Supabase + Element Plus + ECharts + Pinia 构建的现代化学习管理平台。

## ✨ 核心功能

### 1. 📊 学习仪表盘（Dashboard）
- **个人资料卡片**：查看和编辑个人信息（昵称、简介）
- **学习目标管理**：设定每日/每周/每月学习目标，实时追踪进度
- **番茄钟计时器**：专注计时，自动记录学习时长
- **数据可视化**：近7天学习趋势图、科目分布饼图

### 2. 📝 学习记录管理（Records）
- 增删改查学习记录
- 分页浏览和筛选
- 像素风格 UI（保留原有设计）
- ECharts 图表展示（柱状图/饼图切换）
- AI 周报生成（本地智能模板引擎）

### 3. 🎯 目标与进度追踪
- 支持三种目标类型：每日、每周、每月
- 实时进度条显示
- 自动计算完成百分比
- 目标达成提醒

### 4. 🍅 番茄钟功能
- 25分钟专注 + 5分钟休息（可自定义）
- 自动创建学习记录
- 会话历史记录
- 科目标签管理

### 5. ⚙️ 个性化设置
- 亮色/暗色主题切换
- 邮件通知开关
- 默认视图设置
- 番茄钟时长配置

## 🚀 快速开始

### 1. 安装依赖

```bash
cd vuepabase
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase anon public key
```

### 3. 初始化数据库

#### 3.1 执行基础 Schema

在 Supabase SQL Editor 中执行 `supabase_schema.sql`（已存在）

#### 3.2 执行扩展 Schema

执行 `supabase_schema_extended.sql` 添加新功能表：

```sql
-- 在 Supabase SQL Editor 中执行以下文件内容
-- supabase_schema_extended.sql
```

该脚本会创建：
- `learning_goals` - 学习目标表
- `pomodoro_sessions` - 番茄钟会话表
- `user_preferences` - 用户偏好表
- 扩展 `profiles` 表字段

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

## 📁 项目结构

```
vuepabase/
├── src/
│   ├── views/
│   │   ├── DashboardView.vue          # 主仪表盘（新增）
│   │   ├── RecordsView.vue            # 学习记录页面
│   │   ├── records/
│   │   │   ├── components/
│   │   │   │   ├── ProfileCard.vue           # 个人资料卡片（新增）
│   │   │   │   ├── GoalManager.vue           # 目标管理组件（新增）
│   │   │   │   ├── PomodoroTimer.vue         # 番茄钟组件（新增）
│   │   │   │   ├── StatsDashboard.vue        # 统计仪表盘（新增）
│   │   │   │   ├── PreferencesPanel.vue      # 偏好设置面板（新增）
│   │   │   │   ├── RecordForm.vue            # 记录表单
│   │   │   │   ├── EditRecordForm.vue        # 编辑表单
│   │   │   │   ├── RecordList.vue            # 记录列表
│   │   │   │   ├── ChartContainer.vue        # 图表容器
│   │   │   │   └── WeeklyReport.vue          # AI周报
│   │   │   ├── composables/
│   │   │   │   ├── useStudyRecords.ts        # 学习记录逻辑
│   │   │   │   ├── useChart.ts               # 图表逻辑
│   │   │   │   ├── useGoals.ts               # 目标管理（新增）
│   │   │   │   ├── usePomodoro.ts            # 番茄钟（新增）
│   │   │   │   ├── useUserPreferences.ts     # 偏好设置（新增）
│   │   │   │   ├── useUserProfile.ts         # 用户资料（新增）
│   │   │   │   ├── usePagination.ts          # 分页逻辑
│   │   │   │   └── useWeeklyReport.ts        # 周报生成
│   │   │   ├── utils/
│   │   │   │   └── formatters.ts             # 格式化工具
│   │   │   └── types.ts                      # 类型定义
│   │   └── workflow/                         # 工作流模块（保留）
│   ├── components/                           # 通用组件（保留）
│   ├── layouts/                              # 布局组件（保留）
│   ├── stores/                               # Pinia stores
│   ├── services/
│   │   └── supabase.ts                       # Supabase 客户端
│   ├── router.ts                             # 路由配置
│   ├── main.ts                               # 应用入口
│   └── App.vue                               # 根组件
├── supabase_schema.sql                       # 基础数据库脚本
├── supabase_schema_extended.sql              # 扩展数据库脚本（新增）
├── vite.config.ts                            # Vite 配置
├── package.json
└── README.md
```

## 🛠️ 技术栈

- **前端框架**：Vue 3 (Composition API)
- **UI 库**：Element Plus（新功能）+ Tailwind CSS（原有像素风格）
- **图表库**：ECharts + vue-echarts
- **状态管理**：Pinia
- **后端服务**：Supabase（认证、数据库、存储）
- **构建工具**：Vite
- **语言**：TypeScript
- **路由**：Vue Router 4

## 📊 数据库设计

### 核心表结构

#### 1. profiles（用户资料）
```sql
id (UUID, PK)          - 用户ID
full_name (TEXT)       - 昵称
avatar_url (TEXT)      - 头像URL
bio (TEXT)            - 个人简介
created_at (TIMESTAMP) - 创建时间
updated_at (TIMESTAMP) - 更新时间
```

#### 2. study_records（学习记录）
```sql
id (SERIAL, PK)        - 记录ID
user_id (UUID, FK)     - 用户ID
date (DATE)            - 学习日期
subject (TEXT)         - 科目
duration_minutes (INT) - 学习时长（分钟）
notes (TEXT)           - 备注
source (TEXT)          - 来源（manual/pomodoro）
created_at (TIMESTAMP) - 创建时间
```

#### 3. learning_goals（学习目标）⭐ 新增
```sql
id (SERIAL, PK)        - 目标ID
user_id (UUID, FK)     - 用户ID
goal_type (TEXT)       - 目标类型（daily/weekly/monthly）
target_minutes (INT)   - 目标时长（分钟）
start_date (DATE)      - 开始日期
end_date (DATE)        - 结束日期
created_at (TIMESTAMP) - 创建时间
updated_at (TIMESTAMP) - 更新时间
```

#### 4. pomodoro_sessions（番茄钟会话）⭐ 新增
```sql
id (SERIAL, PK)        - 会话ID
user_id (UUID, FK)     - 用户ID
study_record_id (INT)  - 关联的学习记录ID
duration_minutes (INT) - 专注时长（分钟）
start_time (TIMESTAMP) - 开始时间
end_time (TIMESTAMP)   - 结束时间
status (TEXT)          - 状态（completed/interrupted/skipped）
subject (TEXT)         - 专注科目
created_at (TIMESTAMP) - 创建时间
```

#### 5. user_preferences（用户偏好）⭐ 新增
```sql
user_id (UUID, PK/FK)  - 用户ID
theme (TEXT)           - 主题（light/dark）
email_notifications (BOOL) - 邮件通知
default_view (TEXT)    - 默认视图
pomodoro_work_duration (INT) - 专注时长（分钟）
pomodoro_rest_duration (INT) - 休息时长（分钟）
created_at (TIMESTAMP) - 创建时间
updated_at (TIMESTAMP) - 更新时间
```

## 🔐 安全性

所有表都启用了行级安全策略（RLS），确保用户只能访问自己的数据：

```sql
-- 示例：学习记录表 RLS
CREATE POLICY "Users can view own records" 
  ON public.study_records FOR SELECT 
  USING (auth.uid() = user_id);
```

## 🎨 UI 设计说明

本项目采用**双 UI 系统**：

1. **新仪表盘（Dashboard）**：使用 Element Plus，现代化简洁风格
2. **学习记录页（Records）**：保留原有像素风格（Pixel Art）

两者可以共存，通过路由切换访问。

## 📝 开发规范

### 组合式函数（Composables）
- 所有业务逻辑封装在 `composables/` 目录
- 命名规范：`useXxx.ts`
- 返回响应式状态和方法

### 组件拆分原则
- 单一职责：每个组件只负责一个功能
- 可复用性：提取通用组件到 `components/` 目录
- Props 向下，Events 向上

### TypeScript 类型
- 所有接口定义在 `types.ts`
- 避免使用 `any` 类型
- 充分利用类型推断

## 🐛 常见问题

### 1. 依赖安装失败
如果遇到 `sharp` 等原生模块安装问题：
```bash
npm install --ignore-scripts
```

### 2. 数据库表不存在
确保已执行两个 SQL 脚本：
1. `supabase_schema.sql`（基础表）
2. `supabase_schema_extended.sql`（扩展表）

### 3. 图表不显示
检查是否安装了 `vue-echarts`：
```bash
npm install vue-echarts echarts
```

### 4. Element Plus 样式丢失
确认 `main.ts` 中已导入：
```typescript
import 'element-plus/dist/index.css';
```

## 🚀 部署

### Vercel 部署
项目已包含 `vercel.json` 配置，直接连接 GitHub 仓库即可自动部署。

### 手动部署
```bash
npm run build
# 将 dist 目录部署到任意静态托管服务
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**祝你学习进步，天天向上！** 🎉
