# 快速开始

## 1. 在 Supabase 中创建表

1. 登录 [Supabase 控制台](https://app.supabase.com)
2. 选择你的项目
3. 进入 SQL Editor
4. 复制 `supabase_schema.sql` 文件的内容并执行

## 2. 启动项目

```bash
cd vuepabase
npm run dev
```

项目将在 http://localhost:3001/ 运行

## 3. 使用工作流画布

1. 登录你的账号
2. 点击左侧导航的 "Workflow" 菜单
3. 点击 "新建工作流" 按钮
4. 在画布中：
   - 点击 "任务节点" 或 "条件节点" 添加节点
   - 从节点边缘拖出连线连接节点
   - 拖拽节点调整位置
5. 点击 "保存" 保存工作流

## 4. 功能说明

- **添加节点**: 快速添加任务或条件节点
- **加载示例**: 加载预设的示例工作流
- **清空画布**: 清空当前画布
- **保存**: 保存到 Supabase 数据库
- **导出 JSON**: 下载 JSON 文件用于备份或分享

## 5. 快捷键

- `Delete`: 删除选中的节点或连线
- `Ctrl+Z`: 撤销
- `Ctrl+Y`: 重做
- `Ctrl+C`: 复制
- `Ctrl+V`: 粘贴

## 6. 更多文档

详细文档请查看 [WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md)