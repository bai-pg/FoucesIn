# AntV X6 工作流画布使用文档

## 功能概述

学习路径编排功能允许用户通过可视化画布拖拽连线，编排自己的学习计划工作流。节点代表不同科目任务，连线代表学习顺序。

## 技术栈

- **AntV X6**: 图编辑引擎
- **Vue 3 Composition API**: 组件逻辑
- **Supabase**: 数据存储和同步
- **TypeScript**: 类型安全

## 文件结构

```
src/views/workflow/
├── types.ts                          # TypeScript 类型定义
├── WorkflowCanvasView.vue            # 主视图组件
├── components/
│   ├── WorkflowList.vue              # 工作流列表组件
│   └── WorkflowToolbar.vue           # 工具栏组件
├── composables/
│   ├── useCanvasInteraction.ts       # 画布交互逻辑
│   └── useWorkflowStorage.ts         # 数据存储逻辑
└── utils/
    └── helpers.ts                    # 工具函数
```

## 数据库配置

### 1. 在 Supabase 控制台创建表

复制 `supabase_schema.sql` 文件内容，在 Supabase 控制台的 SQL Editor 中执行。

该 SQL 脚本会创建：
- `workflows` 表：存储工作流数据
- 行级安全策略（RLS）：确保用户只能访问自己的数据
- 自动更新时间戳的触发器

### 2. 表结构说明

```sql
workflows (
  id UUID,              -- 工作流唯一标识
  user_id UUID,         -- 用户ID（关联 auth.users）
  name TEXT,            -- 工作流名称
  description TEXT,     -- 工作流描述
  nodes JSONB,          -- 节点数据（JSON数组）
  edges JSONB,          -- 连线数据（JSON数组）
  created_at TIMESTAMP, -- 创建时间
  updated_at TIMESTAMP  -- 更新时间
)
```

## JSON Schema 格式

### 完整 Schema 示例

```json
{
  "id": "uuid-string",
  "user_id": "user-uuid",
  "name": "我的学习路径",
  "description": "前端技术栈学习路线",
  "nodes": [
    {
      "id": "vue3",
      "type": "task",
      "x": 50,
      "y": 50,
      "label": "Vue3 学习",
      "description": "学习 Vue3 核心概念"
    },
    {
      "id": "x6",
      "type": "task",
      "x": 250,
      "y": 50,
      "label": "AntV X6 集成"
    }
  ],
  "edges": [
    {
      "id": "edge_vue3_x6",
      "source": "vue3",
      "target": "x6",
      "label": "前置条件"
    }
  ]
}
```

### 节点类型 (NodeType)

- `task`: 普通任务节点
- `condition`: 条件分支节点
- `start`: 起始节点
- `end`: 结束节点

### 节点属性 (WorkflowNode)

```typescript
interface WorkflowNode {
  id: string;           // 节点唯一标识
  type: NodeType;       // 节点类型
  x: number;            // X 坐标
  y: number;            // Y 坐标
  label: string;        // 节点标签
  description?: string; // 节点描述
  subject?: string;     // 科目名称
  duration?: number;    // 预计时长（分钟）
  data?: Record<string, any>; // 自定义数据
}
```

### 连线属性 (WorkflowEdge)

```typescript
interface WorkflowEdge {
  id: string;           // 连线唯一标识
  source: string;       // 源节点 ID
  target: string;       // 目标节点 ID
  label?: string;       // 连线标签
  condition?: string;   // 条件表达式
}
```

## 功能特性

### 1. 画布操作

- ✅ 拖拽节点调整位置
- ✅ 从节点边缘拖出连线
- ✅ 删除节点（选中后按 Delete 键）
- ✅ 撤销/重做（Ctrl+Z / Ctrl+Y）
- ✅ 网格对齐和吸附线

### 2. 工作流管理

- ✅ 创建工作流
- ✅ 保存工作流到 Supabase
- ✅ 加载已有工作流
- ✅ 删除工作流
- ✅ 导出为 JSON 文件

### 3. 工具栏功能

- **添加节点**: 快速添加任务节点或条件节点
- **加载示例**: 加载预设的示例工作流
- **清空画布**: 清空当前画布
- **保存**: 保存到数据库
- **导出 JSON**: 下载 JSON 文件

