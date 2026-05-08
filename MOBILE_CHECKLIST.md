# 移动端适配快速检查清单

## ✅ 配置完成确认

### 1. 依赖安装
- [x] `postcss-px-to-viewport-8-plugin` 已安装
- [x] `tailwindcss` 已配置响应式断点
- [x] `autoprefixer` 已配置

### 2. 配置文件
- [x] `postcss.config.js` - px 转 vw 插件配置
- [x] `tailwind.config.js` - 响应式断点配置
- [x] `index.html` - 视口元标签配置
- [x] `src/main.css` - 移动端工具类和基础样式

### 3. 文档创建
- [x] `MOBILE_RESPONSIVE_GUIDE.md` - 完整使用指南
- [x] `MOBILE_CHECKLIST.md` - 本检查清单
- [x] `MobileDemoView.vue` - 示例组件

---

## 🚀 立即开始使用

### 步骤 1: 启动开发服务器

```bash
npm run dev
```

### 步骤 2: 在浏览器中测试

1. 打开 Chrome DevTools (F12)
2. 点击设备工具栏图标 (Ctrl+Shift+M)
3. 选择不同设备进行测试：
   - iPhone SE (375x667)
   - iPhone X (375x812)
   - iPad (768x1024)
   - Pixel 5 (393x851)

### 步骤 3: 查看示例页面

访问 `/mobile-demo` 路由（需先在 router.ts 中配置）查看完整的移动端适配示例。

---

## 📋 开发前检查

### 样式编写
- [ ] 直接使用 px 单位，无需手动转换
- [ ] 字体大小优先使用 rem/em
- [ ] 使用 Tailwind 响应式前缀（sm:, md:, lg:）
- [ ] 按钮和交互元素最小 44x44px

### 布局设计
- [ ] 移动优先：先写移动端样式
- [ ] 使用 flex-col 作为默认布局
- [ ] 使用 grid 时设置合理的列数
- [ ] 考虑安全区域（刘海屏、底部横条）

### 交互优化
- [ ] 添加 :active 状态提供触摸反馈
- [ ] 避免 hover 作为唯一交互方式
- [ ] 长列表使用分页或虚拟滚动
- [ ] 表单输入防止 iOS 自动缩放

### 性能考虑
- [ ] 图片使用 srcset 提供多分辨率
- [ ] 动画使用 transform 和 opacity
- [ ] 添加 will-change 提示浏览器优化
- [ ] 避免在滚动事件中执行复杂计算

---

## 🧪 测试清单

### 基础功能测试
- [ ] 页面在不同设备上正常显示
- [ ] 文字大小适中，易于阅读
- [ ] 按钮和链接易于点击
- [ ] 表单输入体验流畅
- [ ] 滚动操作顺滑无卡顿

### 响应式测试
- [ ] 320px 屏幕正常显示
- [ ] 375px 屏幕正常显示
- [ ] 414px 屏幕正常显示
- [ ] 768px 屏幕布局合理
- [ ] 1024px 及以上屏幕充分利用空间

### 方向测试
- [ ] 竖屏模式功能正常
- [ ] 横屏模式布局合理
- [ ] 方向切换流畅无闪烁

### 特殊设备测试
- [ ] iPhone X 及以上（刘海屏）安全区域正确
- [ ] Android 全面屏设备底部横条不遮挡
- [ ] iPad 分屏模式显示正常
- [ ] 折叠屏展开/收起状态适配

### 浏览器兼容性
- [ ] iOS Safari 12+
- [ ] Android Chrome 80+
- [ ] 微信内置浏览器
- [ ] QQ 浏览器
- [ ] UC 浏览器

### 交互测试
- [ ] 单击响应迅速
- [ ] 双击不触发缩放
- [ ] 长按不弹出菜单（如需要）
- [ ] 滑动操作流畅
- [ ]  pinch 缩放禁用（如需要）

### 性能测试
- [ ] 首屏加载时间 < 3s（4G 网络）
- [ ] 页面滚动帧率 > 50fps
- [ ] 动画流畅无掉帧
- [ ] 内存占用合理
- [ ] 弱网环境降级处理

---

## 🔍 常见问题排查

### 问题 1: 样式没有生效

**检查项:**
- [ ] 是否清除了浏览器缓存
- [ ] 是否重新启动了开发服务器
- [ ] 文件是否在 `src/` 目录下
- [ ] CSS 选择器优先级是否正确

