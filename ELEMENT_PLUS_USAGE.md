# ⚠️ Element Plus 使用注意事项

## 关于按需导入

由于项目配置的复杂性，Element Plus 组件可能需要**手动导入**。

### 方法 1：在组件中手动导入（推荐）

在每个使用 Element Plus 组件的 `.vue` 文件中添加：

```vue
<script setup lang="ts">
import { ElCard, ElButton, ElForm, ElInput } from 'element-plus';
// 根据需要导入其他组件
</script>
```

### 方法 2：全局注册（简单但增加打包体积）

在 `main.ts` 中添加：

```typescript
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const app = createApp(App);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus);
```

这种方式会自动注册所有 Element Plus 组件，无需在单个文件中导入。

## 已创建的组件

以下组件已经创建完成，可以直接使用：

### 1. ProfileCard.vue
- 位置：`src/views/records/components/ProfileCard.vue`
- 功能：个人资料展示和编辑

### 2. GoalManager.vue
- 位置：`src/views/records/components/GoalManager.vue`
- 功能：学习目标管理

### 3. PomodoroTimer.vue
- 位置：`src/views/records/components/PomodoroTimer.vue`
- 功能：番茄钟计时器

### 4. StatsDashboard.vue
- 位置：`src/views/records/components/StatsDashboard.vue`
- 功能：统计图表仪表盘

### 5. PreferencesPanel.vue
- 位置：`src/views/records/components/PreferencesPanel.vue`
- 功能：偏好设置面板

### 6. DashboardView.vue
- 位置：`src/views/DashboardView.vue`
- 功能：主仪表盘页面（整合以上所有组件）

## 如果遇到问题

### 问题：组件未注册

**错误信息**：`Failed to resolve component: el-card`

**解决方案**：
1. 确保已在 `main.ts` 中调用 `app.use(ElementPlus)`
2. 或在组件文件中手动导入所需组件

### 问题：样式丢失

**错误信息**：组件显示但没有样式

**解决方案**：
确保在 `main.ts` 中导入了 CSS：
```typescript
import 'element-plus/dist/index.css';
```

### 问题：图标不显示

**解决方案**：
确保已注册图标组件：
```typescript
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
```

## 推荐的开发流程

1. **启动项目**：
   ```bash
   npm run dev
   ```

2. **访问仪表盘**：
   - 登录后默认进入 `/` (DashboardView)
   - 或使用左侧导航栏切换页面

3. **测试新功能**：
   - 设定一个学习目标
   - 使用番茄钟进行一次专注
   - 查看统计图表
   - 修改偏好设置

4. **查看学习记录页**：
   - 点击导航栏的 "Records"
   - 体验像素风格的原有界面

## 技术说明

### 为什么选择手动导入？

1. **更可控**：明确知道使用了哪些组件
2. **避免冲突**：不会与现有的 unplugin 配置冲突
3. **Tree Shaking**：Vite 会自动移除未使用的代码
4. **类型安全**：TypeScript 能提供更好的类型提示

### 性能影响

- **手动导入**：只打包使用的组件，体积更小
- **全局注册**：打包所有组件，但开发更方便

对于本项目，建议**使用方法 1（手动导入）**以获得更好的性能。

---

**祝开发顺利！** 🚀
