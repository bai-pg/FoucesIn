# 番茄钟状态持久化功能说明

## ✨ 功能概述

实现了番茄钟的状态持久化,让用户在页面切换时番茄钟状态不会丢失,只在关闭网页时清空。

---

##  核心特性

### 1️⃣ 页面切换时保持状态

- ✅ 从首页切换到其他页面,番茄钟**保持运行/暂停状态**
- ✅ 返回首页时,番茄钟**自动恢复**之前的状态和时间
- ✅ 科目信息、配置等全部保留

### 2️⃣ 关闭网页时清空状态

- ✅ 用户关闭浏览器标签页或窗口时,自动清空番茄钟状态
- ✅ 下次打开时,番茄钟恢复初始状态

### 3️⃣ 页面隐藏时自动暂停

- ✅ 切换到其他标签页时,自动暂停计时(避免后台计时不准确)
- ✅ 返回时显示"已暂停"状态,用户点击"继续"即可恢复

---

## 📁 实现方案

### 架构设计

```
┌──────────────────────────────────────┐
│       Pomodoro Store (Pinia)         │
│  ┌────────────────────────────────┐  │
│  │  状态管理                       │  │
│  │  • status (idle/running/paused) │  │
│  │  • timeLeft (剩余时间)          │  │
│  │  • currentSubject (科目)        │  │
│  ────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  localStorage 持久化            │  │
│  │  • 页面切换时保存状态           │  │
│  │  • beforeunload 时清空状态      │  │
│  └────────────────────────────────┘  │
└──────────────┬───────────────────────┘
               │
        ┌──────┴──────┐
        │             │
PomodoroTimer   DashboardView
  组件          (其他页面)
```

---

## 🔧 核心实现

### 1️⃣ Pomodoro Store ([`src/stores/pomodoro.ts`](./src/stores/pomodoro.ts))

#### **状态持久化**

```typescript
// 保存到 localStorage
function saveState() {
  const state = {
    status: status.value,
    timeLeft: timeLeft.value,
    initialDuration: initialDuration.value,
    currentSubject: currentSubject.value,
    workDuration: workDuration.value,
    restDuration: restDuration.value,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// 从 localStorage 恢复
function restoreState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const state = JSON.parse(saved);
    status.value = state.status;
    timeLeft.value = state.timeLeft;
    // ... 恢复其他状态
  }
}
```

#### **页面关闭时清空**

```typescript
function init() {
  restoreState();
  
  // 监听页面关闭事件
  window.addEventListener('beforeunload', () => {
    clearTimer();
    clearState(); // 清空 localStorage
  });

  // 页面隐藏时自动暂停
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && status.value === 'running') {
      pauseTimer();
    }
  });
}
```

---

### 2️⃣ PomodoroTimer 组件 ([`PomodoroTimer.vue`](./src/views/records/components/PomodoroTimer.vue))

#### **使用 Store 替代 Composable**

```typescript
import { usePomodoroStore } from '@/stores/pomodoro';

const pomodoroStore = usePomodoroStore();

onMounted(() => {
  // 初始化 Store(恢复状态)
  pomodoroStore.init();
});

// 组件卸载时不清空状态
onUnmounted(() => {
  // 保持持久化,不在这里清空
});
```

---

## 🔄 状态流转

### 场景 1: 页面切换

```
1. 用户在首页启动番茄钟
   状态: running, 时间: 15:30
   ↓
2. 用户切换到"学习记录"页面
   → Store 状态保留在内存中
   → localStorage 保存状态
   ↓
3. 用户返回首页
   → 自动恢复状态: running, 时间: 15:28
   → 计时器继续运行 ✨
```

### 场景 2: 页面隐藏

```
1. 用户启动番茄钟
   状态: running
   ↓
2. 用户切换到其他浏览器标签
   → visibilitychange 触发
   → 自动暂停计时
   → 状态变为: paused
   ↓
3. 用户返回
   → 显示"已暂停"状态
   → 用户点击"继续"恢复计时 ✨
```

### 场景 3: 关闭网页

