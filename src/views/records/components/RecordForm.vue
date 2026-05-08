<script setup lang="ts">
interface Props {
  date: string;
  subject: string;
  duration: string;
  notes: string;
  loading: boolean;
}

interface Emits {
  (e: 'update:date', value: string): void;
  (e: 'update:subject', value: string): void;
  (e: 'update:duration', value: string): void;
  (e: 'update:notes', value: string): void;
  (e: 'submit'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function handleSubmit() {
  emit('submit');
}
</script>

<template>
  <div class="mb-8 bg-white rounded-none shadow-none overflow-hidden border-4 border-black" style="box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.3); image-rendering: pixelated;">
    <div class="px-6 py-4 bg-green-400 border-b-4 border-black">
      <h2 class="text-xl font-bold text-gray-900 flex items-center" style="font-family: 'Press Start 2P', 'Courier New', monospace; letter-spacing: 1px;">
        ➕ 添加记录
      </h2>
    </div>
    
    <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label class="block text-gray-900 font-bold mb-2 text-sm" style="font-family: 'Press Start 2P', 'Courier New', monospace;">
            📅 日 期
          </label>
          <input
            type="date"
            :value="date"
            @input="emit('update:date', ($event.target as HTMLInputElement).value)"
            required
            class="w-full px-4 py-3 bg-white rounded-none border-4 border-black focus:border-blue-500 focus:outline-none transition-all select-text shadow-none"
            style="font-family: 'Press Start 2P', 'Courier New', monospace; image-rendering: pixelated;"
          />
        </div>

        <div>
          <label class="block text-gray-900 font-bold mb-2 text-sm" style="font-family: 'Press Start 2P', 'Courier New', monospace;">
            📖 科 目
          </label>
          <input
            :value="subject"
            @input="emit('update:subject', ($event.target as HTMLInputElement).value)"
            placeholder="数 学, 英 语..."
            required
            class="w-full px-4 py-3 bg-white rounded-none border-4 border-black focus:border-blue-500 focus:outline-none transition-all select-text shadow-none"
            style="font-family: 'Press Start 2P', 'Courier New', monospace; image-rendering: pixelated;"
          />
        </div>
      </div>

      <div>
        <label class="block text-gray-900 font-bold mb-2 text-sm" style="font-family: 'Press Start 2P', 'Courier New', monospace;">
          ⏰ 时 长
        </label>
        <div class="flex items-center gap-3">
          <input
            type="number"
            :value="duration"
            @input="emit('update:duration', ($event.target as HTMLInputElement).value)"
            placeholder="60"
            min="0"
            required
            class="flex-1 px-4 py-3 bg-white rounded-none border-4 border-black focus:border-blue-500 focus:outline-none transition-all select-text shadow-none"
            style="font-family: 'Press Start 2P', 'Courier New', monospace; image-rendering: pixelated;"
          />
          <span class="text-gray-900 font-bold" style="font-family: 'Press Start 2P', 'Courier New', monospace;">分 钟</span>
        </div>
      </div>

      <div>
        <label class="block text-gray-900 font-bold mb-2 text-sm" style="font-family: 'Press Start 2P', 'Courier New', monospace;">
          💭 备 注
        </label>
        <textarea
          :value="notes"
          @input="emit('update:notes', ($event.target as HTMLTextAreaElement).value)"
          placeholder="今天学了什么..."
          rows="3"
          class="w-full px-4 py-3 bg-white rounded-none border-4 border-black focus:border-blue-500 focus:outline-none transition-all resize-none select-text shadow-none"
          style="font-family: 'Press Start 2P', 'Courier New', monospace; image-rendering: pixelated;"
        ></textarea>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-none border-4 border-black hover:bg-green-600 active:translate-x-1 active:translate-y-1 transition-all duration-100 disabled:opacity-50 shadow-none"
        style="box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3); font-family: 'Press Start 2P', 'Courier New', monospace; image-rendering: pixelated;"
      >
        <span v-if="!loading">➕ 添 加</span>
        <span v-else>加 载 中...</span>
      </button>
    </form>
  </div>
</template>