**解决方案:**
```bash
# 清除缓存并重启
rm -rf node_modules/.vite
npm run dev
```

### 问题 2: 某些元素尺寸异常

**检查项:**
- [ ] 是否使用了固定宽度/高度
- [ ] 是否有 inline style 覆盖
- [ ] 第三方组件样式冲突

**解决方案:**
```css
/* 使用 !important 临时调试 */
.element {
  width: 100px !important; /* no convert */
}
```

### 问题 3: 字体太小或太大

**检查项:**
- [ ] 是否使用了 vw 单位设置字体
- [ ] 是否有媒体查询调整字体大小
- [ ] iOS 是否触发了自动缩放

**解决方案:**
```css
/* 使用 rem 代替 vw */
.title {
  font-size: 1.125rem; /* 18px */
}

/* 防止 iOS 自动缩放 */
input {
  font-size: 16px;
}
```

### 问题 4: 安全区域未生效

**检查项:**
- [ ] meta viewport 是否包含 `viewport-fit=cover`
- [ ] 是否使用了正确的工具类
- [ ] 父元素是否有 overflow:hidden

**解决方案:**
```html
<!-- 确保 viewport 配置正确 -->
<meta name="viewport" content="..., viewport-fit=cover" />
```

```vue
<!-- 使用工具类 -->
<header class="safe-area-top">...</header>
<footer class="safe-area-bottom">...</footer>
```

### 问题 5: 横屏模式异常

**检查项:**
- [ ] postcss 配置是否启用 landscape
- [ ] 是否有专门的横屏样式
- [ ] 内容是否会溢出视口

**解决方案:**
```javascript
// postcss.config.js
'postcss-px-to-viewport-8-plugin': {
  landscape: true,
  landscapeWidth: 812,
}
```

```css
/* 添加横屏媒体查询 */
@media (orientation: landscape) {
  .container {
    padding: 20px;
  }
}
```

---

## 📊 性能监控

### Lighthouse 评分目标
- [ ] Performance: ≥ 90
- [ ] Accessibility: ≥ 90
- [ ] Best Practices: ≥ 90
- [ ] SEO: ≥ 90
- [ ] PWA: ≥ 80

### 关键指标
- [ ] FCP (First Contentful Paint) < 1.8s
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] TTI (Time to Interactive) < 3.8s

### 监控工具
- Chrome DevTools Lighthouse
- WebPageTest
- PageSpeed Insights
- GTmetrix

---

## 🎯 上线前最终检查

### 代码质量
- [ ] 所有 px 单位正确转换为 vw
- [ ] 响应式断点使用合理
- [ ] 无硬编码的设备特定样式
- [ ] 代码注释清晰

### 兼容性
- [ ] iOS Safari 测试通过
- [ ] Android Chrome 测试通过
- [ ] 微信浏览器测试通过
- [ ] 主流设备覆盖测试

### 性能
- [ ] Lighthouse 评分达标
- [ ] 首屏加载时间达标
- [ ] 滚动帧率达标
- [ ] 内存占用合理

### 用户体验
- [ ] 触控反馈自然
- [ ] 动画流畅
- [ ] 加载状态明确
- [ ] 错误提示友好

### 文档
- [ ] README 更新移动端适配说明
- [ ] 团队成员了解使用规范
- [ ] 示例代码可供参考

---

## 📝 维护建议

### 日常维护
1. **定期测试**: 每月在不同设备上测试一次
2. **监控性能**: 持续关注 Lighthouse 评分
3. **更新依赖**: 及时更新 postcss 和 tailwind 版本
4. **收集反馈**: 关注用户反馈的移动端问题

### 版本迭代
1. **回归测试**: 每次大版本更新后全面测试
2. **新特性评估**: 评估新 CSS 特性的移动端兼容性
3. **性能优化**: 持续优化加载速度和渲染性能
4. **文档更新**: 及时更新使用文档和最佳实践

---

## 🆘 获取帮助

### 内部资源
- 📖 [完整使用指南](./MOBILE_RESPONSIVE_GUIDE.md)
- 💻 [示例组件](./src/views/MobileDemoView.vue)
- 🎨 [工具类参考](./src/main.css)

### 外部资源
- [Tailwind CSS 官方文档](https://tailwindcss.com/docs)
- [MDN 响应式设计指南](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Chrome DevTools 设备模拟](https://developer.chrome.com/docs/devtools/device-mode/)

---

**最后更新**: 2026-05-07  
**维护者**: 开发团队
