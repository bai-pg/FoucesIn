<script setup lang="ts">
import type { StudyRecord } from '../types';

interface Props {
  records: StudyRecord[];
  paginatedRecords: StudyRecord[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  isCollapsed: boolean;
}

interface Emits {
  (e: 'toggle-collapse'): void;
  (e: 'edit', record: StudyRecord): void;
  (e: 'delete', id: number): void;
  (e: 'update:pageSize', size: number): void;
  (e: 'go-to-page', page: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function handleToggleCollapse() {
  emit('toggle-collapse');
}

function handleEdit(record: StudyRecord) {
  emit('edit', record);
}

function handleDelete(id: number) {
  emit('delete', id);
}

function handlePageSizeChange(size: number) {
  emit('update:pageSize', size);
}

function handleGoToPage(page: number) {
  emit('go-to-page', page);
}
</script>

<template>
  <div class="bg-white rounded-none shadow-none overflow-hidden border-4 border-black" style="box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.3); image-rendering: pixelated;">
    <!-- 标题栏 - 可点击折叠 -->
    <div 
      @click="handleToggleCollapse"
      class="px-6 py-4 bg-yellow-400 border-b-4 border-black cursor-pointer hover:bg-yellow-300 transition-colors"
    >
      <h2 class="text-xl font-bold text-gray-900 flex items-center justify-between" style="font-family: 'Press Start 2P', 'Courier New', monospace; letter-spacing: 1px;">
        <span>📊 RECORDS</span>
        <span class="text-sm">{{ isCollapsed ? '▶' : '▼' }}</span>
      </h2>
    </div>
    
    <!-- 折叠内容 -->
    <div v-show="!isCollapsed">
      <div v-if="records.length === 0" class="p-12 text-center">
        <div class="text-6xl mb-4">📭</div>
        <p class="text-gray-700 text-lg mb-2" style="font-family: 'Press Start 2P', 'Courier New', monospace;">NO RECORDS YET</p>
        <p class="text-gray-600 text-sm" style="font-family: 'Press Start 2P', 'Courier New', monospace;">ADD YOUR FIRST ONE!</p>
      </div>

      <div v-else>
        <!-- 记录列表 -->
        <div class="divide-y divide-black">
          <div
            v-for="(record, index) in paginatedRecords"
            :key="record.id"
            class="p-5 hover:bg-yellow-100 transition-all duration-100 group"
            :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3 flex-wrap">
                  <span class="bg-green-500 text-white px-4 py-1.5 rounded-none border-2 border-black text-sm font-bold shadow-none" style="box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3); font-family: 'Press Start 2P', 'Courier New', monospace;">
                    {{ record.subject }}
                  </span>
                  <span class="text-gray-900 font-bold text-sm" style="font-family: 'Press Start 2P', 'Courier New', monospace;">
                    📅 {{ record.date }}
                  </span>
                  <span class="text-gray-900 font-bold text-sm" style="font-family: 'Press Start 2P', 'Courier New', monospace;">
                    ⏰ {{ record.duration_minutes }} MIN
                  </span>
                </div>
                
                <div v-if="record.notes" class="text-gray-700 text-sm bg-gray-100 rounded-none px-4 py-2 border-2 border-black shadow-none" style="font-family: 'Press Start 2P', 'Courier New', monospace; box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);">
                  💬 {{ record.notes }}
                </div>
              </div>
              
              <div class="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="handleEdit(record)"
                  class="bg-blue-500 text-white px-3 py-2 rounded-none border-2 border-black hover:bg-blue-600 active:translate-x-0.5 active:translate-y-0.5 transition-all shadow-none"
                  style="box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3); font-family: 'Press Start 2P', 'Courier New', monospace;"
                >
                  ✏️
                </button>
                <button
                  @click="handleDelete(record.id)"
                  class="bg-red-500 text-white px-3 py-2 rounded-none border-2 border-black hover:bg-red-600 active:translate-x-0.5 active:translate-y-0.5 transition-all shadow-none"
                  style="box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3); font-family: 'Press Start 2P', 'Courier New', monospace;"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页控制 -->
        <div class="px-6 py-4 bg-gray-100 border-t-4 border-black">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <!-- 每页条数选择 -->
            <div class="flex items-center gap-2">
              <label class="text-gray-900 font-bold text-xs" style="font-family: 'Press Start 2P', 'Courier New', monospace;">PER PAGE:</label>
              <select
                :value="pageSize"
                @change="handlePageSizeChange(Number(($event.target as HTMLSelectElement).value))"
                class="bg-white px-3 py-2 rounded-none border-4 border-black focus:border-blue-500 focus:outline-none shadow-none"
                style="font-family: 'Press Start 2P', 'Courier New', monospace; image-rendering: pixelated;"
              >
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
            </div>

            <!-- 页码信息 -->
            <div class="text-gray-900 font-bold text-xs" style="font-family: 'Press Start 2P', 'Courier New', monospace;">
              PAGE {{ currentPage }} / {{ totalPages }} (TOTAL: {{ records.length }})
            </div>

            <!-- 页码导航 -->
            <div class="flex items-center gap-2">
              <button
                @click="handleGoToPage(1)"
                :disabled="currentPage === 1"
                class="bg-gray-300 text-gray-900 px-3 py-2 rounded-none border-4 border-black hover:bg-gray-200 active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 shadow-none"
                style="box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3); font-family: 'Press Start 2P', 'Courier New', monospace;"
              >
                ⏮
              </button>
              <button
                @click="handleGoToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="bg-gray-300 text-gray-900 px-3 py-2 rounded-none border-4 border-black hover:bg-gray-200 active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 shadow-none"
                style="box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3); font-family: 'Press Start 2P', 'Courier New', monospace;"
              >
                ◀
              </button>
              
              <!-- 页码输入 -->
              <div class="flex items-center gap-1">
                <input
                  type="number"
                  :value="currentPage"
                  @input="handleGoToPage(Number(($event.target as HTMLInputElement).value))"
                  min="1"
                  :max="totalPages"
                  class="w-16 bg-white px-2 py-2 rounded-none border-4 border-black text-center focus:border-blue-500 focus:outline-none shadow-none"
                  style="font-family: 'Press Start 2P', 'Courier New', monospace; image-rendering: pixelated;"
                />
                <span class="text-gray-900 font-bold text-xs" style="font-family: 'Press Start 2P', 'Courier New', monospace;">/ {{ totalPages }}</span>
              </div>

              <button
                @click="handleGoToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="bg-gray-300 text-gray-900 px-3 py-2 rounded-none border-4 border-black hover:bg-gray-200 active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 shadow-none"
                style="box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3); font-family: 'Press Start 2P', 'Courier New', monospace;"
              >
                ▶
              </button>
              <button
                @click="handleGoToPage(totalPages)"
                :disabled="currentPage === totalPages"
                class="bg-gray-300 text-gray-900 px-3 py-2 rounded-none border-4 border-black hover:bg-gray-200 active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 shadow-none"
                style="box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3); font-family: 'Press Start 2P', 'Courier New', monospace;"
              >
                ⏭
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
