<script setup lang="ts">
defineProps<{
  loading?: boolean;
  workflowName?: string;
  connectMode?: boolean;
}>();

const emit = defineEmits<{
  (e: 'addNode', type: string): void;
  (e: 'toggleConnect'): void;
  (e: 'clear'): void;
  (e: 'loadSample'): void;
  (e: 'save'): void;
  (e: 'export'): void;
}>();

function handleAddNode(type: string) {
  emit('addNode', type);
}

function handleToggleConnect() {
  emit('toggleConnect');
}

function handleClear() {
  if (confirm('确定要清空画布吗?')) {
    emit('clear');
  }
}

function handleLoadSample() {
  emit('loadSample');
}

function handleSave() {
  emit('save');
}

function handleExport() {
  emit('export');
}
</script>

<template>
  <div class="workflow-toolbar">
    <div class="toolbar-group">
      <span class="toolbar-label">添加节点:</span>
      <button @click="handleAddNode('task')" class="toolbar-btn">
        <i class="iconify" data-icon="heroicons:rectangle-stack"></i>
        任务节点
      </button>
      <button @click="handleAddNode('condition')" class="toolbar-btn">
        <i class="iconify" data-icon="heroicons:git-branch"></i>
        条件节点
      </button>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-group">
      <span class="toolbar-label">操作:</span>
      <button
        @click="handleToggleConnect"
        :class="['toolbar-btn', connectMode ? 'toolbar-btn-active' : '']"
      >
        <i class="iconify" :data-icon="connectMode ? 'heroicons:link-slash' : 'heroicons:link'"></i>
        {{ connectMode ? '退出连线' : '连线模式' }}
      </button>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-group">
      <button @click="handleLoadSample" class="toolbar-btn">
        <i class="iconify" data-icon="heroicons:sparkles"></i>
        加载示例
      </button>
      <button @click="handleClear" class="toolbar-btn">
        <i class="iconify" data-icon="heroicons:trash"></i>
        清空画布
      </button>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-group">
      <button
        @click="handleSave"
        :disabled="loading"
        class="toolbar-btn toolbar-btn-primary"
      >
        <i class="iconify" data-icon="heroicons:save"></i>
        {{ loading ? '保存中...' : '保存' }}
      </button>
      <button @click="handleExport" class="toolbar-btn">
        <i class="iconify" data-icon="heroicons:arrow-down-tray"></i>
        导出 JSON
      </button>
    </div>

    <div v-if="workflowName" class="workflow-name">
      <i class="iconify" data-icon="heroicons:document"></i>
      {{ workflowName }}
    </div>
  </div>
</template>

<style scoped>
.workflow-toolbar {
  @apply flex items-center gap-4 p-3 bg-white/50 backdrop-blur-md
         rounded-lg shadow-md mb-4 flex-wrap;
}

.toolbar-group {
  @apply flex items-center gap-2;
}

.toolbar-label {
  @apply text-sm text-gray-600 font-medium;
}

.toolbar-btn {
  @apply flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
         text-gray-700 bg-white/60 rounded-md border border-gray-300
         hover:bg-white hover:border-teal-400 hover:text-teal-600
         transition-all disabled:opacity-50 disabled:cursor-not-allowed;
}

.toolbar-btn-primary {
  @apply bg-teal-600 text-white border-teal-600
         hover:bg-teal-700 hover:border-teal-700;
}

.toolbar-btn-active {
  @apply bg-orange-500 text-white border-orange-500
         hover:bg-orange-600 hover:border-orange-600;
}

.toolbar-divider {
  @apply w-px h-6 bg-gray-300;
}

.workflow-name {
  @apply ml-auto flex items-center gap-2 text-sm text-gray-600 font-medium;
}

.workflow-name .iconify {
  @apply w-4 h-4;
}

.toolbar-btn .iconify {
  @apply w-4 h-4;
}
</style>