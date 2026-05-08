# 🎯 学习目标功能 - Pinia Store 实现说明

## ✨ 功能概述

使用 **Pinia Store** 实现学习目标的跨组件实时数据同步,无需修改后端即可实现自动更新。

---

## ️ 架构设计

### 核心思想

**单一数据源 + 自动同步**

```
┌─────────────┐
│  Goals Store │ ← 全局唯一数据源
│  (Pinia)    │
└──────┬──────┘
       │
   ┌───┴───┬──────────┬────────────┐
   │       │          │            │
GoalManager Pomodoro  RecordList  StatsDashboard
   │       │          │            │
   └───────┴──────────┴────────────┘
         所有组件共享同一份数据
```

---

## 📁 文件结构

```
src/
├── stores/
│   ├── goals.ts          ← 新增: Goals Store
│   ├── auth.ts           ← 现有
│   └── index.ts          ← Pinia 初始化
│
├── views/records/components/
│   ├── GoalManager.vue   ← 更新: 使用 Store
│   └── PomodoroTimer.vue ← 更新: 自动刷新目标进度
│
└── views/records/composables/
    ├── useGoals.ts       ← 保留(可选)
    ── usePomodoro.ts    ← 保持不变
```

---

## 🔧 核心实现

### 1️⃣ Goals Store ([`src/stores/goals.ts`](./src/stores/goals.ts))

#### **状态管理**
```typescript
// 目标数据
currentGoal: LearningGoal | null
studyRecordsMinutes: number  // 学习记录分钟数
pomodoroMinutes: number      // 番茄钟分钟数

// 计算属性
totalAchieved: computed(() => studyRecords + pomodoro)
progressPercent: computed(() => totalAchieved / target * 100)
isGoalCompleted: computed(() => progressPercent >= 100)
remainingMinutes: computed(() => target - totalAchieved)
```

#### **核心方法**

| 方法 | 说明 | 触发时机 |
|------|------|---------|
| `fetchGoalWithProgress(userId, goalType)` | 加载目标及进度 | 页面初始化、切换目标类型 |
| `refreshProgress(userId)` | 仅刷新进度数据 | 学习记录/番茄钟更新后 |
| `saveGoal(userId, type, minutes)` | 保存目标 | 用户编辑目标 |
| `deleteGoal(userId)` | 删除目标 | 用户删除目标 |

#### **缓存机制**
- localStorage 缓存 5 分钟
- 按 `userId + goalType` 隔离
- 自动过期清理

---

### 2️⃣ GoalManager 组件 ([`GoalManager.vue`](./src/views/records/components/GoalManager.vue))

#### **使用 Store**
```typescript
import { useGoalsStore } from '@/stores/goals';

const goalsStore = useGoalsStore();

// 直接使用 Store 的状态
const currentGoal = computed(() => goalsStore.currentGoal);
const progressPercent = computed(() => goalsStore.progressPercent);
```

#### **功能特性**
- ✅ 无目标时显示引导界面
- ✅ 有目标时显示进度条和详细统计
- ✅ 右上角编辑按钮
- ✅ 实时计算完成百分比
- ✅ 暴露 `refreshProgress` 方法供外部调用

---

### 3️⃣ PomodoroTimer 组件 ([`PomodoroTimer.vue`](./src/views/records/components/PomodoroTimer.vue))

#### **自动刷新机制**
```typescript
import { useGoalsStore } from '@/stores/goals';

const goalsStore = useGoalsStore();

async function handleEndStudy() {
  const result = await completeFocus();
  
  if (result) {
    // 番茄钟完成后自动刷新目标进度
    await goalsStore.refreshProgress(props.userId);
  }
}
```

---

## 🔄 实时交互流程

### 场景 1: 用户完成番茄钟

```
1. 用户点击"结束学习"
   ↓
2. PomodoroTimer 调用 completeFocus()
   ↓
3. 创建学习记录 + 番茄钟会话 (Supabase)
   ↓
4. 调用 goalsStore.refreshProgress(userId)
   ↓
5. Store 重新查询学习记录和番茄钟数据
   ↓
6. 更新 totalAchieved, progressPercent 等状态
   ↓
7. GoalManager 组件自动响应更新
   ↓
8. 进度条实时变化 ✨
```

### 场景 2: 用户手动添加学习记录

```
1. 用户在 RecordList 添加记录
   ↓
2. 调用 goalsStore.refreshProgress(userId)
   ↓
3. Store 更新进度数据
   ↓
4. GoalManager 自动显示最新进度 ✨
```

### 场景 3: 用户编辑目标

```
1. 用户修改目标时长
   ↓
2. 调用 goalsStore.saveGoal()
   ↓
3. Store 更新 currentGoal
   ↓
4. 自动重新计算进度百分比
   ↓
5. 进度条实时更新 ✨
```

---

##  优势对比

