<script setup lang="ts">
import { ref, watch, onBeforeUnmount, shallowRef, computed } from 'vue'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

interface Props {
  modelValue: boolean
  recordId?: number
  subject?: string
  date?: string
  content?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', recordId: number, content: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 使用 computed 实现 v-model 双向绑定
const drawerVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 模式：view（查看）或 edit（编辑）
const mode = ref<'view' | 'edit'>('view')

// 编辑器实例
const editorRef = shallowRef<IDomEditor>()

// 内容
const html = ref('')

// 工具栏配置
const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: [
    'group-video',
    'insertTable',
    'header5',
    'header6'
  ]
}

// 编辑器配置
const editorConfig: Partial<IEditorConfig> = {
  placeholder: '记录你的学习心得、反思总结...',
  MENU_CONF: {
    uploadImage: {
      // 使用 Base64 内联图片，无需后端服务器
      base64LimitSize: 50 * 1024, // 50KB 以下的图片转为 base64
      customUpload(file: File, insertFn: Function) {
        // 将图片转为 base64 并插入编辑器
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64 = e.target?.result as string
          insertFn(base64, file.name, base64)
        }
        reader.readAsDataURL(file)
      }
    }
  }
}

// 监听抽屉打开，初始化内容
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.content) {
    html.value = props.content
    // 如果有内容，默认为查看模式
    mode.value = 'view'
  } else if (newVal) {
    html.value = ''
    // 如果没有内容，默认为编辑模式
    mode.value = 'edit'
  }
})

// 切换到编辑模式
const switchToEdit = () => {
  mode.value = 'edit'
}

// 切换到查看模式
const switchToView = () => {
  mode.value = 'view'
}

// 编辑器创建回调
const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor
}

// 保存笔记
const handleSave = () => {
  if (!props.recordId) return
  
  const content = html.value.trim()
  emit('save', props.recordId, content)
  handleClose()
}

// 关闭抽屉
const handleClose = () => {
  emit('update:modelValue', false)
}

// 组件销毁时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
</script>

<template>
  <el-drawer
    v-model="drawerVisible"
    :title="mode === 'view' ? '📖 学习笔记' : ' 编辑笔记'"
    direction="rtl"
    size="65%"
    :close-on-click-modal="false"
    :z-index="99999"
    :modal="true"
    :modal-class="'notes-drawer-modal'"
    :append-to-body="true"
    :lock-scroll="true"
    class="learning-notes-drawer"
  >
    <!-- 头部信息 -->
    <div class="drawer-header-info">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ subject || '未命名科目' }}</h3>
          <p class="text-sm text-gray-600">📅 {{ date || '未知日期' }}</p>
        </div>
        <!-- 模式切换按钮 -->
        <div class="flex gap-2">
          <el-button
            v-if="mode === 'view' && html"
            @click="switchToEdit"
            type="primary"
            size="small"
            :icon="'Edit'"
          >
            编辑
          </el-button>
          <el-button
            v-if="mode === 'edit'"
            @click="switchToView"
            size="small"
          >
            预览
          </el-button>
        </div>
      </div>
    </div>

    <div class="drawer-content">
      <!-- 查看模式：纯文本展示 -->
      <div v-if="mode === 'view'" class="notes-view-mode">
        <div v-if="html" class="notes-content" v-html="html"></div>
        <div v-else class="notes-empty">
          <div class="text-6xl mb-4">📝</div>
          <p class="text-gray-500 text-lg mb-4">暂无学习笔记</p>
          <el-button type="primary" @click="switchToEdit">
            开始编辑
          </el-button>
        </div>
      </div>
      
      <!-- 编辑模式：富文本编辑器 -->
      <div v-else class="notes-edit-mode">
        <!-- 工具栏 -->
        <Toolbar
          :editor="editorRef"
          :default-config="toolbarConfig"
          mode="default"
          class="editor-toolbar"
        />
        
        <!-- 编辑器主体 -->
        <Editor
          v-model="html"
          :default-config="editorConfig"
          mode="default"
          @on-created="handleCreated"
          class="editor-main"
        />
      </div>
    </div>
    
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose" size="large">
          关闭
        </el-button>
        <el-button 
          v-if="mode === 'edit'" 
          type="primary" 
          @click="handleSave" 
          size="large"
        >
          💾 保存笔记
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped>
/* 抽屉样式 */
.learning-notes-drawer :deep(.el-drawer) {
  display: flex;
  flex-direction: column;
}

