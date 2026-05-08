# 🚀 快速启动指南

## 前置要求

- Node.js >= 16.0.0
- npm >= 7.0.0
- Supabase 账户

## 步骤 1：克隆项目并安装依赖

```bash
cd vuepabase
npm install
```

## 步骤 2：配置 Supabase

### 2.1 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 "New Project"
3. 填写项目信息并创建

### 2.2 获取项目凭证

在项目设置中找到：
- **Project URL** (例如: `https://xxx.supabase.co`)
- **anon public key** (在 Settings > API 中)

### 2.3 创建环境变量文件

在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-public-key
```

> ⚠️ **注意**：使用的是 `VITE_SUPABASE_KEY`（不是 `VITE_SUPABASE_ANON_KEY`）

## 步骤 3：初始化数据库

### 3.1 执行基础 Schema

1. 打开 Supabase Dashboard
2. 进入 **SQL Editor**
3. 复制 `supabase_schema.sql` 的内容并执行

### 3.2 执行扩展 Schema

同样在 SQL Editor 中，复制 `supabase_schema_extended.sql` 的内容并执行

这会创建以下表：
- ✅ `profiles` - 用户资料
- ✅ `study_records` - 学习记录
- ✅ `learning_goals` - 学习目标（新增）
- ✅ `pomodoro_sessions` - 番茄钟会话（新增）
- ✅ `user_preferences` - 用户偏好（新增）

所有表都会自动配置行级安全策略（RLS）。

## 步骤 4：启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

## 步骤 5：注册/登录

1. 点击 "注册" 按钮
2. 输入邮箱和密码
3. 完成注册（如果启用了邮箱验证，需要检查邮箱）
4. 登录后即可使用所有功能

## 📱 功能导览

### 主仪表盘（Dashboard）

登录后默认进入仪表盘，包含：

1. **个人资料卡片**（左上）
   - 查看和编辑昵称、简介
   
2. **学习目标管理**（中上）
   - 选择目标类型：每日/每周/每月
   - 设定目标时长
   - 实时进度追踪

3. **番茄钟**（右上）
   - 输入专注科目
   - 开始 25 分钟专注
   - 自动记录学习时长

4. **统计图表**（中部）
   - 近 7 天学习趋势折线图
   - 科目分布饼图

5. **偏好设置**（底部）
   - 主题切换（亮色/暗色）
   - 通知设置
   - 番茄钟时长配置

### 学习记录页（Records）

点击左侧导航栏的 "Records" 进入：

- 像素风格 UI（保留原有设计）
- 添加/编辑/删除学习记录
- ECharts 图表展示
- AI 周报生成

## 🔧 常见问题排查

### 问题 1：无法连接 Supabase

**症状**：控制台报错 "Invalid API key" 或网络连接失败

**解决**：
1. 检查 `.env` 文件是否正确创建
2. 确认 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_KEY` 填写正确
3. 重启开发服务器（修改 .env 后必须重启）

```bash
# 停止当前服务器（Ctrl+C）
npm run dev
```

### 问题 2：数据库表不存在

**症状**：操作时报错 "relation does not exist"

**解决**：
1. 确认已执行两个 SQL 脚本
2. 在 Supabase Dashboard 的 Table Editor 中检查表是否存在
3. 如果缺少表，重新执行对应的 SQL 脚本

### 问题 3：番茄钟不自动保存记录

**症状**：番茄钟完成后没有在学习记录中看到数据

**解决**：
1. 检查浏览器控制台是否有错误
2. 确认 `pomodoro_sessions` 表已创建
3. 确认 RLS 策略已正确配置

### 问题 4：图表不显示

**症状**：统计图表区域空白

**解决**：
1. 确认已添加至少一条学习记录
2. 检查浏览器控制台是否有 ECharts 相关错误
3. 尝试刷新页面

### 问题 5：样式异常

**症状**：Element Plus 组件样式丢失

**解决**：
1. 确认 `main.ts` 中已导入 Element Plus CSS：
   ```typescript
   import 'element-plus/dist/index.css';
   ```
2. 清除浏览器缓存并硬刷新（Ctrl+Shift+R）

## 🎯 下一步

- 📖 阅读完整文档：`README_ENHANCED.md`
- 🎨 自定义主题：修改 `PreferencesPanel` 组件
- 📊 扩展图表：在 `StatsDashboard` 中添加新图表类型
- 🍅 调整番茄钟：在偏好设置中修改专注/休息时长

## 💡 提示

1. **首次使用建议**：
   - 先设定一个学习目标
   - 使用番茄钟完成一次专注
   - 查看统计图表了解数据可视化效果

2. **数据安全**：
   - 所有数据都存储在 Supabase
   - 每个用户只能访问自己的数据（RLS 保护）
   - 定期备份重要数据

3. **性能优化**：
   - 图表数据会自动缓存
   - 大量记录时使用分页浏览
   - 避免同时开启多个番茄钟

---

**祝你使用愉快！** 🎉

如有问题，请查看控制台错误或提交 Issue。
