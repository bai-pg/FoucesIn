# Vuepabase

This is a project I created to show how Supabase auth (email and 3rd party GitHub) can be set up concretely with a new Vue 3 app. This integrates Supabase with Vue 3, Pinia, Vue-router 4, TailwindCSS, Vitest, Cypress and more. Please see package.json for more info.

If you want to a quick start to your next Vue 3 + Supabase app, please feel free to use this template. Below I will guide you through how to set the app up locally, and the configuration you need to do in Supabase

## 🤖 AI 聊天助手

🎉 **新增**: 基于 Deep Chat 的智能 AI 助手！

### 核心功能
- 💬 **智能对话** - 基于 OpenAI GPT-4 的自然语言交互
- 🧠 **RAG 知识库** - 基于用户学习记录的智能检索
- 🎯 **悬浮助手** - 随时可唤起的浮动聊天窗口
- 💾 **消息持久化** - localStorage 保存聊天历史
- 📱 **移动端适配** - 响应式设计，支持各种设备

### 快速开始
```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入 Supabase 配置

# 2. 配置 Edge Function Secrets（在 Supabase Dashboard 中）
# OPENAI_API_KEY=sk-your-key
# OPENAI_MODEL=gpt-4

# 3. 执行数据库迁移
# 在 Supabase SQL Editor 中执行 supabase/migrations/20240101_enable_pgvector.sql

# 4. 部署 Edge Functions
supabase functions deploy ai-proxy
supabase functions deploy rag-search

# 5. 启动应用
npm install
npm run dev
```

访问 http://localhost:5173，登录后点击右下角的聊天按钮即可使用！

### 详细文档
- 🚀 [快速开始指南](./DEEP_CHAT_QUICKSTART.md) - 5分钟快速部署
- 📖 [完整集成指南](./DEEP_CHAT_INTEGRATION_GUIDE.md) - 技术架构、配置详解
- 🏗️ [架构详解](./DEEP_CHAT_ARCHITECTURE.md) - 系统架构、数据流分析
- ✅ [完成总结](./DEEP_CHAT_SUMMARY.md) - 已完成功能、文件清单

---

## 📱 移动端适配

🎉 **新增**: 完整的移动端响应式适配方案！

### 核心特性
- 🚀 **移动优先策略**: 采用 Mobile First 设计理念
- 🔄 **自动单位转换**: px 自动转换为 vw/vh，无需手动计算
- 📐 **全面屏支持**: 完美适配刘海屏、底部横条等异形屏
- 👆 **触控优化**: 44px 最小触控区域，流畅的触摸反馈
- 🎨 **响应式布局**: 6 个断点覆盖所有主流设备
- ⚡ **性能优化**: 硬件加速、懒加载、虚拟滚动支持

### 快速开始
```bash
# 启动开发服务器
npm run dev

# 在 Chrome DevTools 中测试（F12 -> 设备工具栏）
# 推荐测试设备: iPhone X, iPad, Pixel 5
```

### 使用示例
``vue
<template>
  <!-- 直接使用 px，自动转换为 vw -->
  <div class="p-4 mb-3">
    <h1 class="text-lg">标题</h1>
  </div>
  
  <!-- 响应式网格 -->
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    <!-- 内容 -->
  </div>
  
  <!-- 移动端按钮 -->
  <button class="mobile-btn bg-blue-500 text-white">
    点击我
  </button>
</template>
```

### 详细文档
- 📘 [完整使用指南](./MOBILE_RESPONSIVE_GUIDE.md) - 技术栈、配置详解、最佳实践
- ✅ [快速检查清单](./MOBILE_CHECKLIST.md) - 测试项、问题排查、性能监控
- 📝 [配置总结](./MOBILE_SETUP_SUMMARY.md) - 已完成工作、核心特性、注意事项
- 💻 [示例组件](./src/views/MobileDemoView.vue) - 完整的移动端适配演示

### 内置工具类
- **布局类**: `.mobile-grid`, `.mobile-flex`, `.only-mobile`, `.only-desktop`
- **交互类**: `.mobile-card`, `.mobile-btn`, `.mobile-input`, `.mobile-list-item`
- **安全区域**: `.safe-area-top`, `.safe-area-bottom`, `.safe-area-left`, `.safe-area-right`
- **功能类**: `.mobile-header`, `.mobile-fixed-bottom`, `.tap-highlight-transparent`

---

## ✨ 最新功能 - 用户设置面板

🎉 **新增**: 统一的用戶设置面板,整合个人资料管理和偏好设置!

### 快速体验
1. 启动项目: `npm run dev`
2. 登录后点击右上角的 ⚙️ 设置图标
3. 在弹窗中管理个人资料和偏好设置

### 核心功能
- 👤 **个人资料**: 查看和编辑昵称、简介等信息
- 🎨 **偏好设置**: 主题切换、通知设置、番茄钟配置
- 💾 **实时同步**: 所有修改自动保存到Supabase
- 🎭 **优雅交互**: 标签页切换、动画效果、即时反馈
- 📱 **全局访问**: 任意页面均可通过右上角按钮访问,不占用Dashboard空间

### 设计亮点
- ✨ DashboardView聚焦核心学习功能(目标管理、番茄钟、统计图表)
- ✨ 用户设置改为按需访问的弹窗形式,提升页面专注度
- ✨ 布局优化,GoalManager改为全宽显示,视觉效果更佳

### 详细文档
- 📘 [快速开始指南](./USER_SETTINGS_QUICKSTART.md)
- 📖 [完整使用指南](./USER_SETTINGS_GUIDE.md)
- 🎬 [功能演示说明](./USER_SETTINGS_DEMO.md)
- 📝 [改动总结](./USER_SETTINGS_CHANGES.md)

---

## Supabase Setup

Head on over to https://supabase.com/ and create your app. Choose your Project name, password, region and pricing plan as appropriate. This app will work just fine on free tier.

Once the app setup is finished, head over to Authentication - Settings.
You'll want to add both your Production URL and localhost URLs to the Site URL / Additional Redirect URLs columns. Along with the base URL, we need to add redirect URLs for our password reset flow, and 3rd party auth flow. These are `/resetpassword` and `/callback` respectively.

All in all your 'Site URL' and 'Additional Redirect URLs' should look something like this (replacing the prod URL as appropriate)

| Field  | Value |
| ------------- | ------------- |
| Site URL  | `https://vuepabase.netlify.app/`  |
| Additional Redirect URLs  | `http://localhost:3000/resetpassword`, `https://vuepabase.netlify.app/resetpassword`, `http://localhost:3000`, `http://localhost:3000/callback`, `https://vuepabase.netlify.app/callback`  |

Once you save this, the email-password authentication flow should work properly after you've set the Vue app up locally.

### GitHub Auth

You can additionally add GitHub auth to the app. First you'll need to go to GitHub and set up some app credentials.

Supabase have a great guide on how to do this already so you can follow that here: https://supabase.com/docs/guides/auth/auth-github

After you've got them, on Supabase - Settings - Auth, just enable GitHub as a 3rd party provider and enter the details you generated.

Your Supabase set up should now be complete and you can run the app locally.

## Setup Vue app

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

Your app should now be running at localhost:3000

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Preview Built App

```sh
npm run preview
```

### Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (and disable Vetur).
