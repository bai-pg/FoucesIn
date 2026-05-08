<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { usePomodoroStore } from '@/stores/pomodoro';
import { usePreferencesStore } from '@/stores/auth';
import { useGoalsStore } from '@/stores/goals';

interface Props {
  userId: string;
}

const props = defineProps<Props>();

// 使用全局偏好设置 store
const preferencesStore = usePreferencesStore();
// 使用目标 Store 实现自动刷新
const goalsStore = useGoalsStore();
// 使用番茄钟 Store
const pomodoroStore = usePomodoroStore();

const subjectInput = ref('');

onMounted(async () => {
  // 初始化番茄钟 Store(恢复状态)
  pomodoroStore.init();
  
  // 同步科目输入
  subjectInput.value = pomodoroStore.currentSubject;
  
  // 加载偏好设置
  await preferencesStore.loadPreferences(props.userId);
  
  // 只在 idle 状态下应用偏好设置(避免重置暂停/运行中的计时器)
  if (pomodoroStore.status === 'idle') {
    pomodoroStore.updateConfig({
      workDuration: preferencesStore.pomodoroWorkDuration,
      restDuration: preferencesStore.pomodoroRestDuration,
    });
  } else {
    console.log('番茄钟处于', pomodoroStore.status, '状态,跳过配置更新');
  }
});

onUnmounted(() => {
  // 组件卸载时清理监听器,但不清空状态(保持持久化)
  pomodoroStore.cleanup();
});

// 同步科目输入
watch(subjectInput, (newValue) => {
  pomodoroStore.setSubject(newValue);
});

// 实时监听偏好设置变化，自动更新番茄钟配置
watch(
  () => [preferencesStore.pomodoroWorkDuration, preferencesStore.pomodoroRestDuration],
  ([workDuration, restDuration]) => {
    if (workDuration && restDuration) {
      // 只在 idle 状态下更新配置,避免影响暂停/运行中的计时器
      if (pomodoroStore.status === 'idle') {
        pomodoroStore.updateConfig({
          workDuration: workDuration,
          restDuration: restDuration,
        });
      } else {
        console.log('番茄钟处于', pomodoroStore.status, '状态,跳过配置更新');
      }
    }
  },
  { immediate: false }
);

function handleStartFocus() {
  if (pomodoroStore.currentSubject) {
    pomodoroStore.startTimer();
  } else {
    ElMessage.warning('请输入专注科目');
  }
}

/**
 * 手动结束学习并创建记录
 */
async function handleEndStudy() {
  if (pomodoroStore.status !== 'running' && pomodoroStore.status !== 'paused') {
    ElMessage.warning('当前没有进行中的专注');
    return;
  }

  const result = pomodoroStore.completeFocus();
  
  if (result) {
    // 组件层处理记录保存到 Supabase
    try {
      const { supabase } = await import('@/services/supabase');
      
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);

      // 1. 创建学习记录
      const { data: record, error: recordError } = await supabase
        .from('study_records')
        .insert({
          user_id: props.userId,
          date: dateStr,
          subject: result.subject,
          duration_minutes: result.durationMinutes,
          notes: `番茄钟专注 ${result.durationMinutes} 分钟`,
          source: 'pomodoro',
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // 2. 创建番茄钟会话记录
      const startTime = new Date(result.timestamp);
      const endTime = now;
      
      const { error: sessionError } = await supabase
        .from('pomodoro_sessions')
        .insert({
          user_id: props.userId,
          study_record_id: record.id,
          duration_minutes: result.durationMinutes,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'completed',
          subject: result.subject,
        });

      if (sessionError) throw sessionError;

      ElMessage.success(`已添加学习记录：${result.subject} ${result.durationMinutes} 分钟`);
      
      // 自动刷新目标进度
      await goalsStore.refreshProgress(props.userId);
    } catch (error) {
      console.error('保存学习记录失败:', error);
      ElMessage.error('保存失败，请重试');
    }
  }
}

function getStatusText() {
  const texts = {
    idle: '准备开始',
    running: '专注中...',
    paused: '已暂停',
    rest: '休息中...',
  };
  return texts[pomodoroStore.status];
}

function getStatusColor() {
  const colors = {
    idle: '#909399',
    running: '#F56C6C',
    paused: '#E6A23C',
    rest: '#67C23A',
  };
  return colors[pomodoroStore.status];
}
</script>

<template>
  <el-card class="pomodoro-card">
    <template #header>
      <div class="card-header">
        <span class="header-title"> 番茄钟</span>
        <el-tag :type="pomodoroStore.status === 'running' ? 'danger' : 'info'">
          {{ getStatusText() }}
        </el-tag>
      </div>
    </template>

    <!-- 计时器显示 -->
    <div class="timer-display">
      <!-- 结束学习按钮 -->
      <div v-if="pomodoroStore.status === 'running' || pomodoroStore.status === 'paused'" class="end-study-btn">
        <el-button 
          type="danger" 
          size="small" 
          @click="handleEndStudy"
          plain
        >
          结束学习
        </el-button>
      </div>

      <div 
        class="time-text" 
        :style="{ color: getStatusColor() }"
      >
        {{ pomodoroStore.formattedTime }}
      </div>

      <el-progress
        :percentage="Math.round(pomodoroStore.progress)"
        :stroke-width="10"
        :show-text="false"
        :color="getStatusColor()"
      />
    </div>

    <!-- 控制按钮 -->
    <div class="controls">
      <el-button
        v-if="pomodoroStore.status === 'idle'"
        type="primary"
        size="large"
        @click="handleStartFocus"
        :disabled="!pomodoroStore.currentSubject"
      >
        开始专注
      </el-button>

      <el-button
        v-if="pomodoroStore.status === 'running'"
        type="warning"
        size="large"
        @click="pomodoroStore.pauseTimer"
      >
        暂停
      </el-button>

      <el-button
        v-if="pomodoroStore.status === 'paused'"
        type="success"
        size="large"
        @click="pomodoroStore.resumeTimer"
      >
        继续
      </el-button>

      <el-button
        v-if="pomodoroStore.status !== 'idle'"
        size="large"
        @click="pomodoroStore.resetTimer"
      >
        重置
      </el-button>

      <el-button
        v-if="pomodoroStore.status === 'idle'"
        size="large"
        @click="pomodoroStore.startRest"
      >
        休息{{ preferencesStore.pomodoroRestDuration }}分钟
      </el-button>
    </div>

    <!-- 科目输入 -->
    <div class="subject-input">
      <el-input
        v-model="subjectInput"
        placeholder="输入专注科目（如：数学、英语）"
        :disabled="pomodoroStore.status === 'running' || pomodoroStore.status === 'paused'"
      >
        <template #prefix>
          <el-icon><document /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 配置提示 - 实时显示偏好设置 -->
    <div class="config-hint">
      <el-text size="small" type="info">
        专注时长：{{ preferencesStore.pomodoroWorkDuration }} 分钟 | 
        休息时长：{{ preferencesStore.pomodoroRestDuration }} 分钟
      </el-text>
    </div>
  </el-card>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
}

.timer-display {
  text-align: center;
  padding: 20px 0;
  position: relative;
}

.end-study-btn {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
}

.time-text {
  font-size: 56px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  margin-bottom: 20px;
  transition: color 0.3s;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.subject-input {
  margin-top: 15px;
}

.config-hint {
  margin-top: 15px;
  text-align: center;
  padding-top: 10px;
  border-top: 1px solid #EBEEF5;
}
</style>