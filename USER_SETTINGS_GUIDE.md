# 用户设置面板组件使用指南

## 📋 概述

用户设置面板(`UserSettingsPanel`)是一个整合了**个人资料管理**和**偏好设置**的统一组件,通过点击右上角的设置图标即可快速访问。

## 🎯 功能特性

### 1. 个人资料管理
- ✅ 查看用户基本信息(昵称、ID、邮箱、简介)
- ✅ 编辑个人资料(支持昵称和简介修改)
- ✅ 实时保存到Supabase数据库
- ✅ 优雅的查看/编辑模式切换

### 2. 偏好设置
- ✅ **主题切换**: 亮色/暗色模式即时切换
- ✅ **邮件通知**: 开启/关闭邮件通知功能
- ✅ **默认视图**: 设置登录后默认显示的页面
- ✅ **番茄钟配置**: 
  - 专注时长(5-60分钟,步长5分钟)
  - 休息时长(1-30分钟,步长1分钟)

## 🚀 使用方法

### 访问方式
1. 登录系统后,在任意页面的右上角找到**设置图标**(⚙️)
2. 点击图标,弹出用户设置面板
3. 通过标签页切换"个人资料"和"偏好设置"

### 编辑个人资料
1. 在"个人资料"标签页,点击"编辑资料"按钮
2. 修改昵称或简介
3. 点击"保存"按钮提交更改
4. 如需放弃修改,点击"取消"按钮

### 调整偏好设置
- 所有偏好设置的修改会**立即生效**并自动同步到数据库
- 无需手动保存,修改后会显示成功提示

## 🏗️ 技术架构

### 文件结构
```
src/
├── components/
│   ├── UserSettingsPanel.vue    # 用户设置面板组件(新增)
│   └── AppTopBar.vue            # 顶部导航栏(已集成设置按钮)
├── stores/
│   └── auth.ts                  # 认证和偏好设置Store
└── views/records/
    └── composables/
        └── useUserProfile.ts    # 用户资料管理Composable
```

### 核心依赖
- **Element Plus**: UI组件库(el-dialog, el-tabs, el-form等)
- **Pinia**: 全局状态管理(usePreferencesStore)
- **Supabase**: 后端服务(数据存储)
- **Vue 3 Composition API**: 响应式逻辑

### 数据流
```
用户操作 → UserSettingsPanel
         ↓
    ┌────┴────┐
    ↓         ↓
useUserProfile  usePreferencesStore
    ↓         ↓
Supabase DB ← 自动同步
```

## 🎨 设计规范

### 视觉设计
- **弹窗宽度**: 600px
- **最小高度**: 400px
- **标签页图标**: 使用emoji增强可读性(👤 🎨)
- **渐变背景**: 个人资料头部使用紫色渐变
- **动画效果**: 
  - 查看模式: 淡入动画(fadeIn)
  - 编辑模式: 滑入动画(slideIn)

### 交互规范
- 点击遮罩层不关闭弹窗(`:close-on-click-modal="false"`)
- 编辑模式下提供明确的保存/取消操作
- 所有异步操作显示loading状态
- 操作结果通过ElMessage反馈

## 🔧 自定义扩展

### 添加新的偏好设置项
1. 在`src/views/records/types.ts`中更新`UserPreferences`接口
2. 在`usePreferencesStore`中添加对应的处理函数
3. 在`UserSettingsPanel.vue`的偏好设置标签页中添加表单项

示例:
```typescript
// types.ts
export interface UserPreferences {
  // ... 现有字段
  language: string;  // 新增语言设置
}

// UserSettingsPanel.vue
<el-form-item label="语言">
  <el-select v-model="preferencesStore.preferences.language" @change="handleLanguageChange">
    <el-option label="中文" value="zh-CN" />
    <el-option label="English" value="en-US" />
  </el-select>
</el-form-item>
```

### 添加新的个人资料字段
1. 在`src/views/records/types.ts`中更新`Profile`接口
2. 在`useUserProfile.ts`中确保字段被正确加载和更新
3. 在`UserSettingsPanel.vue`的个人资料表单中添加对应字段

## 🐛 常见问题

### Q: 修改偏好设置后没有立即生效?
A: 检查浏览器控制台是否有错误信息,确认Supabase连接正常。偏好设置会通过`usePreferencesStore`自动同步。

### Q: 个人资料保存失败?
A: 确认以下事项:
- 用户已登录
- 昵称不为空
- Supabase数据库中`profiles`表存在且RLS策略正确

### Q: 如何调试用户设置面板?
A: 打开浏览器开发者工具,在Console中查看日志:
- `Supabase Auth State Change`: 认证状态变化
- `加载偏好设置失败`: 数据库读取错误
- `同步偏好设置到数据库失败`: 数据写入错误

## 📝 最佳实践

1. **性能优化**: 组件采用懒加载策略,仅在弹窗打开时加载数据
2. **用户体验**: 所有修改提供即时反馈,避免用户等待
3. **数据安全**: 敏感操作(如邮箱修改)设为禁用状态,需通过其他流程修改
4. **代码复用**: 已有的`ProfileCard`和`PreferencesPanel`组件的逻辑已被整合,原组件可在DashboardView中继续使用

## 🔄 与原有组件的关系

| 原组件 | 新组件 | 说明 |
|--------|--------|------|
| ProfileCard | UserSettingsPanel (个人资料标签页) | 功能完全整合,原组件保留用于DashboardView |
| PreferencesPanel | UserSettingsPanel (偏好设置标签页) | 功能完全整合,原组件保留用于DashboardView |

> 💡 **提示**: 原有的`ProfileCard`和`PreferencesPanel`组件仍然保留,可以在DashboardView等页面中继续使用,实现双轨制布局。
