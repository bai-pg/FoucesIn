<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useGoalsStore } from '@/stores/goals';
import { Plus, Edit } from '@element-plus/icons-vue';

interface Props {
  userId: string;
}

const props = defineProps<Props>();

const goalsStore = useGoalsStore();

const goalType = ref<'daily' | 'weekly' | 'monthly'>('weekly');
const showEditDialog = ref(false);
const editingTarget = ref(60);

// 从 Store 获取状态
const currentGoal = computed(() => goalsStore.currentGoal);
const totalAchieved = computed(() => goalsStore.totalAchieved);
const progressPercent = computed(() => goalsStore.progressPercent);
const isGoalCompleted = computed(() => goalsStore.isGoalCompleted);
const remainingMinutes = computed(() => goalsStore.remainingMinutes);
const hasGoal = computed(() => goalsStore.hasGoal);
const loading = computed(() => goalsStore.loading);
const studyRecordsMinutes = computed(() => goalsStore.studyRecordsMinutes);
const pomodoroMinutes = computed(() => goalsStore.pomodoroMinutes);

onMounted(async () => {
  await loadGoal();
});

// 监听目标类型变化
watch(goalType, async () => {
  await loadGoal();
});

// 监听 userId 变化
watch(() => props.userId, async (newUserId) => {
  if (newUserId) {
    await loadGoal();
  }
});

async function loadGoal() {
  await goalsStore.fetchGoalWithProgress(props.userId, goalType.value);
}

async function handleSaveGoal() {
  if (!editingTarget.value || editingTarget.value <= 0) {
    ElMessage.warning('请输入有效的目标时长');
    return;
  }

  try {
    await goalsStore.saveGoal(props.userId, goalType.value, editingTarget.value);

    ElMessage.success('目标已设定');
    showEditDialog.value = false;
  } catch (error) {
    console.error('保存目标失败:', error);
    ElMessage.error('保存失败，请重试');
  }
}

async function handleDeleteGoal() {
  if (!currentGoal.value) return;

  try {
    await ElMessageBox.confirm(
      '确定要删除这个目标吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await goalsStore.deleteGoal(props.userId);
    ElMessage.success('目标已删除');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除目标失败:', error);
      ElMessage.error('删除失败，请重试');
    }
  }
}

function openEditDialog() {
  editingTarget.value = currentGoal.value?.target_minutes || 60;
  showEditDialog.value = true;
}

function getProgressColor(percent: number) {
  if (percent >= 100) return '#67C23A';
  if (percent >= 50) return '#E6A23C';
  return '#409EFF';
}

function getGoalTypeLabel(type: string) {
  const labels: Record<string, string> = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
  };
  return labels[type] || type;
}

function formatDateRange() {
  if (!currentGoal.value) return '';
  const start = new Date(currentGoal.value.start_date).toLocaleDateString('zh-CN');
  const end = new Date(currentGoal.value.end_date).toLocaleDateString('zh-CN');
  return `${start} ~ ${end}`;
}

// 暴露刷新方法供其他组件调用
defineExpose({
  refreshProgress: () => goalsStore.refreshProgress(props.userId),
});
</script>

