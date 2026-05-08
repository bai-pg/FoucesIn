<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { supabase } from '@/services/supabase';

// 使用异步组件实现懒加载
const GoalManager = defineAsyncComponent({
  loader: () => import('./records/components/GoalManager.vue'),
  loadingComponent: () => h('div', { class: 'skeleton-card' }, [
    h('div', { class: 'skeleton-header' }),
    h('div', { class: 'skeleton-content' }),
  ]),
  delay: 200,
  timeout: 10000,
});

const PomodoroTimer = defineAsyncComponent({
  loader: () => import('./records/components/PomodoroTimer.vue'),
  loadingComponent: () => h('div', { class: 'skeleton-card' }, [
    h('div', { class: 'skeleton-header' }),
    h('div', { class: 'skeleton-content' }),
  ]),
  delay: 200,
  timeout: 10000,
});

const StatsDashboard = defineAsyncComponent({
  loader: () => import('./records/components/StatsDashboard.vue'),
  loadingComponent: () => h('div', { class: 'skeleton-card' }, [
    h('div', { class: 'skeleton-header' }),
    h('div', { class: 'skeleton-charts' }),
  ]),
  delay: 300,
  timeout: 10000,
});

const userId = ref<string>('');
const loading = ref(true);

onMounted(async () => {
  // Supabase v2: 使用 getUser() 获取用户信息
  const { data, error } = await supabase.auth.getUser();
  
  if (data?.user) {
    userId.value = data.user.id;
  } else {
    console.error('用户未登录:', error);
  }
  
  loading.value = false;
});
</script>

<template>
  <div class="dashboard-container" v-loading="loading">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">📚 学习工作台</h1>
      <p class="page-subtitle">追踪你的学习进度，达成学习目标</p>
    </div>

    <!-- 第一行：目标管理（全宽） -->
    <el-row :gutter="16" class="dashboard-row">
      <el-col :span="24">
        <Suspense>
          <template #default>
            <GoalManager v-if="userId" :userId="userId" />
          </template>
          <template #fallback>
            <el-skeleton :rows="5" animated />
          </template>
        </Suspense>
      </el-col>
    </el-row>

    <!-- 第二行：番茄钟 + 统计图表 -->
    <el-row :gutter="16" class="dashboard-row">
      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <Suspense>
          <template #default>
            <PomodoroTimer v-if="userId" :userId="userId" />
          </template>
          <template #fallback>
            <el-skeleton :rows="8" animated />
          </template>
        </Suspense>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="16" :lg="16">
        <Suspense>
          <template #default>
            <StatsDashboard v-if="userId" :userId="userId" />
          </template>
          <template #fallback>
            <el-skeleton :rows="10" animated />
          </template>
        </Suspense>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 16px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
  text-align: center;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.dashboard-row {
  margin-bottom: 16px;
}

.skeleton-card {
  padding: 16px;
  background: #fff;
  border-radius: 4px;
}

.skeleton-header {
  height: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeleton-content {
  height: 80px;
  background: #f0f0f0;
  border-radius: 4px;
}

.skeleton-charts {
  height: 250px;
  background: #f0f0f0;
  border-radius: 4px;
}

/* 移动端优化（iPhone X 等小屏幕） */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 12px;
  }
  
  .page-header {
    margin-bottom: 16px;
  }
  
  .page-title {
    font-size: 22px;
  }
  
  .page-subtitle {
    font-size: 13px;
  }
  
  .dashboard-row {
    margin-bottom: 12px;
  }
  
  .skeleton-card {
    padding: 12px;
  }
}

/* iPhone X 及更小屏幕的特殊优化 */
@media (max-width: 414px) {
  .dashboard-container {
    padding: 10px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .page-subtitle {
    font-size: 12px;
  }
  
  .dashboard-row {
    margin-bottom: 10px;
  }
}
</style>
