<script setup lang="ts">
import { computed } from 'vue';
import type { StudyRecord } from '../types';

interface Props {
  records: StudyRecord[];
  report: string;
  isGenerating: boolean;
  loadingProgress: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  generate: [];
  clear: [];
}>();

// 是否有本周记录
const hasWeekRecords = computed(() => {
  if (props.records.length === 0) return false;
  
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  return props.records.some(record => {
    const recordDate = new Date(record.date);
    return recordDate >= monday;
  });
});
</script>

<template>
  <div class="bg-white rounded-none border-4 border-black p-6" style="box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.3); image-rendering: pixelated;">
    <!-- 标题 -->
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2" style="font-family: 'Press Start 2P', 'Courier New', monospace; letter-spacing: 1px;">
        <span class="text-2xl">🤖</span>
        <span>AI WEEKLY REPORT</span>
      </h2>
      <div class="flex gap-2">
        <button
          v-if="report"
          @click="$emit('clear')"
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-none border-4 border-black transition-all active:translate-x-[2px] active:translate-y-[2px]"
          style="box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3); font-family: 'Press Start 2P', 'Courier New', monospace; font-size: 0.7rem;"
        >
          CLEAR
        </button>
        <button
          @click="$emit('generate')"
          :disabled="!hasWeekRecords || isGenerating"
          class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-none border-4 border-black transition-all active:translate-x-[2px] active:translate-y-[2px]"
          style="box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3); font-family: 'Press Start 2P', 'Courier New', monospace; font-size: 0.7rem;"
        >
          {{ isGenerating ? 'GENERATING...' : 'GENERATE' }}
        </button>
      </div>
    </div>

    <!-- 加载进度条 -->
    <div v-if="isGenerating" class="mb-4">
      <div class="w-full bg-gray-200 rounded-none border-2 border-black h-6 relative overflow-hidden">
        <div
          class="bg-gradient-to-r from-blue-400 to-purple-500 h-full transition-all duration-300"
          :style="{ width: loadingProgress + '%' }"
        ></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-xs font-bold text-gray-800" style="font-family: 'Press Start 2P', 'Courier New', monospace;">
            {{ loadingProgress }}%
          </span>
        </div>
      </div>
      <p class="text-center mt-2 text-sm text-gray-700" style="font-family: 'Press Start 2P', 'Courier New', monospace;">
        AI IS ANALYZING...
      </p>
    </div>

    <!-- 无数据提示 -->
    <div v-else-if="!hasWeekRecords && !report" class="text-center py-8">
      <div class="text-6xl mb-4">📭</div>
      <p class="text-gray-700" style="font-family: 'Press Start 2P', 'Courier New', monospace; font-size: 0.8rem;">
        NO RECORDS THIS WEEK
      </p>
      <p class="text-gray-600 text-sm mt-2" style="font-family: 'Press Start 2P', 'Courier New', monospace; font-size: 0.6rem;">
        ADD SOME STUDY RECORDS FIRST!
      </p>
    </div>

    <!-- 报告内容 -->
    <div v-else-if="report" class="bg-yellow-50 rounded-none border-4 border-black p-4" style="image-rendering: pixelated;">
      <div class="whitespace-pre-wrap text-gray-900 leading-relaxed" style="font-family: 'Courier New', monospace; font-size: 0.9rem;">
        {{ report }}
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-8">
      <div class="text-6xl mb-4">🎯</div>
      <p class="text-gray-700" style="font-family: 'Press Start 2P', 'Courier New', monospace; font-size: 0.8rem;">
        CLICK GENERATE TO START
      </p>
      <p class="text-gray-600 text-sm mt-2" style="font-family: 'Press Start 2P', 'Courier New', monospace; font-size: 0.6rem;">
        AI WILL ANALYZE YOUR WEEKLY DATA
      </p>
    </div>

    <!-- 技术说明 -->
    <div class="mt-4 pt-4 border-t-2 border-gray-300">
      <p class="text-xs text-gray-600 text-center" style="font-family: 'Press Start 2P', 'Courier New', monospace; font-size: 0.5rem;">
        POWERED BY LOCAL AI ENGINE • RULE-BASED NLG
      </p>
    </div>
  </div>
</template>
