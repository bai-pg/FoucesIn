# Pinia Store 学习记录管理

## 概述

项目现在使用 **Pinia** 统一管理学习记录和笔记状态，实现组件间的实时联动和数据同步。

## Store 功能

### 核心特性

1. **集中状态管理**：所有学习记录和笔记状态统一存储在 `useStudyRecordsStore`
2. **实时同步**：笔记修改后立即更新记录列表，无需手动刷新
3. **数据缓存**：本地缓存 5 分钟，减少重复的数据库请求
4. **排序功能**：自动按创建时间倒序排列，最新的记录在前
5. **错误处理**：统一的错误捕获和用户提示

### API 方法

#### 查询方法

- `fetchRecords()`: 获取所有学习记录（带缓存）
- `getRecordNotes(recordId)`: 获取指定记录的笔记
- `hasNotes(recordId)`: 检查记录是否有笔记

#### CRUD 操作

- `createRecord(record)`: 创建新的学习记录
- `updateRecord(recordId, updates)`: 更新学习记录
- `updateNotes(recordId, content)`: **专门更新笔记的方法**
- `deleteRecord(recordId)`: 删除学习记录

#### 工具方法

- `refresh()`: 清除缓存并重新获取数据

## 使用示例

### 在组件中使用

```typescript
import { useStudyRecordsStore } from '@/stores/studyRecords';

const studyRecordsStore = useStudyRecordsStore();

// 获取记录
await studyRecordsStore.fetchRecords();

// 访问记录列表（自动排序）
const records = studyRecordsStore.sortedRecords;

// 更新笔记
await studyRecordsStore.updateNotes(recordId, '<h2>学习笔记</h2><p>内容...</p>');

// 检查是否有笔记
const hasNotes = studyRecordsStore.hasNotes(recordId);
```

### 联动效果

```
┌─────────────────┐      更新笔记      ┌──────────────────┐
│  RecordList     │ ────────────────> │ LearningNotes    │
│  (记录列表)      │                   │ Dialog(笔记抽屉)  │
└─────────────────┘                   └──────────────────┘
       ▲                                        │
       │                                        │ 保存笔记
       │                                        ▼
       │                              ┌──────────────────┐
       └──────────────────────────── │  studyRecords    │
              自动更新               │  Store (Pinia)    │
                                     └──────────────────┘
```

## 缓存机制

- **缓存时长**：5 分钟
- **缓存键**：`records_{userId}`
- **清除时机**：创建/更新/删除记录时自动清除

## 优势

✅ **单一数据源**：所有组件共享同一份数据
✅ **自动响应式**：数据变化自动触发视图更新
✅ **减少请求**：缓存机制减少数据库访问
✅ **易于维护**：业务逻辑集中在 store 中
✅ **类型安全**：完整的 TypeScript 支持