<template>
  <el-card class="goal-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <span class="header-icon">🎯</span>
          <span class="header-title">学习目标</span>
          <el-tag v-if="currentGoal" size="small" type="success" effect="dark">
            {{ getGoalTypeLabel(goalType) }}目标
          </el-tag>
        </div>
        <div class="header-right">
          <el-button 
            v-if="hasGoal" 
            type="primary" 
            size="small" 
            :icon="Edit"
            @click="openEditDialog"
            :loading="loading"
          >
            编辑目标
          </el-button>
          <el-button 
            v-else 
            type="primary" 
            size="small" 
            :icon="Plus"
            @click="openEditDialog"
          >
            设定目标
          </el-button>
        </div>
      </div>
    </template>

    <!-- 无目标时的引导界面 -->
    <div v-if="!hasGoal" class="no-goal-container" v-loading="loading">
      <div class="empty-state">
        <el-icon :size="60" color="#409EFF">
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M480 480V128a32 32 0 0 1 64 0v352h352a32 32 0 1 1 0 64H544v352a32 32 0 1 1-64 0V544H128a32 32 0 0 1 0-64h352z"/>
          </svg>
        </el-icon>
        <h3 class="empty-title">尚未设定学习目标</h3>
        <p class="empty-description">设定一个学习目标，追踪你的学习进度，让学习更有方向感</p>
        <el-button type="primary" size="large" @click="openEditDialog">
          立即设定目标
        </el-button>
      </div>
    </div>

    <!-- 有目标时的显示界面 -->
    <div v-else class="goal-display" v-loading="loading">
      <!-- 目标进度条 -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">完成进度</span>
          <span class="progress-percent">{{ Math.round(progressPercent) }}%</span>
        </div>
        <el-progress
          :percentage="Math.round(progressPercent)"
          :color="getProgressColor(progressPercent)"
          :stroke-width="24"
          :striped="true"
          :striped-flow="!isGoalCompleted"
          class="main-progress"
        />
      </div>

      <!-- 详细数据统计 -->
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon"></div>
          <div class="stat-content">
            <div class="stat-label">目标时长</div>
            <div class="stat-value">{{ currentGoal?.target_minutes }} 分钟</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-label">已完成</div>
            <div class="stat-value">{{ totalAchieved }} 分钟</div>
            <div class="stat-detail">
              <span>学习记录: {{ studyRecordsMinutes }} 分钟</span>
              <span>番茄钟: {{ pomodoroMinutes }} 分钟</span>
            </div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <div class="stat-label">剩余时长</div>
            <div class="stat-value" :class="{ 'completed': remainingMinutes === 0 }">
              {{ remainingMinutes }} 分钟
            </div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-label">周期范围</div>
            <div class="stat-value period">{{ formatDateRange() }}</div>
          </div>
        </div>
      </div>

      <!-- 完成提示 -->
      <el-alert
        v-if="isGoalCompleted"
        title="🎉 恭喜！目标已完成！"
        description="继续保持，你可以设定新的目标挑战自己！"
        type="success"
        :closable="false"
        show-icon
        class="success-alert"
      />

      <!-- 操作按钮 -->
      <div class="goal-actions">
        <el-button type="danger" @click="handleDeleteGoal" :loading="loading">
          删除目标
        </el-button>
        <el-button type="primary" @click="openEditDialog" :loading="loading">
          修改目标
        </el-button>
      </div>
    </div>

    <!-- 编辑/创建目标对话框 -->
    <el-dialog
      v-model="showEditDialog"
      :title="hasGoal ? '编辑目标' : '设定学习目标'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px">
        <!-- 目标类型选择 -->
        <el-form-item label="目标类型">
          <el-radio-group v-model="goalType">
            <el-radio-button value="daily">每日</el-radio-button>
            <el-radio-button value="weekly">每周</el-radio-button>
            <el-radio-button value="monthly">每月</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 目标时长 -->
        <el-form-item label="目标时长">
          <el-input-number
            v-model="editingTarget"
            :min="1"
            :max="14400"
            :step="10"
            placeholder="分钟"
            style="width: 100%"
          >
            <template #suffix>
              <span>分钟</span>
            </template>
          </el-input-number>
          <div class="form-tip">
            {{ getGoalTypeLabel(goalType) }}目标时长建议：
            <span v-if="goalType === 'daily'">30-120 分钟</span>
            <span v-else-if="goalType === 'weekly'">180-840 分钟</span>
            <span v-else>720-3600 分钟</span>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveGoal" :loading="loading">
          {{ hasGoal ? '保存修改' : '创建目标' }}
        </el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.goal-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 20px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 8px;
}

/* 无目标状态 */
.no-goal-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 20px 0 10px;
}

.empty-description {
  font-size: 14px;
  color: #909399;
  margin-bottom: 24px;
  line-height: 1.6;
}

/* 目标显示 */
.goal-display {
  padding: 10px 0;
}

.progress-section {
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.progress-percent {
  font-size: 20px;
  font-weight: 700;
  color: #409EFF;
}

.main-progress {
  margin-bottom: 8px;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.stat-item:hover {
  background: #e8edf3;
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-value.completed {
  color: #67C23A;
}

.stat-value.period {
  font-size: 14px;
  font-weight: 500;
}

.stat-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
  font-size: 12px;
  color: #606266;
}

/* 成功提示 */
.success-alert {
  margin-bottom: 16px;
}

/* 操作按钮 */
.goal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

/* 表单提示 */
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.5;
}

/* 响应式 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .header-right {
    width: 100%;
  }
  
  .header-right .el-button {
    flex: 1;
  }
}
</style>
