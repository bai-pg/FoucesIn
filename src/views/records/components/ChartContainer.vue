<script setup lang="ts">
import type { ChartType } from '../types';

interface Props {
  chartType: ChartType;
  hasRecords: boolean;
}

interface Emits {
  (e: 'toggle-type'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function handleToggleType() {
  emit('toggle-type');
}
</script>

<template>
  <div class="mt-8">
    <!-- 切换按钮 -->
    <div class="mb-4 flex justify-center gap-4">
      <button
        @click="handleToggleType"
        class="bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-none border-4 border-black hover:bg-yellow-400 active:translate-x-1 active:translate-y-1 transition-all duration-100 shadow-none"
        style="box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3); font-family: 'Press Start 2P', 'Courier New', monospace; image-rendering: pixelated;"
      >
        <span v-if="chartType === 'bar'">🥧 SHOW PIE CHART</span>
        <span v-else> SHOW BAR CHART</span>
      </button>
    </div>
    
    <!-- 柱状图 -->
    <div v-if="chartType === 'bar'" class="bg-white rounded-none shadow-none overflow-hidden border-4 border-black" style="box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.3); image-rendering: pixelated;">
      <div id="study-chart" style="width: 100%; height: 400px;"></div>
    </div>
    
    <!-- 饼图 -->
    <div v-if="chartType === 'pie'" class="bg-white rounded-none shadow-none overflow-hidden border-4 border-black" style="box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.3); image-rendering: pixelated;">
      <div id="study-pie-chart" style="width: 100%; height: 400px;"></div>
    </div>
    
    <!-- 无数据提示 -->
    <div v-if="!hasRecords" class="mt-4 text-center">
      <p class="text-gray-600 text-sm" style="font-family: 'Press Start 2P', 'Courier New', monospace;">
        暂无学习记录，添加记录后将显示图表 📊
      </p>
    </div>
  </div>
</template>