```
1. 用户关闭浏览器标签页
   → beforeunload 事件触发
   → 清空计时器
   → 清除 localStorage
   ↓
2. 用户重新打开网页
   → 番茄钟恢复初始状态: idle ✨
```

---

##  localStorage 数据结构

```json
{
  "status": "paused",
  "timeLeft": 930,
  "initialDuration": 1500,
  "currentSubject": "数学",
  "workDuration": 1500,
  "restDuration": 300
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| status | string | 当前状态 (idle/running/paused/rest) |
| timeLeft | number | 剩余时间(秒) |
| initialDuration | number | 初始时长(秒) |
| currentSubject | string | 专注科目 |
| workDuration | number | 专注时长配置(秒) |
| restDuration | number | 休息时长配置(秒) |

---

## 🎯 核心优势

### ❌ 之前: 组件级状态

```typescript
// usePomodoro.ts (Composable)
const status = ref('idle'); // 组件销毁后丢失

// 问题:
// - 页面切换 → 组件销毁 → 状态丢失
// - 用户需要重新开始计时
```

### ✅ 现在: Store + localStorage

```typescript
// pomodoro.ts (Pinia Store)
const status = ref('idle'); // 全局状态
localStorage.setItem('pomodoro_state', ...); // 持久化

// 优势:
// - 页面切换 → 状态保留
// - 关闭网页 → 自动清空
// - 用户体验更好
```

---

## 🧪 测试方法

### 测试 1: 页面切换保持状态

1. 启动番茄钟(专注中)
2. 点击导航进入其他页面(如"学习记录")
3. 返回首页
4. **预期**: 番茄钟仍在运行,时间连续 ✅

### 测试 2: 页面隐藏自动暂停

1. 启动番茄钟
2. 切换到其他浏览器标签页
3. 等待 10 秒后返回
4. **预期**: 番茄钟显示"已暂停",时间停留在隐藏时的值 ✅

### 测试 3: 关闭网页清空状态

1. 启动番茄钟
2. 关闭浏览器标签页
3. 重新打开网页
4. **预期**: 番茄钟恢复初始状态(idle) ✅

---

## 🚀 使用方法

### 在其他组件中访问番茄钟状态

```typescript
import { usePomodoroStore } from '@/stores/pomodoro';

const pomodoroStore = usePomodoroStore();

// 读取状态
console.log(pomodoroStore.status); // 'running' / 'paused' / 'idle'
console.log(pomodoroStore.formattedTime); // '15:30'
console.log(pomodoroStore.currentSubject); // '数学'

// 控制计时器
pomodoroStore.pauseTimer();
pomodoroStore.resumeTimer();
pomodoroStore.resetTimer();
```

### 全局显示番茄钟状态

可以在导航栏或其他位置显示番茄钟状态:

```vue
<template>
  <div class="navbar">
    <span v-if="pomodoroStore.status !== 'idle'">
       {{ pomodoroStore.formattedTime }}
    </span>
  </div>
</template>
```

---

##  注意事项

1. **localStorage 限制**: 
   - 数据保存在本地浏览器中
   - 清除浏览器缓存会丢失状态

2. **多标签页问题**:
   - 每个标签页独立运行
   - 同时打开多个标签页会有多个番茄钟实例

3. **计时准确性**:
   - 页面隐藏时自动暂停,避免后台计时不准
   - 返回后需要手动点击"继续"

---

## 🔮 后续优化建议

- [ ] 支持多标签页同步(使用 BroadcastChannel API)
- [ ] 添加通知提醒(番茄钟完成时)
- [ ] 支持后台运行模式(可选)
- [ ] 添加番茄钟历史记录统计
- [ ] 支持自定义提示音

---

## 📦 文件变更清单

### 新增文件
- `src/stores/pomodoro.ts` - Pomodoro Pinia Store

### 修改文件
- `src/views/records/components/PomodoroTimer.vue` - 使用 Store 替代 Composable

### 保留文件
- `src/views/records/composables/usePomodoro.ts` - 可选删除或保留作为备用

---

**最后更新:** 2026-05-06  
**实现方式:** Pinia Store + localStorage 持久化  
**状态管理:** 页面切换保持,关闭网页清空
