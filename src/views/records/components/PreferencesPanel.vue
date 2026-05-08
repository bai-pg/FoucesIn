<script setup lang="ts">
import { onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { usePreferencesStore } from '@/stores/auth';

interface Props {
  userId: string;
}

const props = defineProps<Props>();

// 使用全局偏好设置 store
const preferencesStore = usePreferencesStore();

onMounted(async () => {
  await preferencesStore.loadPreferences(props.userId);
});

async function handleThemeChange(value: 'light' | 'dark') {
  try {
    await preferencesStore.updatePreference('theme', value);
    ElMessage.success('主题已切换');
  } catch (error) {
    console.error('切换主题失败:', error);
    ElMessage.error('切换失败，请重试');
  }
}

async function handleNotificationChange(value: boolean) {
  try {
    await preferencesStore.updatePreference('email_notifications', value);
    ElMessage.success('通知设置已更新');
  } catch (error) {
    console.error('更新通知设置失败:', error);
    ElMessage.error('更新失败，请重试');
  }
}

async function handleViewChange(value: string) {
  try {
    await preferencesStore.updatePreference('default_view', value);
    ElMessage.success('默认视图已更新');
  } catch (error) {
    console.error('更新默认视图失败:', error);
    ElMessage.error('更新失败，请重试');
  }
}

async function handlePomodoroWorkDurationChange(value: number) {
  try {
    await preferencesStore.updatePreference('pomodoro_work_duration', value);
    ElMessage.success('专注时长已更新');
  } catch (error) {
    console.error('更新专注时长失败:', error);
    ElMessage.error('更新失败，请重试');
  }
}

async function handlePomodoroRestDurationChange(value: number) {
  try {
    await preferencesStore.updatePreference('pomodoro_rest_duration', value);
    ElMessage.success('休息时长已更新');
  } catch (error) {
    console.error('更新休息时长失败:', error);
    ElMessage.error('更新失败，请重试');
  }
}
</script>

<template>
  <el-card class="preferences-card">
    <template #header>
      <div class="card-header">
        <span class="header-title">⚙️ 偏好设置</span>
      </div>
    </template>

    <el-form 
      label-width="140px" 
      :disabled="preferencesStore.loading"
      class="preferences-form"
    >
      <!-- 主题设置 -->
      <el-form-item label="主题">
        <el-switch
          v-model="preferencesStore.preferences.theme"
          active-value="dark"
          inactive-value="light"
          active-text="暗色"
          inactive-text="亮色"
          @change="handleThemeChange"
        />
      </el-form-item>

      <!-- 邮件通知 -->
      <el-form-item label="邮件通知">
        <el-switch
          v-model="preferencesStore.preferences.email_notifications"
          active-text="开启"
          inactive-text="关闭"
          @change="handleNotificationChange"
        />
      </el-form-item>

      <!-- 默认视图 -->
      <el-form-item label="默认视图">
        <el-select
          v-model="preferencesStore.preferences.default_view"
          placeholder="选择默认视图"
          @change="handleViewChange"
        >
          <el-option label="仪表盘" value="dashboard" />
          <el-option label="学习记录" value="records" />
          <el-option label="工作流" value="workflow" />
        </el-select>
      </el-form-item>

      <el-divider />

      <!-- 番茄钟设置 -->
      <el-form-item label="专注时长">
        <el-input-number
          v-model="preferencesStore.preferences.pomodoro_work_duration"
          :min="5"
          :max="60"
          :step="5"
          @change="handlePomodoroWorkDurationChange"
        >
          <template #suffix>
            <span>分钟</span>
          </template>
        </el-input-number>
      </el-form-item>

      <el-form-item label="休息时长">
        <el-input-number
          v-model="preferencesStore.preferences.pomodoro_rest_duration"
          :min="1"
          :max="30"
          :step="1"
          @change="handlePomodoroRestDurationChange"
        >
          <template #suffix>
            <span>分钟</span>
          </template>
        </el-input-number>
      </el-form-item>
    </el-form>
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

.preferences-form {
  padding: 10px 0;
}
</style>
