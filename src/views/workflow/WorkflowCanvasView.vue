<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue';
import { useCanvasInteraction } from './composables/useCanvasInteraction';
import { useWorkflowStorage } from './composables/useWorkflowStorage';
import { createSampleWorkflow, generateId } from './utils/helpers';
import WorkflowList from './components/WorkflowList.vue';
import WorkflowToolbar from './components/WorkflowToolbar.vue';
import type { WorkflowSchema, WorkflowNode } from './types';

const {
  workflows,
  currentWorkflow,
  loading: storageLoading,
  fetchWorkflows,
  fetchWorkflowById,
  deleteWorkflow,
  saveCurrentWorkflow,
} = useWorkflowStorage();

const {
  graph,
  containerRef,
  initGraph,
  addNode,
  loadWorkflow,
  exportToSchema,
  clearCanvas,
} = useCanvasInteraction();

const workflowName = ref('未命名工作流');
const workflowDescription = ref('');
const isEditing = ref(false);

// 添加节点对话框
const showNodeDialog = ref(false);
const nodeTypeToAdd = ref('');
const nodeNameInput = ref('');
const nodeNameInputRef = ref<HTMLInputElement | null>(null);

// 连线模式
const isConnectingMode = ref(false);

// 监听对话框显示状态，自动聚焦输入框
watch(showNodeDialog, async (val) => {
  if (val) {
    await nextTick();
    nodeNameInputRef.value?.focus();
    nodeNameInputRef.value?.select();
  }
});

// 初始化画布
onMounted(async () => {
  if (containerRef.value) {
    initGraph({
      width: 800,
      height: 600,
      enableGrid: true,
      enableSnapline: true,
    });
  }
  
  // 加载用户的工作流列表
  await fetchWorkflows();
});

// 添加节点
function handleAddNode(type: string) {
  nodeTypeToAdd.value = type;
  nodeNameInput.value = type === 'task' ? '新任务' : '条件判断';
  showNodeDialog.value = true;
}

// 确认添加节点
function confirmAddNode() {
  if (!nodeNameInput.value.trim()) {
    return;
  }
  
  const newNode: WorkflowNode = {
    id: generateId(),
    type: nodeTypeToAdd.value as any,
    x: 100 + Math.random() * 200,
    y: 100 + Math.random() * 200,
    label: nodeNameInput.value.trim(),
  };
  addNode(newNode);
  showNodeDialog.value = false;
  nodeNameInput.value = '';
}

// 取消添加节点
function cancelAddNode() {
  showNodeDialog.value = false;
  nodeNameInput.value = '';
}

// 清空画布
function handleClear() {
  clearCanvas();
  workflowName.value = '未命名工作流';
  workflowDescription.value = '';
  isEditing.value = false;
}

// 加载示例
function handleLoadSample() {
  const sample = createSampleWorkflow();
  loadWorkflow(sample);
  workflowName.value = sample.name;
  workflowDescription.value = sample.description || '';
}

// 保存工作流
async function handleSave() {
  const schema = exportToSchema(
    workflowName.value,
    workflowDescription.value
  );
  
  // 如果正在编辑现有工作流，添加ID
  if (currentWorkflow.value?.id) {
    schema.id = currentWorkflow.value.id;
    schema.user_id = currentWorkflow.value.user_id;
    schema.created_at = currentWorkflow.value.created_at;
    schema.updated_at = currentWorkflow.value.updated_at;
  }
  
  const result = await saveCurrentWorkflow(schema);
  if (result) {
    isEditing.value = false;
  }
}

