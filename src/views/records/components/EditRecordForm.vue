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
  (e: 'save'): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function handleSave() {
  emit('save');
}

function handleCancel() {
  emit('cancel');
}
</script>

<template>
  <div class="mb-8 bg-white rounded-none shadow-none overflow-hidden border-4 border-black" style="box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.3); image-rendering: pixelated;">
    <div class="px-6 py-4 bg-blue-400 border-b-4 border-black">
      <h2 class="text-xl font-bold text-gray-900 flex items-center" style="font-family: 'Press Start 2P', 'Courier New', monospace; letter-spacing: 1px;">
        ✏️ EDIT RECORD
      </h2>
    </div>
    
    <form @submit.prevent="handleSave" class="p-6 space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label class="block text-gray-900 font-bold mb-2 text-sm" style="font-family: 'Press Start 2P', 'Courier New', monospace;">
            📅 DATE
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
            📖 SUBJECT
          </label>
          <input
            :value="subject"
            @input="emit('update:subject', ($event.target as HTMLInputElement).value)"
            placeholder="MATH, ENGLISH..."
            required
            class="w-full px-4 py-3 bg-white rounded-none border-4 border-black focus:border-blue-500 focus:outline-none transition-all select-text shadow-none"
            style="font-family: 'Press Start 2P', 'Courier New', monospace; image-rendering: pixelated;"
          />
        </div>
      </div>

      <div>
        <label class="block text-gray-900 font-bold mb-2 text-sm" style="font-family: 'Press Start 2P', 'Courier New', monospace;">
          ⏰ DURATION
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
          <span class="text-gray-900 font-bold" style="font-family: 'Press Start 2P', 'Courier New', monospace;">MIN</span>
        </div>
      </div>

      <div>
        <label class="block text-gray-900 font-bold mb-2 text-sm" style="font-family: 'Press Start 2P', 'Courier New', monospace;">
          💭 NOTES
        </label>
        <textarea
          :value="notes"
          @input="emit('update:notes', ($event.target as HTMLTextAreaElement).value)"
          placeholder="Update your notes..."
          rows="3"
          class="w-full px-4 py-3 bg-white rounded-none border-4 border-black focus:border-blue-500 focus:outline-none transition-all resize-none select-text shadow-none"
          style="font-family: 'Press Start 2P', 'Courier New', monospace; image-rendering: pixelated;"
        ></textarea>
      </div>

      <div class="flex gap-3">
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 bg-blue-500 text-white font-bold py-3 px-6 rounded-none border-4 border-black hover:bg-blue-600 active:translate-x-1 active:translate-y-1 transition-all duration-100 disabled:opacity-50 shadow-none"
          style="box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3); font-family: 'Press Start 2P', 'Courier New', monospace; image-rendering: pixelated;"
        >
          <span v-if="!loading">💾 SAVE</span>
          <span v-else>LOADING...</span>
        </button>
        <button
          type="button"
          @click="handleCancel"
          class="flex-1 bg-red-500 text-white font-bold py-3 px-6 rounded-none border-4 border-black hover:bg-red-600 active:translate-x-1 active:translate-y-1 transition-all duration-100 shadow-none"
          style="box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3); font-family: 'Press Start 2P', 'Courier New', monospace; image-rendering: pixelated;"
        >
          ❌ CANCEL
        </button>
      </div>
    </form>
  </div>
</template>
