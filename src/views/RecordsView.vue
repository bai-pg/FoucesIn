<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useStudyRecords } from './records/composables/useStudyRecords';
import { useChart } from './records/composables/useChart';
import { usePagination } from './records/composables/usePagination';
import { useDandelionParticles } from './records/composables/useDandelionParticles';
import { useWeeklyReport } from './records/composables/useWeeklyReport';
import RecordForm from './records/components/RecordForm.vue';
import EditRecordForm from './records/components/EditRecordForm.vue';
import RecordList from './records/components/RecordList.vue';
import ChartContainer from './records/components/ChartContainer.vue';
import WeeklyReport from './records/components/WeeklyReport.vue';

// 学习记录管理
const {
  records,
  loading,
  date,
  subject,
  duration,
  notes,
  editingRecord,
  editDate,
  editSubject,
  editDuration,
  editNotes,
  fetchRecords,
  addRecord,
  startEdit,
  cancelEdit,
  saveEdit,
  deleteRecord,
} = useStudyRecords();

// 图表管理
const { chartType, renderChart, toggleChartType } = useChart();

// 分页管理
const {
  currentPage,
  pageSize,
  totalPages,
  paginatedRecords,
  isRecordsCollapsed,
  toggleRecordsCollapse,
  goToPage,
} = usePagination(records);

// 蒲公英粒子特效
const { dandelionParticles, handleClick } = useDandelionParticles();

// AI 周报生成
const {
  report,
  isGenerating,
  loadingProgress,
  generateReport,
  clearReport,
} = useWeeklyReport();

// 组件挂载时获取记录
onMounted(() => {
  fetchRecords();
});

// 监听数据变化，自动更新图表
watch(records, () => {
  renderChart(records.value);
}, { deep: true });
</script>

<template>
  <div 
    class="min-h-screen relative overflow-hidden select-none" 
    style="background-color: #87CEEB; background-image: linear-gradient(180deg, #87CEEB 0%, #98D8E8 50%, #B0E57C 50%, #7EC850 100%); user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; image-rendering: pixelated;" 
    @click="handleClick"
  >
    <!-- 像素风格背景装饰 -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden" style="opacity: 0.3;">
      <div class="absolute top-10 left-20 text-6xl" style="filter: drop-shadow(4px 4px 0 rgba(0,0,0,0.2));">☁️</div>
      <div class="absolute top-20 right-32 text-5xl" style="filter: drop-shadow(4px 4px 0 rgba(0,0,0,0.2));">☁️</div>
      <div class="absolute top-5 left-1/2 text-4xl" style="filter: drop-shadow(4px 4px 0 rgba(0,0,0,0.2));">☁️</div>
      <div class="absolute top-8 right-20 text-7xl" style="filter: drop-shadow(4px 4px 0 rgba(0,0,0,0.2));">☀️</div>
      <div class="absolute bottom-20 left-10 text-6xl" style="filter: drop-shadow(4px 4px 0 rgba(0,0,0,0.2));">🌲</div>
      <div class="absolute bottom-24 left-24 text-5xl" style="filter: drop-shadow(4px 4px 0 rgba(0,0,0,0.2));">🌳</div>
      <div class="absolute bottom-18 right-16 text-6xl" style="filter: drop-shadow(4px 4px 0 rgba(0,0,0,0.2));">🌲</div>
    </div>

    <!-- 像素风格飘散粒子 -->
    <div
      v-for="particle in dandelionParticles"
      :key="particle.id"
      class="fixed pointer-events-none"
      :style="{
        left: particle.x + 'px',
        top: particle.y + 'px',
        fontSize: particle.size + 'px',
        opacity: particle.opacity,
        transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
        zIndex: 9999,
        color: 'rgba(255, 255, 255, 0.9)',
        textShadow: '4px 4px 0 rgba(0, 0, 0, 0.3), -2px -2px 0 rgba(0, 0, 0, 0.2)',
        willChange: 'transform, opacity',
        imageRendering: 'pixelated',
      }"
    >
      ✨
    </div>

    <div class="max-w-4xl mx-auto py-8 px-4 relative z-10">
      <!-- 标题区域 -->
      <div class="text-center mb-8">
        <div class="inline-block bg-white rounded-none px-8 py-4 shadow-none border-4 border-black" style="box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.3); image-rendering: pixelated;">
          <h1 class="text-4xl font-bold text-gray-900 mb-1" style="font-family: 'Press Start 2P', 'Courier New', monospace; letter-spacing: 2px;">
            📚 STUDY LOG
          </h1>
          <p class="text-gray-700 text-sm" style="font-family: 'Press Start 2P', 'Courier New', monospace;">RECORD YOUR GROWTH</p>
        </div>
      </div>

      <!-- 添加记录表单 -->
      <RecordForm
        v-model:date="date"
        v-model:subject="subject"
        v-model:duration="duration"
        v-model:notes="notes"
        :loading="loading"
        @submit="addRecord"
      />

      <!-- 编辑记录表单 -->
      <EditRecordForm
        v-if="editingRecord"
        v-model:date="editDate"
        v-model:subject="editSubject"
        v-model:duration="editDuration"
        v-model:notes="editNotes"
        :loading="loading"
        @save="saveEdit"
        @cancel="cancelEdit"
      />

      <!-- 记录列表 -->
      <RecordList
        :records="records"
        :paginated-records="paginatedRecords"
        :current-page="currentPage"
        :page-size="pageSize"
        :total-pages="totalPages"
        :is-collapsed="isRecordsCollapsed"
        @toggle-collapse="toggleRecordsCollapse"
        @edit="startEdit"
        @delete="deleteRecord"
        @update:page-size="(size) => pageSize = size"
        @go-to-page="goToPage"
      />

      <!-- 数据可视化图表 -->
      <ChartContainer
        :chart-type="chartType"
        :has-records="records.length > 0"
        @toggle-type="() => toggleChartType(records)"
      />

      <!-- AI 周报生成器 -->
      <WeeklyReport
        :records="records"
        :report="report"
        :is-generating="isGenerating"
        :loading-progress="loadingProgress"
        @generate="() => generateReport(records)"
        @clear="clearReport"
      />

      <!-- 底部装饰 -->
      <div class="text-center mt-8">
        <div class="inline-block bg-white rounded-none px-6 py-3 shadow-none border-4 border-black" style="box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3); image-rendering: pixelated;">
          <p class="text-gray-900 text-sm flex items-center justify-center gap-2" style="font-family: 'Press Start 2P', 'Courier New', monospace;">
            <span class="text-xl">🌱</span>
            <span>LEVEL UP EVERY DAY!</span>
            <span class="text-xl">⭐</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
