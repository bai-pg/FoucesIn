# 🧪 性能优化测试指南

## 快速验证优化效果

### 1️⃣ 启动开发服务器

```bash
cd vuepabase
npm run dev
```

### 2️⃣ 打开浏览器开发者工具

按 `F12` 或右键 → 检查,切换到以下面板:

#### Network(网络)面板
- ✅ 勾选 "Disable cache" 模拟首次访问
- ✅ 观察资源加载顺序和大小
- ✅ 查看分包效果(应该看到多个 vendor chunk)

#### Performance(性能)面板
- ✅ 点击录制按钮
- ✅ 刷新页面
- ✅ 停止录制,分析性能指标

#### Application(应用)面板
- ✅ 查看 Local Storage,确认缓存已创建
- ✅ 键名应包含: `stats_`, `goal_` 等前缀

---

## 📊 关键测试场景

### 场景 1: 首次加载(清除缓存)

**操作步骤:**
1. 打开无痕窗口(或清除浏览器缓存)
2. 访问 `http://localhost:5173`
3. 观察 Network 面板

**预期结果:**
- ✅ 看到多个独立的 chunk 文件(vue-vendor、element-plus 等)
- ✅ 首屏内容在 1-2 秒内显示
- ✅ 骨架屏先显示,随后异步组件逐步加载
- ✅ 总下载体积比优化前减少 30%+

---

### 场景 2: 路由切换性能

**操作步骤:**
1. 登录后进入 Dashboard
2. 点击导航切换到 Records 页面
3. 再切换回 Dashboard
4. 重复 3-5 次

**预期结果:**
- ✅ 第二次及以后的切换几乎无延迟(<100ms)
- ✅ Network 面板中看不到额外的 getUser 请求
- ✅ 页面切换流畅无卡顿

---

### 场景 3: 数据缓存效果

**操作步骤:**
1. 进入 Dashboard,等待图表加载完成
2. 刷新页面(F5)
3. 观察 Network 面板

**预期结果:**
- ✅ 第一次刷新: 看到 Supabase 请求
- ✅ 第二次刷新(2分钟内): **没有** Supabase 请求
- ✅ 图表立即显示,无加载动画
- ✅ Application 面板中看到 `stats_userId` 缓存项

---

### 场景 4: 目标管理缓存

**操作步骤:**
1. 进入 Dashboard,查看学习目标卡片
2. 刷新页面
3. 修改目标时长并保存
4. 再次刷新页面

**预期结果:**
- ✅ 第一次加载: 看到数据库查询
- ✅ 第二次加载(5分钟内): 从缓存读取,无网络请求
- ✅ 修改目标后: 缓存自动清除,下次加载重新查询
- ✅ Application 面板中看到 `goal_userId_weekly` 等缓存项

---

## 🔍 性能指标测量

### 使用 Lighthouse

1. 打开 Chrome DevTools → Lighthouse 面板
2. 选择 "Performance" 类别
3. 点击 "Analyze page load"
4. 等待分析报告

**关键指标目标值:**
- ⚡ First Contentful Paint (FCP): < 1.5s
- 🎯 Largest Contentful Paint (LCP): < 2.5s
- 🚀 Time to Interactive (TTI): < 3.0s
- 📉 Total Blocking Time (TBT): < 200ms
- ✅ Cumulative Layout Shift (CLS): < 0.1

---

### 使用 Web Vitals API

在浏览器控制台运行:

```javascript
// 监控核心 Web Vitals 指标
import('https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js')
  .then(({ onFCP, onLCP, onTTFB, onCLS }) => {
    onFCP(console.log);
    onLCP(console.log);
    onTTFB(console.log);
    onCLS(console.log);
  });
```

---

## 🐛 常见问题排查

### 问题 1: 缓存未生效

**症状:** 每次刷新都看到网络请求

**排查步骤:**
1. 检查 localStorage 是否有缓存数据
   ```javascript
   console.log(localStorage.getItem('stats_yourUserId'));
   ```
2. 确认缓存未过期(检查 timestamp)
3. 检查浏览器是否禁用了 localStorage
4. 确认用户 ID 正确

**解决方案:**
- 清除所有缓存后重试: `localStorage.clear()`
- 检查代码中的缓存逻辑是否正确执行

---

### 问题 2: 组件懒加载失败

**症状:** 页面空白或报错

**排查步骤:**
1. 打开 Console 面板查看错误信息
2. 检查 Network 面板中组件 chunk 是否加载成功
3. 确认路由配置正确

**解决方案:**
- 检查 `defineAsyncComponent` 的 loader 路径是否正确
- 增加 timeout 值(当前为 10000ms)
- 检查是否有循环依赖

---

### 问题 3: TypeScript 类型警告

**症状:** `vite.config.ts` 显示类型错误但能正常运行

**说明:** 这是 TypeScript 类型推断的误报,不影响实际功能

**可选解决方案:**
```typescript
// 方法 1: 添加 @ts-ignore 注释
// @ts-ignore
manualChunks(id) { ... }

// 方法 2: 使用类型断言
manualChunks: ((id: string) => { ... }) as any
```

---

## 📈 性能对比记录表

| 测试日期 | 首次加载时间 | 路由切换时间 | 缓存命中率 | Lighthouse 分数 | 备注 |
|---------|------------|------------|-----------|----------------|------|
| 优化前 | ~4.2s | ~450ms | 0% | 68 | 基准线 |
| 优化后-第1天 | | | | | |
| 优化后-第7天 | | | | | |
| 优化后-第30天 | | | | | |

**填写说明:**
- 每周记录一次数据,跟踪长期效果
- 使用相同测试环境(设备、网络条件)
- 记录异常情况和优化调整

---

## ✅ 验收标准

### 必须达到(Must Have)
- [ ] 首次加载时间 < 2.5s (4G 网络)
- [ ] 路由切换响应 < 200ms
- [ ] 缓存命中率 > 70% (重复访问)
- [ ] 无功能性 Bug
- [ ] 所有单元测试通过

### 应该达到(Should Have)
- [ ] Lighthouse Performance 分数 > 85
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s
- [ ] TTI < 3.0s

### 最好达到(Nice to Have)
- [ ] Lighthouse Performance 分数 > 95
- [ ] FCP < 1.0s
- [ ] 生产构建体积 < 1.5MB
- [ ] Service Worker 缓存命中

---

## 🎯 下一步行动

1. **立即执行:**
   - [ ] 在本地环境测试所有场景
   - [ ] 记录初始性能数据
   - [ ] 向团队演示优化效果

2. **本周内:**
   - [ ] 部署到测试环境
   - [ ] 收集真实用户反馈
   - [ ] 根据反馈微调缓存策略

3. **本月内:**
   - [ ] 部署到生产环境
   - [ ] 设置性能监控告警
   - [ ] 持续优化和迭代

---

**测试负责人:** _____________  
**测试日期:** _____________  
**测试结果:** ☐ 通过  ☐ 部分通过  ☐ 未通过  

**备注:**
_____________________________________________
_____________________________________________