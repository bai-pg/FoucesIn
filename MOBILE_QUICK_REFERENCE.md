# 移动端适配快速参考卡（响应式方案）

> 📱 PC 端不受影响 · 移动端专属优化 · 响应式布局

---

## ⚠️ 重要说明

**本方案确保 PC 端完全不受影响！**

- ✅ **移除**了 `postcss-px-to-viewport` 插件（会导致 PC 端变化）
- ✅ 使用 **rem 单位**作为基础（1rem = 16px）
- ✅ 使用 **Tailwind 响应式断点**控制不同屏幕
- ✅ 移动端样式用 **`@media (max-width: 768px)`** 包裹

---

## 🎯 核心原则

1. **PC 端保持原样** - 不添加任何移动端专属类
2. **移动端专属优化** - 仅在需要时添加 `.mobile-*` 类
3. **响应式布局** - 使用 `sm:`, `md:`, `lg:` 前缀
4. **触控优化** - 按钮和交互元素最小 44px

---

## 📐 响应式断点

```
默认     → 移动端 (< 640px)
sm: 640px   → 小屏手机/小平板
md: 768px   → 平板
lg: 1024px  → 笔记本
xl: 1280px  → 桌面显示器
2xl: 1536px → 大显示器
```

### 使用示例
```vue
<!-- 默认移动端样式，sm 及以上应用新样式 -->
<div class="text-sm sm:text-base md:text-lg">
  字体大小随屏幕变化
</div>

<!-- 网格：移动端 2 列，平板 3 列，桌面 4 列 -->
<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
```

---

## 🎨 常用工具类

### 响应式布局类（所有设备可用）
```css
.only-mobile        /* 仅移动端显示 (< 640px) */
.only-desktop       /* 仅桌面端显示 (≥ 640px) */
.mobile-grid        /* 响应式网格 (2-5列自适应) */
.mobile-flex        /* 响应式弹性布局 */
```

### 移动端专属类（仅 < 768px 生效）⚠️
```css
.mobile-card        /* 卡片（含触摸反馈） */
.mobile-btn         /* 按钮（44px最小尺寸） */
.mobile-input       /* 输入框（防iOS缩放） */
.mobile-list-item   /* 列表项 */
.safe-area-top      /* 顶部安全区（刘海屏） */
.safe-area-bottom   /* 底部安全区（横条） */
.mobile-header      /* 顶部导航栏 */
.mobile-fixed-bottom /* 底部固定栏 */
.tap-highlight-transparent /* 移除点击高亮 */
```

---

## 💡 最佳实践

### ✅ 推荐做法

```vue
<template>
  <!-- 1. 使用 rem 单位（通过 Tailwind 类） -->
  <h1 class="text-lg font-bold">标题</h1>
  
  <!-- 2. 响应式间距 -->
  <div class="p-3 sm:p-4 md:p-6">
    内容
  </div>
  
  <!-- 3. 响应式显示 -->
  <div class="only-mobile">移动端内容</div>
  <div class="only-desktop">桌面端内容</div>
  
  <!-- 4. 移动端按钮（自动应用触摸反馈） -->
  <button class="mobile-btn bg-blue-500 text-white w-full">
    提交
  </button>
  
  <!-- 5. 响应式网格 -->
  <div class="mobile-grid">
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>
```

### ❌ 避免做法

```css
/* 不要手动设置 vw */
.card { padding: 4.266667vw; } /* ❌ */

/* 不要在全局样式中影响 PC 端 */
* { font-size: 14px; } /* ❌ 会影响所有设备 */

/* 不要只用 hover */
.btn:hover { ... }      /* ❌ 移动端无 hover */
.btn:active { ... }     /* ✅ 添加触摸反馈 */
```

---

## 🔧 常见问题

### Q: PC 端为什么会变化？
**A**: 如果你之前使用了 `postcss-px-to-viewport`，它已被移除。现在 PC 端不会受影响。

**解决方案**: 
```bash
# 已自动执行
npm uninstall postcss-px-to-viewport-8-plugin
```

### Q: 如何让样式只在移动端生效？
**A**: 使用媒体查询或移动端专属类：

```css
/* 方法 1: CSS 媒体查询 */
@media (max-width: 768px) {
  .element { color: red; }
}

/* 方法 2: 使用移动端专属类 */
.element { @apply mobile-card; } /* 自动在媒体查询中 */
```

### Q: 如何检测是否为移动端？
**A**: 
```typescript
const isMobile = computed(() => window.innerWidth < 768)
```

### Q: 安全区域无效？
**A**: 确保 viewport 配置正确：
```html
<meta name="viewport" content="..., viewport-fit=cover" />
```

---

## 🧪 测试要点

### 必测设备
- iPhone X (375x812) ← 移动端
- iPad (768x1024) ← 平板
- Desktop (1920x1080) ← **PC 端应不变** ✅

### Chrome DevTools
```
F12 → Ctrl+Shift+M → 选择设备
```

### 关键验证
- [ ] **PC 端字体大小不变** ✅
- [ ] **PC 端间距不变** ✅
- [ ] **PC 端布局不变** ✅
- [ ] 移动端有触摸反馈
- [ ] 移动端按钮 ≥ 44px
- [ ] 移动端安全区域正确

---

## 🚀 快速命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览
npm run preview
```

---

## 📚 完整文档

- [使用指南](./MOBILE_RESPONSIVE_GUIDE.md) - 详细说明
- [检查清单](./MOBILE_CHECKLIST.md) - 测试项
- [配置总结](./MOBILE_SETUP_SUMMARY.md) - 已完成工作
- [示例组件](./src/views/MobileDemoView.vue) - 实际演示

---

**提示**: PC 端现在完全不受影响！放心使用。🎉
