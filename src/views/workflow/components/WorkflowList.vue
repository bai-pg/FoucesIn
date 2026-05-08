<script setup lang="ts">
import { useWorkflowStorage } from '../composables/useWorkflowStorage';
import type { WorkflowSchema } from '../types';

defineProps<{
  workflows: WorkflowSchema[];
  currentWorkflowId?: string;
}>();

const emit = defineEmits<{
  (e: 'select', workflow: WorkflowSchema): void;
  (e: 'delete', id: string): void;
  (e: 'create'): void;
}>();

const { loading, deleteWorkflow } = useWorkflowStorage();

function handleSelect(workflow: WorkflowSchema) {
  emit('select', workflow);
}

function handleDelete(id: string) {
  emit('delete', id);
}

function handleCreate() {
  emit('create');
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '未保存';
  return new Date(dateStr).toLocaleString('zh-CN');
}
</script>

<template>
  <div class="workflow-list">
    <div class="workflow-list-header">
      <h3>我的工作流</h3>
      <button @click="handleCreate" class="btn-create">
        <i class="iconify" data-icon="heroicons:plus"></i>
        新建工作流
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="iconify animate-spin" data-icon="heroicons:arrow-path"></i>
      <span>加载中...</span>
    </div>

    <div v-else-if="workflows.length === 0" class="empty-state">
      <i class="iconify" data-icon="heroicons:document-text"></i>
      <p>暂无工作流</p>
      <button @click="handleCreate" class="btn-create-empty">
        创建第一个工作流
      </button>
    </div>

    <div v-else class="workflow-list-body">
      <div
        v-for="workflow in workflows"
        :key="workflow.id"
        :class="['workflow-item', { active: workflow.id === currentWorkflowId }]"
        @click="handleSelect(workflow)"
      >
        <div class="workflow-item-header">
          <h4 class="workflow-item-title">{{ workflow.name }}</h4>
          <button
            @click.stop="handleDelete(workflow.id!)"
            class="btn-delete"
            title="删除"
          >
            <i class="iconify" data-icon="heroicons:trash"></i>
          </button>
        </div>
        <p v-if="workflow.description" class="workflow-item-desc">
          {{ workflow.description }}
        </p>
        <div class="workflow-item-meta">
          <span class="meta-item">
            <i class="iconify" data-icon="heroicons:rectangle-stack"></i>
            {{ workflow.nodes?.length || 0 }} 个节点
          </span>
          <span class="meta-item">
            <i class="iconify" data-icon="heroicons:calendar"></i>
            {{ formatDate(workflow.updated_at) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workflow-list {
  @apply flex flex-col h-full bg-white/50 backdrop-blur-md rounded-lg shadow-lg;
}

.workflow-list-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.workflow-list-header h3 {
  @apply text-lg font-semibold text-gray-800;
}

.btn-create {
  @apply flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-md
         hover:bg-teal-700 transition-colors text-sm font-medium;
}

.loading-state,
.empty-state {
  @apply flex flex-col items-center justify-center py-12 text-gray-500;
}

.loading-state .iconify {
  @apply w-8 h-8 mb-2;
}

.empty-state .iconify {
  @apply w-12 h-12 mb-3 text-gray-400;
}

.empty-state p {
  @apply mb-4 text-sm;
}

.btn-create-empty {
  @apply px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700
         transition-colors text-sm font-medium;
}

.workflow-list-body {
  @apply flex-1 overflow-y-auto p-4 space-y-3;
}

.workflow-item {
  @apply p-3 rounded-lg cursor-pointer transition-all border border-transparent
         hover:border-teal-300 hover:bg-white/60;
}

.workflow-item.active {
  @apply border-teal-500 bg-teal-50/60;
}

.workflow-item-header {
  @apply flex items-center justify-between mb-2;
}

.workflow-item-title {
  @apply text-base font-medium text-gray-800;
}

.btn-delete {
  @apply p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded
         transition-colors opacity-0 group-hover:opacity-100;
}

.workflow-item:hover .btn-delete {
  @apply opacity-100;
}

.workflow-item-desc {
  @apply text-sm text-gray-600 mb-2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workflow-item-meta {
  @apply flex items-center gap-3 text-xs text-gray-500;
}

.meta-item {
  @apply flex items-center gap-1;
}

.meta-item .iconify {
  @apply w-3.5 h-3.5;
}
</style>