/* 抽屉头部 */
.drawer-header-info {
  padding: 12px 20px;
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.drawer-header-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.drawer-header-info p {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* 抽屉内容区 - 使用 flex 布局 */
.drawer-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

/* 查看模式样式 */
.notes-view-mode {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: var(--el-bg-color);
}

.notes-content {
  max-width: 100%;
  line-height: 1.8;
  color: var(--el-text-color-primary);
}

/* 笔记内容样式美化 */
.notes-content :deep(h1),
.notes-content :deep(h2),
.notes-content :deep(h3),
.notes-content :deep(h4),
.notes-content :deep(h5),
.notes-content :deep(h6) {
  margin: 24px 0 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--el-text-color-primary);
}

.notes-content :deep(h1) { font-size: 28px; border-bottom: 2px solid var(--el-border-color); padding-bottom: 8px; }
.notes-content :deep(h2) { font-size: 24px; }
.notes-content :deep(h3) { font-size: 20px; }
.notes-content :deep(h4) { font-size: 18px; }

.notes-content :deep(p) {
  margin: 16px 0;
  line-height: 1.8;
}

.notes-content :deep(ul),
.notes-content :deep(ol) {
  margin: 16px 0;
  padding-left: 32px;
}

.notes-content :deep(li) {
  margin: 8px 0;
  line-height: 1.8;
}

.notes-content :deep(blockquote) {
  margin: 16px 0;
  padding: 12px 20px;
  border-left: 4px solid var(--el-color-primary);
  background: var(--el-fill-color-lighter);
  color: var(--el-text-color-secondary);
}

.notes-content :deep(code) {
  background: var(--el-fill-color);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.notes-content :deep(pre) {
  background: var(--el-fill-color-darker);
  color: var(--el-text-color-primary);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

.notes-content :deep(pre code) {
  background: transparent;
  padding: 0;
}

.notes-content :deep(a) {
  color: var(--el-color-primary);
  text-decoration: none;
}

.notes-content :deep(a:hover) {
  text-decoration: underline;
}

.notes-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notes-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.notes-content :deep(th),
.notes-content :deep(td) {
  border: 1px solid var(--el-border-color);
  padding: 12px;
  text-align: left;
}

.notes-content :deep(th) {
  background: var(--el-fill-color);
  font-weight: 600;
}

/* 空笔记样式 */
.notes-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

/* 编辑模式样式 */
.notes-edit-mode {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

/* 编辑器主体 */
.editor-main {
  flex: 1;
  overflow-y: auto;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

/* 底部操作区 */
.drawer-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 强制遮罩层覆盖所有元素 */
:deep(.notes-drawer-modal) {
  z-index: 99999 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
}
</style>

<style>
/* 全局样式 - wangEditor 主题适配 */
.w-e-text-container {
  background-color: #fff !important;
}

.dark .w-e-text-container {
  background-color: #1e293b !important;
  color: #e2e8f0 !important;
}

.dark .w-e-toolbar {
  background-color: #334155 !important;
  border-color: #475569 !important;
}

.dark .w-e-toolbar button {
  color: #e2e8f0 !important;
}

.dark .w-e-toolbar button:hover {
  background-color: #475569 !important;
}

/* 抽屉样式优化 */
.learning-notes-drawer .el-drawer__body {
  padding: 0;
  display: flex;
  flex-direction: column;
}
</style>
