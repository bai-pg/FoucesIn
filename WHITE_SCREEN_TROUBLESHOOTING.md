# Vue 项目白屏排查指南

## 问题：RecordsView 页面白屏

### 可能的原因

根据最近的修改，可能的原因包括：

1. **Pinia Store 初始化问题**
2. **路由守卫问题**
3. **组件渲染错误**
4. **数据获取失败**

### 排查步骤

#### 1. 检查浏览器控制台

打开浏览器开发者工具（F12）→ Console 标签，查找红色错误信息。

常见错误：
- `TypeError: Cannot read properties of undefined`
- `ReferenceError: xxx is not defined`
- `Uncaught Error: ...`

#### 2. 检查 Vite 终端

查看 `npm run dev` 的终端输出，查找：
- `[vite] Internal server error`
- TypeScript 编译错误
- 模块导入失败

#### 3. 检查路由

确认路由配置正确，RecordsView 是否被正确注册。

#### 4. 检查 Store

确认 `studyRecords` store 是否正确初始化。

### 快速解决方案

#### 方案 1：清除缓存并刷新

```bash
# 浏览器强制刷新
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)

# 或者清除浏览器缓存后刷新
```

#### 方案 2：重启 Vite 服务

```bash
# 停止当前服务 (Ctrl + C)
# 重新启动
npm run dev
```

#### 方案 3：检查网络请求

打开浏览器开发者工具（F12）→ Network 标签：
- 查看是否有失败的请求
- 检查 Supabase 连接是否正常
- 查看 API 响应状态码

### 常见错误修复

#### 错误 1：Store 未定义

```typescript
// 错误
const { records } = studyRecordsStore; // 如果 store 初始化失败

// 修复
const studyRecordsStore = useStudyRecordsStore();
if (!studyRecordsStore) {
  console.error('Store initialization failed');
  return;
}
```

#### 错误 2：路由守卫问题

```typescript
// 检查 router.ts 中的路由守卫
// 确保 async/await 使用正确
beforeEnter: async (to, from, next) => {
  // 异步逻辑
}
```

#### 错误 3：数据获取失败

```typescript
// 检查 fetchRecords 是否正确处理错误
try {
  await fetchRecords();
} catch (err) {
  console.error('Failed to fetch records:', err);
  // 显示用户友好的错误信息
}
```

### 调试技巧

1. **添加 console.log**
   ```typescript
   console.log('RecordsView mounted');
   console.log('Store:', studyRecordsStore);
   console.log('Records:', records.value);
   ```

2. **简化组件**
   临时注释掉部分代码，逐步排查问题所在。

3. **检查依赖**
   ```bash
   npm list pinia
   npm list @pinia/nuxt
   ```

4. **查看 Vue DevTools**
   安装 Vue DevTools 浏览器扩展，查看组件树和状态。

### 如果问题持续

请提供以下信息：
1. 浏览器控制台的完整错误信息
2. Vite 终端的输出
3. Network 面板中的失败请求
4. 白屏是全局还是仅 RecordsView 页面

这将帮助更精准地定位问题。