1111111111111111111111111111111111113333# 更新日志 (Changelog)

## [v1.2.1] - 2026-05-06

### 🎯 优化改进
- **学习记录排序优化**
  - 从按`date`字段排序改为按`created_at`字段排序
  - 最新添加的记录始终显示在最上面
  - 同一天多条记录也能按添加时间正确排序
  - 提升用户体验,符合"最新优先"的直觉

### 🔧 技术实现
- `useStudyRecords.ts`: 修改`fetchRecords()`函数的排序逻辑
- 使用`.order('created_at', { ascending: false })`替代`.order('date', { ascending: false })`

### 📝 文档
- 新增 `RECORD_SORTING_UPDATE.md` - 详细说明排序优化的原因和效果

---

## [v1.2.0] - 2026-05-06

### ✨ 新增功能
- **番茄钟自动学习记录**
  - 添加"结束学习"按钮,支持手动结束专注并创建记录
  - 倒计时结束时自动创建学习记录
  - 用户未填写科目时,默认使用"专注"作为科目名称
  - 按钮位于计时器右上角,尺寸较小,不干扰主要操作

### 🔧 技术实现
- `usePomodoro.ts`: 新增`elapsedMinutes`计算属性,追踪已用时长
- `PomodoroTimer.vue`: 
  - 添加`handleEndStudy()`函数处理手动结束
  - UI中添加绝对定位的"结束学习"按钮
  - 集成completeFocus函数自动创建数据库记录
- 数据记录包含`study_records`和`pomodoro_sessions`两张表

### 📝 文档
- 新增 `POMODORO_AUTO_RECORD.md` - 详细功能说明和使用指南

---

## [v1.1.0] - 2026-05-06

### ✨ 新增功能
- **用户设置面板组件** (`UserSettingsPanel.vue`)
  - 整合个人资料管理和偏好设置
  - 双标签页设计(👤 个人资料 + 🎨 偏好设置)
  - 通过右上角⚙️按钮触发弹窗显示
  - 实时同步到Supabase数据库

### 🎯 优化改进
- **DashboardView布局优化**
  - ❌ 移除ProfileCard组件的默认展示
  - ❌ 移除PreferencesPanel组件的默认展示
  - ✅ GoalManager改为全宽显示,更突出核心功能
  - ✅ 页面更简洁,聚焦学习目标、番茄钟和统计图表

- **用户体验提升**
  - 用户设置改为按需访问,不占用Dashboard空间
  - 任意页面均可通过右上角按钮快速访问设置
  - 优雅的动画效果和即时反馈

### 📝 文档完善
- 新增 `USER_SETTINGS_QUICKSTART.md` - 5分钟快速上手指南
- 新增 `USER_SETTINGS_GUIDE.md` - 完整使用指南
- 新增 `USER_SETTINGS_DEMO.md` - 功能演示说明
- 新增 `USER_SETTINGS_CHANGES.md` - 详细改动总结
- 新增 `USER_SETTINGS_CHECKLIST.md` - 功能完成清单
- 新增 `USER_SETTINGS_FINAL_SUMMARY.md` - 最终总结报告
- 更新 `README.md` - 添加新功能介绍

### 🔧 技术实现
- Vue 3 Composition API
- Element Plus UI组件库
- Pinia全局状态管理
- Supabase数据同步
- TypeScript类型安全

### 📊 代码统计
- 新增代码: 359行 (UserSettingsPanel.vue)
- 删除代码: 25行 (DashboardView.vue优化)
- 文档: 6个文件,900+行
- 净变化: +334行代码

### ✅ 测试验证
- 无编译错误
- 无TypeScript错误
- 热更新(HMR)正常
- 功能测试全部通过

---

## [v1.0.0] - 2026-05-06 (初始版本)

### ✨ 基础功能
- 用户认证系统(Supabase Auth)
- 学习记录管理
- 目标管理系统
- 番茄钟计时器
- 数据统计与图表
- 工作流可视化编辑器

---

**版本说明**:
- v1.0.0: 项目基础功能完成
- v1.1.0: 用户设置面板整合,DashbaordView优化
- v1.2.0: 番茄钟自动学习记录功能
- v1.2.1: 学习记录排序优化(按创建时间降序)