## 使用方法

### 创建工作流

1. 点击左侧"新建工作流"按钮
2. 在画布中拖拽添加节点
3. 从节点边缘拖出连线连接节点
4. 点击"保存"按钮保存工作流

### 编辑已有工作流

1. 在左侧列表中选择工作流
2. 修改节点位置或连线关系
3. 点击"保存"更新工作流

### 导出工作流

1. 点击工具栏"导出 JSON"按钮
2. 浏览器自动下载 JSON 文件
3. 可用于备份或分享

## API 接口

### Composables

#### useWorkflowStorage

工作流数据管理，提供以下方法：

```typescript
const {
  workflows,              // 工作流列表
  currentWorkflow,        // 当前工作流
  loading,                // 加载状态
  fetchWorkflows,         // 获取所有工作流
  fetchWorkflowById,      // 获取单个工作流
  createWorkflow,         // 创建工作流
  updateWorkflow,         // 更新工作流
  deleteWorkflow,         // 删除工作流
  saveCurrentWorkflow,    // 保存当前工作流
} = useWorkflowStorage();
```

#### useCanvasInteraction

画布交互逻辑，提供以下方法：

```typescript
const {
  graph,                  // X6 Graph 实例
  containerRef,           // 容器引用
  initGraph,              // 初始化画布
  addNode,                // 添加节点
  addNodes,               // 批量添加节点
  addEdge,                // 添加连线
  addEdges,               // 批量添加连线
  loadWorkflow,           // 加载工作流
  exportToSchema,         // 导出为 Schema
  clearCanvas,            // 清空画布
  disposeGraph,           // 销毁画布
} = useCanvasInteraction();
```

## 开发建议

### 1. 自定义节点样式

修改 `useCanvasInteraction.ts` 中的 `addNode` 函数，自定义节点外观：

```typescript
graph.value.addNode({
  // ... 其他配置
  attrs: {
    body: {
      fill: '#fff',      // 背景色
      stroke: '#5F95FF', // 边框色
      strokeWidth: 2,    // 边框宽度
    },
    label: {
      fill: '#333',      // 文字颜色
      fontSize: 14,      // 字体大小
    },
  },
});
```

### 2. 添加连线规则

在 `initGraph` 函数中配置连线规则：

```typescript
connecting: {
  router: 'manhattan',   // 连线路由算法
  connector: 'rounded',  // 连线样式
  allowLoop: false,      // 禁止环路
  // ... 其他配置
}
```

### 3. 扩展节点类型

在 `types.ts` 中添加新的节点类型，并在工具栏中添加对应按钮。

## 注意事项

1. **数据安全**: 所有数据都通过 Supabase RLS 策略保护，确保用户只能访问自己的数据
2. **性能优化**: 大型工作流（100+ 节点）可能需要优化渲染性能
3. **浏览器兼容**: 建议使用现代浏览器（Chrome、Firefox、Safari 最新版）
4. **移动端**: 当前版本主要针对桌面端优化，移动端体验可能受限

## 故障排查

### 画布无法显示

- 检查 Supabase 环境变量是否正确配置
- 检查浏览器控制台是否有错误信息
- 确认 `@antv/x6` 依赖已正确安装

### 数据无法保存

- 检查 Supabase 控制台是否已执行 SQL 脚本创建表
- 检查行级安全策略是否启用
- 查看浏览器控制台的错误信息

### 连线无法创建

- 确保从节点的连接点（边缘小圆点）拖出
- 检查是否允许环路（默认禁止）
- 检查节点是否已正确加载

## 示例代码

### 导入工作流

```typescript
import { loadWorkflow } from './composables/useCanvasInteraction';

const myWorkflow = {
  name: '示例',
  nodes: [...],
  edges: [...],
};

loadWorkflow(myWorkflow);
```

### 导出并下载

```typescript
import { exportToSchema } from './composables/useCanvasInteraction';

const schema = exportToSchema('我的工作流', '描述');
const json = JSON.stringify(schema, null, 2);
// 下载逻辑...
```

## 更新日志

- **v1.0.0** (2026-05-02)
  - 初始版本发布
  - 支持基本的工作流创建、编辑、保存功能
  - 集成 Supabase 数据存储
  - 支持 JSON 导入导出

## 许可证

MIT License