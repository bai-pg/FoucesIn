<script setup lang="ts">
import type { StudyRecord } from '../types';
import LearningNotesDialog from './LearningNotesDialog.vue';
import { ref } from 'vue';

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
  (e: 'save-notes', recordId: number, content: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 笔记对话框状态
const showNotesDialog = ref(false);
const currentRecord = ref<StudyRecord | null>(null);

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

// 打开笔记对话框
function handleOpenNotes(record: StudyRecord) {
  currentRecord.value = record;
  showNotesDialog.value = true;
}

// 保存笔记
function handleSaveNotes(recordId: number, content: string) {
  emit('save-notes', recordId, content);
}

// 检查是否有笔记
function hasNotes(record: StudyRecord): boolean {
  return !!(record.learning_notes && record.learning_notes.trim().length > 0);
}

// 去除 HTML 标签，获取纯文本
function stripHtml(html: string | undefined): string {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
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
                
                <div v-if="record.notes" class="text-gray-700 text-sm bg-gray-100 rounded-none px-4 py-2 border-2 border-black shadow-none mb-3" style="font-family: 'Press Start 2P', 'Courier New', monospace; box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);">
                  💬 {{ record.notes }}
                </div>
                
                <!-- 学习笔记预览 -->
                <div 
                  v-if="hasNotes(record)" 
                  class="relative group/notes"
                >
                  <div class="text-gray-700 text-xs bg-purple-50 rounded-none px-4 py-2 border-2 border-purple-300 shadow-none overflow-hidden max-h-16" style="font-family: 'Press Start 2P', 'Courier New', monospace; box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);">
                    📝 <span v-html="stripHtml(record.learning_notes!).substring(0, 100)"></span>
                    <span v-if="stripHtml(record.learning_notes!).length > 100" class="text-purple-600">...</span>
                  </div>
                  <div class="absolute inset-0 bg-purple-100 bg-opacity-90 flex items-center justify-center opacity-0 group-hover/notes:opacity-100 transition-opacity cursor-pointer" @click="handleOpenNotes(record)">
                    <span class="text-purple-700 font-bold text-xs" style="font-family: 'Press Start 2P', 'Courier New', monospace;">点击查看完整笔记 →</span>
                  </div>
                </div>
              </div>
              
              <div class="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <!-- 笔记按钮 -->
                <button
                  @click="handleOpenNotes(record)"
                  class="relative bg-purple-500 text-white px-3 py-2 rounded-none border-2 border-black hover:bg-purple-600 active:translate-x-0.5 active:translate-y-0.5 transition-all shadow-none"
                  style="box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3); font-family: 'Press Start 2P', 'Courier New', monospace;"
                  :title="hasNotes(record) ? '编辑学习笔记' : '添加学习笔记'"
                >
                  📝
                  <!-- 有笔记时显示高亮标记 -->
                  <span 
                    v-if="hasNotes(record)"
                    class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-black animate-pulse"
                    style="box-shadow: 0 0 4px rgba(250, 204, 21, 0.6);"
                  ></span>
                </button>
                
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
    
    <!-- 学习笔记对话框 -->
    <LearningNotesDialog
      v-if="currentRecord"
      v-model="showNotesDialog"
      :record-id="currentRecord.id"
      :subject="currentRecord.subject"
      :date="currentRecord.date"
      :content="currentRecord.learning_notes || ''"
      @save="handleSaveNotes"
    />
  </div>
</template>