### ❌ 之前: 使用 Composable (每个组件独立实例)

```typescript
// GoalManager.vue
const { currentGoal, achieved } = useGoals(); // 实例 A

// PomodoroTimer.vue  
const { ... } = useGoals(); // 实例 B (数据不共享!)

// 问题: 番茄钟更新后,GoalManager 不知道,需要手动刷新
```

### ✅ 现在: 使用 Pinia Store (全局单例)

```typescript
// GoalManager.vue
const goalsStore = useGoalsStore(); // 全局唯一实例

// PomodoroTimer.vue
const goalsStore = useGoalsStore(); // 同一个实例!

// 优势: 任意组件修改,所有组件自动同步
```

---

## 📊 数据流图

```
─────────────────────────────────────────────────┐
│              Supabase Database                  │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ study_   │  │ pomodoro_    │  │ learning_ │ │
│  │ records  │  │ sessions     │  │ goals     │ │
│  └────┬─────┘  └──────┬───────┘  └─────┬─────┘ │
└───────┼────────────────────────────────┼───────┘
        │                │                │
        ▼                ▼                ▼
┌─────────────────────────────────────────────────┐
│              Goals Store (Pinia)                │
│                                                 │
│  • fetchGoalWithProgress()                     │
│  • refreshProgress()                           │
│  • saveGoal() / deleteGoal()                   │
│                                                 │
│  状态:                                          │
│  • currentGoal                                 │
│  • studyRecordsMinutes                         │
│  • pomodoroMinutes                             │
│  • totalAchieved (计算属性)                    │
│  • progressPercent (计算属性)                  │
└────────────────────┬────────────────────────────┘
                     │ 响应式更新
        ┌────────────┼────────────┐
        ▼            ▼            ▼
┌───────────┐ ┌──────────┐ ┌─────────────┐
│GoalManager│ │Pomodoro  │ │StatsDashboard│
│           │ │Timer     │ │              │
│ 进度条显示 │ │自动刷新  │ │图表更新      │
───────────┘ └──────────┘ └─────────────┘
```

---

## 🚀 使用示例

### 在任意组件中刷新目标进度

```typescript
import { useGoalsStore } from '@/stores/goals';

const goalsStore = useGoalsStore();

// 添加学习记录后
await addStudyRecord(...);
await goalsStore.refreshProgress(userId); // 自动更新!

// 或者直接调用 Store 方法保存目标
await goalsStore.saveGoal(userId, 'weekly', 420);
```

### 监听目标完成状态

```typescript
import { useGoalsStore } from '@/stores/goals';
import { watch } from 'vue';

const goalsStore = useGoalsStore();

// 监听目标完成
watch(() => goalsStore.isGoalCompleted, (completed) => {
  if (completed) {
    // 触发庆祝动画或通知
    showCelebration();
  }
});
```

---

## ️ 配置说明

### 缓存配置

```typescript
// src/stores/goals.ts
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 修改缓存时间
const CACHE_DURATION = 10 * 60 * 1000; // 改为10分钟
```

### 清除缓存

```typescript
// 清除指定用户的所有缓存
goalsStore.clearCache(userId);

// 清除指定类型缓存
goalsStore.clearCache(userId, 'weekly');
```

---

## 🐛 常见问题

### Q1: 进度没有自动更新?

**检查清单:**
1. 确认调用了 `goalsStore.refreshProgress(userId)`
2. 检查 Supabase RLS 策略是否正确
3. 查看浏览器控制台是否有错误
4. 硬刷新页面 (Ctrl+Shift+R) 清除缓存

### Q2: 多个用户数据混乱?

**不会发生**,因为:
- Store 状态按 `userId` 隔离
- 缓存键名包含 `userId`
- 每次查询都带有 `user_id` 过滤

### Q3: 如何禁用缓存?

```typescript
// 临时禁用缓存
const cached = null; // 跳过缓存读取

// 或修改 CACHE_DURATION 为 0
const CACHE_DURATION = 0;
```

---

## 📝 后续优化建议

- [ ] 添加 WebSocket 实时更新 (Supabase Realtime)
- [ ] 添加进度历史记录图表
- [ ] 支持多目标并行追踪
- [ ] 添加目标完成成就系统
- [ ] 优化缓存策略 (按数据变化频率)

---

## 🎉 总结

通过 **Pinia Store** 实现了:

✅ **单一数据源** - 所有组件共享同一份数据  
✅ **自动同步** - 任意组件修改,全局自动响应  
✅ **无需后端改动** - 纯前端实现实时交互  
✅ **缓存优化** - 减少不必要的网络请求  
✅ **类型安全** - TypeScript 完整支持  

现在你的学习目标功能已经具备完整的实时交互能力! 🚀

---

**最后更新:** 2026-05-06  
**实现方式:** Pinia Store + Composables  
**后端依赖:** 无修改 (仅使用现有 Supabase 表)