// 导出 JSON
function handleExport() {
  const schema = exportToSchema(
    workflowName.value,
    workflowDescription.value
  );
  
  const json = JSON.stringify(schema, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${workflowName.value || 'workflow'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// 选择工作流
async function handleSelectWorkflow(workflow: WorkflowSchema) {
  if (workflow.id) {
    const data = await fetchWorkflowById(workflow.id);
    if (data) {
      loadWorkflow(data);
      workflowName.value = data.name;
      workflowDescription.value = data.description || '';
      isEditing.value = true;
    }
  }
}

// 删除工作流
async function handleDeleteWorkflow(id: string) {
  await deleteWorkflow(id);
}

// 创建新工作流
function handleCreateWorkflow() {
  handleClear();
}

// 切换连线模式
function toggleConnectMode() {
  isConnectingMode.value = !isConnectingMode.value;
  
  if (graph.value) {
    // X6 通过配置 controlling 来控制连线行为
    // 这里我们通过提示用户如何操作来实现连线
    if (isConnectingMode.value) {
      // 提示用户从节点的输出端口拖拽到输入端口
      console.log('连线模式已启用，请从节点的右侧端口拖拽到另一个节点的左侧端口');
    }
  }
}

</script>

<template>
  <div class="workflow-view">
    <h1 class="mb-6 text-3xl font-medium">学习路径编排</h1>
    
    <div class="workflow-container">
      <!-- 左侧：工作流列表 -->
      <div class="workflow-sidebar">
        <WorkflowList
          :workflows="workflows"
          :current-workflow-id="currentWorkflow?.id"
          @select="handleSelectWorkflow"
          @delete="handleDeleteWorkflow"
          @create="handleCreateWorkflow"
        />
      </div>

      <!-- 右侧：画布区域 -->
      <div class="workflow-main">
        <WorkflowToolbar
          :loading="storageLoading"
          :workflow-name="workflowName"
          :connect-mode="isConnectingMode"
          @add-node="handleAddNode"
          @toggle-connect="toggleConnectMode"
          @clear="handleClear"
          @load-sample="handleLoadSample"
          @save="handleSave"
          @export="handleExport"
        />

        <!-- 画布容器 -->
        <div class="canvas-wrapper">
          <div ref="containerRef" class="canvas-container"></div>
        </div>

        <!-- 工作流信息编辑 -->
        <div v-if="isEditing" class="workflow-info">
          <div class="info-field">
            <label>工作流名称</label>
            <input
              v-model="workflowName"
              type="text"
              placeholder="输入工作流名称"
              class="info-input"
            />
          </div>
          <div class="info-field">
            <label>描述</label>
            <textarea
              v-model="workflowDescription"
              placeholder="输入工作流描述"
              rows="2"
              class="info-input"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加节点对话框 -->
    <div v-if="showNodeDialog" class="dialog-overlay" @click="cancelAddNode">
      <div class="dialog-content" @click.stop>
        <h3 class="dialog-title">
          {{ nodeTypeToAdd === 'task' ? '添加任务节点' : '添加条件节点' }}
        </h3>
        <div class="dialog-field">
          <label>节点名称</label>
          <input
            v-model="nodeNameInput"
            type="text"
            :placeholder="nodeTypeToAdd === 'task' ? '请输入任务名称' : '请输入条件名称'"
            class="dialog-input"
            @keyup.enter="confirmAddNode"
            ref="nodeNameInputRef"
          />
        </div>
        <div class="dialog-actions">
          <button @click="cancelAddNode" class="dialog-btn dialog-btn-cancel">
            取消
          </button>
          <button
            @click="confirmAddNode"
            :disabled="!nodeNameInput.trim()"
            class="dialog-btn dialog-btn-confirm"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workflow-view {
  @apply max-w-full mx-auto;
}

.workflow-container {
  @apply flex gap-4 h-[calc(100vh-200px)] min-h-[600px];
}

.workflow-sidebar {
  @apply w-80 flex-shrink-0;
}

.workflow-main {
  @apply flex-1 flex flex-col min-w-0;
}

.canvas-wrapper {
  @apply flex-1 bg-white/30 backdrop-blur-sm rounded-lg shadow-inner
         overflow-hidden border border-gray-200;
}

.canvas-container {
  @apply w-full h-full;
}

.workflow-info {
  @apply mt-4 p-4 bg-white/50 backdrop-blur-md rounded-lg shadow-md
         grid grid-cols-2 gap-4;
}

.info-field {
  @apply flex flex-col gap-1;
}

.info-field label {
  @apply text-sm font-medium text-gray-700;
}

.info-input {
  @apply px-3 py-2 bg-white/60 border border-gray-300 rounded-md
         focus:outline-none focus:ring-2 focus:ring-teal-500
         focus:border-transparent text-sm;
}

textarea.info-input {
  @apply resize-none;
}

/* 对话框样式 */
.dialog-overlay {
  @apply fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50;
}

.dialog-content {
  @apply bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-6 w-96
         border border-gray-200;
}

.dialog-title {
  @apply text-xl font-semibold text-gray-800 mb-4;
}

.dialog-field {
  @apply mb-4;
}

.dialog-field label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.dialog-input {
  @apply w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-md
         focus:outline-none focus:ring-2 focus:ring-teal-500
         focus:border-transparent text-sm;
}

.dialog-actions {
  @apply flex gap-3 justify-end;
}

.dialog-btn {
  @apply px-4 py-2 rounded-md text-sm font-medium transition-colors;
}

.dialog-btn-cancel {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}

.dialog-btn-confirm {
  @apply bg-teal-600 text-white hover:bg-teal-700
         disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>